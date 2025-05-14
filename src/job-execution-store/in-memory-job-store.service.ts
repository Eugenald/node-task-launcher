import { Injectable } from '@nestjs/common'
import { JobStore } from './types/job-store.interface'
import { JobRecord } from '../common/job.types'

@Injectable()
export class InMemoryJobStoreService implements JobStore {
  private readonly map = new Map<string, JobRecord>()

  async save(job: JobRecord) {
    this.map.set(job.id, job)
  }

  async findById(id: string) {
    return this.map.get(id)
  }

  async findAll() {
    return Array.from(this.map.values())
  }

  async update(job: JobRecord) {
    this.map.set(job.id, job)
  }
}
