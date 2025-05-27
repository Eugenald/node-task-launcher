import { Module } from '@nestjs/common'
import { JobController } from './job.controller'
import { JobService } from './job.service'
import { JobManagerModule } from '../../../job-manager/job-manager.module'

@Module({
  imports: [JobManagerModule],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
