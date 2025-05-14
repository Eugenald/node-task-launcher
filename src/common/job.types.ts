export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'crashed' | 'retried'

export interface JobRecord {
  id: string
  name: string
  args: string[]
  status: JobStatus
  tries: number
  startTime?: Date
  endTime?: Date
  exitCode?: number
  signal?: string | null
}
