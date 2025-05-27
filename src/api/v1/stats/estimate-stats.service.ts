import { Inject, Injectable } from '@nestjs/common'
import { JOB_STORE_TOKEN } from '../../../job-execution-store/job-store.module'
import { JobStore } from '../../../job-execution-store/types/job-store.interface'
import { EstimateStatsResponseDto } from './dto/estimate-stats.dto'

@Injectable()
export class EstimateStatsService {
  constructor(@Inject(JOB_STORE_TOKEN) private readonly store: JobStore) {}

  private readonly meat = new Set(['chicken', 'beef', 'pork', 'lamb', 'duck', 'turkey'])
  private readonly dairyEgg = new Set([
    'milk',
    'cheese',
    'butter',
    'yogurt',
    'kefir',
    'sour cream',
    'cottage cheese',
    'cream',
    'egg',
  ])
  private readonly alcohol = new Set(['beer', 'wine', 'vodka', 'whiskey', 'rum', 'gin'])
  private readonly waterLike = new Set(['water', 'mineral water'])
  private readonly softDrink = new Set(['soda', 'juice', 'cola', 'lemonade'])
  private readonly breakfastTag = new Set([
    'milk',
    'oats',
    'egg',
    'bread',
    'butter',
    'yogurt',
    'coffee',
    'tea',
  ])

  private pct(n: number, total: number) {
    return total ? `${((n / total) * 100).toFixed(1)}%` : '0%'
  }
  private num(n: number) {
    return n.toFixed(2)
  }
  private ratioPct(n: number) {
    return `${(n * 100).toFixed(1)}%`
  }

  async getEstimateStats(): Promise<EstimateStatsResponseDto> {
    const jobs = (await this.store.findAll()).filter(
      (j) => j.type === 'estimate-cost' && j.status === 'succeeded' && j.result,
    )

    const users = new Map<
      string,
      {
        jobs: number
        uni: Set<string>
        meat: boolean
        dairy: boolean
        alc: number
        breakfastHits: number
        water: number
        soft: number
      }
    >()

    for (const j of jobs) {
      let parsed: any
      try {
        parsed = JSON.parse(j.result!)
      } catch {
        continue
      }
      const uid = parsed.userId ?? 'anon'
      if (!users.has(uid))
        users.set(uid, {
          jobs: 0,
          uni: new Set(),
          meat: false,
          dairy: false,
          alc: 0,
          breakfastHits: 0,
          water: 0,
          soft: 0,
        })
      const u = users.get(uid)!
      u.jobs++
      let breakfastFlag = false
      for (const it of parsed.items) {
        const n = it.name.toLowerCase()
        u.uni.add(n)
        if (this.meat.has(n)) u.meat = true
        if (this.dairyEgg.has(n)) u.dairy = true
        if (this.alcohol.has(n)) u.alc += it.quantity
        if (this.waterLike.has(n)) u.water += it.quantity
        if (this.softDrink.has(n)) u.soft += it.quantity
        if (this.breakfastTag.has(n)) breakfastFlag = true
      }
      if (breakfastFlag) u.breakfastHits++
    }

    const group: {
      [k in 'vegan' | 'vegetarian' | 'meat']: {
        cnt: number
        alc: number
        div: number
        softWater: number
        brkSkip: number
      }
    } = {
      vegan: { cnt: 0, alc: 0, div: 0, softWater: 0, brkSkip: 0 },
      vegetarian: { cnt: 0, alc: 0, div: 0, softWater: 0, brkSkip: 0 },
      meat: { cnt: 0, alc: 0, div: 0, softWater: 0, brkSkip: 0 },
    }

    users.forEach((u) => {
      const diversity = u.uni.size / u.jobs
      const softWaterRatio = u.water ? u.soft / u.water : 0
      const brkSkip = 1 - u.breakfastHits / u.jobs
      const diet = u['meat'] ? 'meat' : u['dairy'] ? 'vegetarian' : 'vegan'
      const g = group[diet]
      g.cnt++
      g.alc += u.alc
      g.div += diversity
      g.softWater += softWaterRatio
      g.brkSkip += brkSkip
    })

    const total = group.vegan.cnt + group.vegetarian.cnt + group.meat.cnt
    const avg = (s: number, c: number) => (c ? s / c : 0)

    return {
      totalUsers: total,
      groupsPercent: {
        vegan: this.pct(group.vegan.cnt, total),
        vegetarian: this.pct(group.vegetarian.cnt, total),
        meat: this.pct(group.meat.cnt, total),
      },
      groupAlcoholAvg: {
        vegan: this.num(avg(group.vegan.alc, group.vegan.cnt)),
        vegetarian: this.num(avg(group.vegetarian.alc, group.vegetarian.cnt)),
        meat: this.num(avg(group.meat.alc, group.meat.cnt)),
      },
      groupDiversityAvg: {
        vegan: this.num(avg(group.vegan.div, group.vegan.cnt)),
        vegetarian: this.num(avg(group.vegetarian.div, group.vegetarian.cnt)),
        meat: this.num(avg(group.meat.div, group.meat.cnt)),
      },
      groupSoftDrinkRatio: {
        vegan: this.num(avg(group.vegan.softWater, group.vegan.cnt)),
        vegetarian: this.num(avg(group.vegetarian.softWater, group.vegetarian.cnt)),
        meat: this.num(avg(group.meat.softWater, group.meat.cnt)),
      },
      groupBreakfastSkipProb: {
        vegan: this.ratioPct(avg(group.vegan.brkSkip, group.vegan.cnt)),
        vegetarian: this.ratioPct(avg(group.vegetarian.brkSkip, group.vegetarian.cnt)),
        meat: this.ratioPct(avg(group.meat.brkSkip, group.meat.cnt)),
      },
    }
  }
}
