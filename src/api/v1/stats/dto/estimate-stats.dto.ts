export interface EstimateStatsResponseDto {
  totalUsers: number
  groupsPercent: {
    vegan: string
    vegetarian: string
    meat: string
  }
  groupAlcoholAvg: {
    vegan: string
    vegetarian: string
    meat: string
  }
  groupDiversityAvg: {
    vegan: string
    vegetarian: string
    meat: string
  }
  groupSoftDrinkRatio: {
    vegan: string
    vegetarian: string
    meat: string
  }
  groupBreakfastSkipProb: {
    vegan: string
    vegetarian: string
    meat: string
  }
}
