import { Module } from '@nestjs/common'
import { JobManagerService } from './job-manager.service'
import { JobRunnerModule } from '../job-runner/job-runner.module'
import { JobStoreModule } from '../job-execution-store/job-store.module'

@Module({
  imports: [JobRunnerModule, JobStoreModule],
  providers: [JobManagerService],
  exports: [JobManagerService],
})
export class JobManagerModule {}
