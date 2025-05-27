import { Module } from '@nestjs/common'
import { StatsService } from './stats.service'
import { StatsController } from './stats.controller'
import { JobModule } from '../job/job.module'
import { EstimateStatsService } from './estimate-stats.service'

@Module({
  imports: [JobModule],
  providers: [StatsService, EstimateStatsService],
  controllers: [StatsController],
})
export class StatsModule {}
