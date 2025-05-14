import { Controller, Post, Body, Get } from '@nestjs/common'
import { JobService } from './job.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { CreateJobDto } from './dto/create-job.dto'

@ApiTags('v1/jobs')
@Controller('v1/jobs')
export class JobController {
  constructor(private readonly jobsService: JobService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new job' })
  createJob(@Body() dto: CreateJobDto) {
    const jobId = this.jobsService.create(dto.jobName, dto.arguments)
    return { jobId }
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  getAllJobs() {
    return this.jobsService.findAll()
  }
}
