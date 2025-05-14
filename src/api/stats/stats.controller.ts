import { Controller, Get } from '@nestjs/common'
import { StatsService } from './stats.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('v1/stats')
@Controller('v1/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get statistics and pattern insights' })
  getStats() {
    return this.statsService.getStats()
  }
}
