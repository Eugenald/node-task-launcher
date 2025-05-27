export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'crashed' | 'retried'
export type JobType = 'test' | 'estimate-cost'

export interface JobRecord {
  id: string
  type: JobType
  name: string
  args: string[]
  status: JobStatus
  tries: number
  startTime?: Date
  endTime?: Date
  exitCode?: number
  signal?: string | null
  result?: string
}
