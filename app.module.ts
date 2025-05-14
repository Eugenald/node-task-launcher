import { Module } from '@nestjs/common'
import { StatsModule } from './src/api/stats/stats.module'
import { JobRunnerModule } from './src/job-runner/job-runner.module'
import { ConfigModule } from '@nestjs/config'
import appconfig from './src/appconfig'
import { JobStoreModule } from './src/job-execution-store/job-store.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appconfig],
    }),
    JobStoreModule.forRoot({
      driver: (process.env.JOB_DRIVER || 'memory') as 'memory' | 'redis',
    }),
    StatsModule,
    JobRunnerModule,
  ],
})
export class AppModule {}
