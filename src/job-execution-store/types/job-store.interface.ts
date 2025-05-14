import { JobRecord } from '../../common/job.types'

export interface JobStore {
  save(job: JobRecord): Promise<void>
  findById(id: string): Promise<JobRecord | undefined>
  findAll(): Promise<JobRecord[]>
  update(job: JobRecord): Promise<void>
}
