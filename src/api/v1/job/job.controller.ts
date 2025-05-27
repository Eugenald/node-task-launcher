import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger'
import { JobService } from './job.service'
import { CreateJobDto } from './dto/create-job.dto'

@ApiTags('v1/jobs')
@Controller('v1/jobs')
export class JobController {
  constructor(private readonly jobsService: JobService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new job' })
  async createJob(@Body() dto: CreateJobDto) {
    const jobId = await this.jobsService.create(dto.jobName, dto.arguments)
    return { jobId }
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  getAllJobs() {
    return this.jobsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job ID' })
  getJob(@Param('id') id: string) {
    return this.jobsService.findById(id)
  }
}
