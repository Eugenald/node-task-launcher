import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateJobDto {
  @ApiProperty({ example: 'dummy_job.bat' })
  @IsString()
  @IsNotEmpty()
  jobName: string

  @ApiProperty({ type: [String], example: ['arg1', 'arg2'], required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  arguments?: string[]
}
