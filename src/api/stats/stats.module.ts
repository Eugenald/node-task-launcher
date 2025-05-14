import { Module } from '@nestjs/common'
import { StatsService } from './stats.service'
import { StatsController } from './stats.controller'
import { JobModule } from '../job/job.module'

@Module({
  imports: [JobModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
