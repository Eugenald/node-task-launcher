import { Controller, Get } from '@nestjs/common'
import { StatsService } from './stats.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { EstimateStatsService } from './estimate-stats.service'

@ApiTags('v1/stats')
@Controller('v1/stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly estimateStatsService: EstimateStatsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get statistics and pattern insights' })
  getStats() {
    return this.statsService.getStats()
  }

  @Get('estimate')
  @ApiOperation({ summary: 'Statistics based on estimate-cost jobs' })
  getEstimateStats() {
    return this.estimateStatsService.getEstimateStats()
  }
}
