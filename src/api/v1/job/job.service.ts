import { Injectable } from '@nestjs/common'
import { JobManagerService } from '../../../job-manager/job-manager.service'
import { JobRecord } from '../../../common/job.types'

@Injectable()
export class JobService {
  constructor(private readonly jobManager: JobManagerService) {}

  async create(name: string, args: string[] = []): Promise<string> {
    return await this.jobManager.create(name, args)
  }

  async findAll(): Promise<JobRecord[]> {
    return await this.jobManager.findAll()
  }

  async findById(id: string): Promise<JobRecord> {
    return await this.jobManager.findById(id)
  }
}
