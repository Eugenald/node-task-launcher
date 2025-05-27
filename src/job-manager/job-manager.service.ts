import { Injectable, Inject, Logger } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { Sema } from 'async-sema'
import { ConfigService } from '@nestjs/config'

import { JobRunnerService } from '../job-runner/job-runner.service'
import { JobRecord } from '../common/job.types'
import { JOB_STORE_TOKEN } from '../job-execution-store/job-store.module'
import { JobStore } from '../job-execution-store/types/job-store.interface'

@Injectable()
export class JobManagerService {
  private readonly log = new Logger(JobManagerService.name)
  private taskFileName = this.cfg.get<string>('job.task')
  private readonly gate: Sema

  constructor(
    private readonly runner: JobRunnerService,
    private readonly cfg: ConfigService,
    @Inject(JOB_STORE_TOKEN) private readonly store: JobStore,
  ) {
    const maxParallel = this.cfg.get<number>('job.maxParallel', 4)
    this.gate = new Sema(maxParallel)
  }

  async create(name: string, args: string[] = []): Promise<string> {
    const id = uuid()
    const type = this.taskFileName.includes('estimate-cost.js') ? 'estimate-cost' : 'test'

    const job: JobRecord = {
      id,
      name,
      type,
      args,
      status: 'queued',
      tries: 1,
    }

    await this.store.save(job)

    void this.enqueue(job)

    return id
  }

  findAll(): Promise<JobRecord[]> {
    return this.store.findAll()
  }

  findById(id: string): Promise<JobRecord> {
    return this.store.findById(id)
  }

  private async enqueue(job: JobRecord) {
    await this.gate.acquire()
    this.execute(job)
      .catch((e) => this.log.error(`Unexpected error for ${job.id}: ${e}`))
      .finally(() => this.gate.release())
  }

  private async execute(job: JobRecord) {
    job.status = 'running'
    job.startTime = new Date()
    await this.store.update(job)

    try {
      const { exitCode, signal, stdout } = await this.runner.run(job.args)
      await this.handleResult(job, exitCode, signal, stdout)
    } catch (err) {
      this.log.error(`Spawn error for ${job.id}: ${err.message}`)
      await this.handleResult(job, null, 'spawn-error')
    }
  }

  private async handleResult(job: JobRecord, exitCode?: number, signal?: string, stdout?: string) {
    job.exitCode = exitCode ?? undefined
    job.signal = signal ?? null
    job.endTime = new Date()
    job.result = stdout

    switch (exitCode) {
      case 0:
        job.status = 'succeeded'
        break
      case 1:
        job.status = 'failed'
        break
      default:
        job.status = 'crashed'
        break
    }
    if (signal) job.status = 'crashed'

    await this.store.update(job)

    if (['failed', 'crashed'].includes(job.status) && job.tries === 1) {
      job.tries = 2
      job.status = 'retried'
      await this.store.update(job)
      void this.enqueue(job)
    }

    this.log.log(`Job ${job.id} → ${job.status} (exit=${exitCode ?? 'null'})`)
  }
}
