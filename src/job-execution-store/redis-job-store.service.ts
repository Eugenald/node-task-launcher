import { Injectable, Logger } from '@nestjs/common'
import { JobStore } from './types/job-store.interface'
import { JobRecord } from '../common/job.types'

@Injectable()
export class RedisJobStoreService implements JobStore {
  private readonly log = new Logger(RedisJobStoreService.name)

  async save(job: JobRecord) {
    this.log.warn('Redis not implemented')
  }
  async findById(id: string) {
    this.log.warn('Redis not implemented')
    return undefined
  }
  async findAll() {
    this.log.warn('Redis not implemented')
    return []
  }
  async update(job: JobRecord) {
    this.log.warn('Redis not implemented')
  }
}
