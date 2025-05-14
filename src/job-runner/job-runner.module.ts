import { Module } from '@nestjs/common'
import { JobRunnerService } from './job-runner.service'

@Module({
  providers: [JobRunnerService],
  exports: [JobRunnerService],
})
export class JobRunnerModule {}
