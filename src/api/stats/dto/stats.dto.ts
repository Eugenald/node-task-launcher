import { ApiProperty } from '@nestjs/swagger'

export class PatternInsightDto {
  @ApiProperty({ example: 'Name longer than 10' })
  name!: string

  @ApiProperty({ example: 5 })
  matchCount!: number

  @ApiProperty({ example: 0.6 })
  successRate!: number

  @ApiProperty({ example: '10%' })
  differenceFromAverage!: string
}

export class StatsResponseDto {
  @ApiProperty({ example: 10 })
  totalJobs!: number

  @ApiProperty({ example: 0.7 })
  overallSuccessRate!: number

  @ApiProperty({ type: [PatternInsightDto] })
  patterns!: PatternInsightDto[]
}
