import { DynamicModule, Module, Global } from '@nestjs/common'
import { InMemoryJobStoreService } from './in-memory-job-store.service'
import { RedisJobStoreService } from './redis-job-store.service'

export interface JobStoreOptions {
  driver: 'memory' | 'redis'
}

export const JOB_STORE_TOKEN = 'JOB_STORE_TOKEN'

@Global()
@Module({})
export class JobStoreModule {
  static forRoot({ driver }: JobStoreOptions = { driver: 'memory' }): DynamicModule {
    const useClass = driver === 'redis' ? RedisJobStoreService : InMemoryJobStoreService

    return {
      module: JobStoreModule,
      providers: [
        {
          provide: JOB_STORE_TOKEN,
          useClass,
        },
      ],
      exports: [JOB_STORE_TOKEN],
    }
  }
}
