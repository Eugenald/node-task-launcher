import { Inject, Injectable } from '@nestjs/common'
import { JOB_STORE_TOKEN } from '../../job-execution-store/job-store.module'
import { JobStore } from '../../job-execution-store/types/job-store.interface'
import { JobRecord } from '../../common/job.types'
import { StatsResponseDto } from './dto/stats.dto'

@Injectable()
export class StatsService {
  constructor(@Inject(JOB_STORE_TOKEN) private readonly store: JobStore) {}

  async getStats(): Promise<StatsResponseDto> {
    const jobs = await this.store.findAll()
    const totalJobs = jobs.length
    const overallSuccessRate = this.rate(jobs)

    const analyzers: { id: string; fn: (j: JobRecord) => boolean }[] = [
      { id: 'Name length > 10', fn: (j) => j.name.length > 10 },
      { id: 'Name has digits', fn: (j) => /\d/.test(j.name) },
      { id: 'No arguments', fn: (j) => j.args.length === 0 },
      { id: 'Retried at least once', fn: (j) => j.tries > 1 },
      {
        id: 'Ran at night (22-06)',
        fn: (j) => {
          const h = j.startTime?.getHours()
          return h !== undefined && (h >= 22 || h < 6)
        },
      },
    ]

    const patterns = analyzers.map(({ id, fn }) => {
      const subset = jobs.filter(fn)
      const diffPct = (this.rate(subset) - overallSuccessRate) * 100
      const diffStr =
        (diffPct > 0 ? '+' : diffPct < 0 ? '' : '') + // знак «+» только для положительных
        `${Math.round(diffPct)}%`
      return {
        name: id,
        matchCount: subset.length,
        successRate: Number(this.rate(subset).toFixed(2)),
        differenceFromAverage: diffStr,
      }
    })

    return { totalJobs, overallSuccessRate, patterns }
  }

  private rate(arr: JobRecord[]): number {
    if (!arr.length) return 0
    return arr.filter((j) => j.status === 'succeeded').length / arr.length
  }
}
