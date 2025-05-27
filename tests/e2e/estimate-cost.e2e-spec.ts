import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../app.module'

function makeJob(userId: string, products: { name: string, quantity: number }[]) {
    return { userId, products }
}

function randomAlcohol(): { name: string; quantity: number } | null {
    const list = [
        { name: 'beer', quantity: 1 },
        { name: 'wine', quantity: 0.5 },
        { name: 'vodka', quantity: 0.3 },
        { name: 'whiskey', quantity: 0.3 },
        { name: 'rum', quantity: 0.4 },
        { name: 'gin', quantity: 0.5 }
    ]
    return Math.random() < 0.3 ? list[Math.floor(Math.random() * list.length)] : null
}

function repeatJobs(userPrefix: string, users: number, template: (() => { name: string, quantity: number }[])[]): any[] {
    const jobs = []
    for (let i = 1; i <= users; i++) {
        const uid = `${userPrefix}${i}`
        for (let t of template) {
            const base = t()
            const alc = randomAlcohol()
            if (alc) base.push(alc)
            jobs.push(makeJob(uid, base))
        }
    }
    return jobs
}

const mockJobs = [
    ...repeatJobs('vegan', 10, [
        () => [ { name: 'banana', quantity: 3 }, { name: 'apple', quantity: 2 }, { name: 'tea', quantity: 1 }, { name: 'oats', quantity: 0.5 }, { name: 'water', quantity: 2 } ],
        () => [ { name: 'juice', quantity: 1 }, { name: 'rice', quantity: 1 }, { name: 'banana', quantity: 1 }, { name: 'cucumber', quantity: 1 }, { name: 'grape', quantity: 1 } ],
        () => [ { name: 'apple', quantity: 3 }, { name: 'peach', quantity: 2 }, { name: 'tea', quantity: 1 }, { name: 'watermelon', quantity: 1 }, { name: 'juice', quantity: 1 } ],
        () => [ { name: 'banana', quantity: 1 }, { name: 'quinoa', quantity: 0.5 }, { name: 'apple', quantity: 2 }, { name: 'lemon', quantity: 1 }, { name: 'mineral water', quantity: 1 } ],
        () => [ { name: 'orange', quantity: 2 }, { name: 'tea', quantity: 1 }, { name: 'grape', quantity: 2 }, { name: 'juice', quantity: 1 }, { name: 'water', quantity: 1 } ],
        () => [ { name: 'banana', quantity: 2 }, { name: 'juice', quantity: 2 }, { name: 'rice', quantity: 1 }, { name: 'carrot', quantity: 1 }, { name: 'broccoli', quantity: 1 } ],
        () => [ { name: 'apple', quantity: 2 }, { name: 'banana', quantity: 1 }, { name: 'tea', quantity: 1 }, { name: 'orange', quantity: 2 }, { name: 'grape', quantity: 1 } ],
        () => [ { name: 'juice', quantity: 2 }, { name: 'oats', quantity: 1 }, { name: 'water', quantity: 1 }, { name: 'banana', quantity: 1 }, { name: 'apple', quantity: 1 } ],
        () => [ { name: 'cucumber', quantity: 1 }, { name: 'tomato', quantity: 2 }, { name: 'apple', quantity: 1 }, { name: 'banana', quantity: 1 }, { name: 'water', quantity: 1 } ],
        () => [ { name: 'tea', quantity: 1 }, { name: 'grape', quantity: 1 }, { name: 'banana', quantity: 2 }, { name: 'rice', quantity: 1 }, { name: 'apple', quantity: 2 } ],
    ]),

    ...repeatJobs('vegetarian', 10, [
        () => [ { name: 'milk', quantity: 1 }, { name: 'bread', quantity: 2 }, { name: 'yogurt', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'cheese', quantity: 1 } ],
        () => [ { name: 'milk', quantity: 1 }, { name: 'oats', quantity: 1 }, { name: 'yogurt', quantity: 1 }, { name: 'juice', quantity: 1 }, { name: 'egg', quantity: 2 } ],
        () => [ { name: 'bread', quantity: 1 }, { name: 'butter', quantity: 0.5 }, { name: 'cheese', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'milk', quantity: 1 } ],
        () => [ { name: 'kefir', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'yogurt', quantity: 1 }, { name: 'tea', quantity: 1 }, { name: 'bread', quantity: 1 } ],
        () => [ { name: 'egg', quantity: 3 }, { name: 'milk', quantity: 1 }, { name: 'butter', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'bread', quantity: 1 } ],
        () => [ { name: 'cream', quantity: 1 }, { name: 'milk', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'oats', quantity: 1 }, { name: 'tea', quantity: 1 } ],
        () => [ { name: 'yogurt', quantity: 2 }, { name: 'milk', quantity: 1 }, { name: 'bread', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'egg', quantity: 1 } ],
        () => [ { name: 'butter', quantity: 1 }, { name: 'milk', quantity: 1 }, { name: 'kefir', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'tea', quantity: 1 } ],
        () => [ { name: 'milk', quantity: 1 }, { name: 'yogurt', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'bread', quantity: 2 }, { name: 'cheese', quantity: 1 } ],
        () => [ { name: 'cheese', quantity: 1 }, { name: 'cream', quantity: 1 }, { name: 'bread', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'milk', quantity: 1 } ],
    ]),

    ...repeatJobs('meat', 10, [
        () => [ { name: 'chicken', quantity: 1 }, { name: 'beer', quantity: 2 }, { name: 'bread', quantity: 1 }, { name: 'potato', quantity: 2 }, { name: 'kefir', quantity: 1 } ],
        () => [ { name: 'beef', quantity: 1 }, { name: 'vodka', quantity: 0.5 }, { name: 'rice', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'tomato', quantity: 1 } ],
        () => [ { name: 'pork', quantity: 1 }, { name: 'wine', quantity: 0.5 }, { name: 'bread', quantity: 1 }, { name: 'potato', quantity: 1 }, { name: 'egg', quantity: 1 } ],
        () => [ { name: 'duck', quantity: 1 }, { name: 'rum', quantity: 1 }, { name: 'carrot', quantity: 1 }, { name: 'salt', quantity: 0.1 }, { name: 'cheese', quantity: 1 } ],
        () => [ { name: 'turkey', quantity: 1 }, { name: 'beer', quantity: 1 }, { name: 'buckwheat', quantity: 1 }, { name: 'egg', quantity: 1 }, { name: 'pepper', quantity: 0.5 } ],
        () => [ { name: 'chicken', quantity: 1 }, { name: 'wine', quantity: 0.7 }, { name: 'bread', quantity: 1 }, { name: 'rice', quantity: 1 }, { name: 'kefir', quantity: 1 } ],
        () => [ { name: 'beef', quantity: 1 }, { name: 'vodka', quantity: 0.5 }, { name: 'cheese', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'potato', quantity: 2 } ],
        () => [ { name: 'pork', quantity: 1 }, { name: 'whiskey', quantity: 1 }, { name: 'bread', quantity: 1 }, { name: 'salt', quantity: 0.1 }, { name: 'butter', quantity: 1 } ],
        () => [ { name: 'lamb', quantity: 1 }, { name: 'rum', quantity: 0.5 }, { name: 'rice', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'egg', quantity: 1 } ],
        () => [ { name: 'duck', quantity: 1 }, { name: 'beer', quantity: 1 }, { name: 'pepper', quantity: 0.5 }, { name: 'carrot', quantity: 1 }, { name: 'butter', quantity: 1 } ],
    ]),

    ...repeatJobs('mixed', 10, [
        () => [ { name: 'egg', quantity: 2 }, { name: 'banana', quantity: 2 }, { name: 'whiskey', quantity: 1 }, { name: 'tea', quantity: 1 }, { name: 'cheese', quantity: 1 } ],
        () => [ { name: 'milk', quantity: 1 }, { name: 'vodka', quantity: 1 }, { name: 'cucumber', quantity: 1 }, { name: 'rice', quantity: 1 }, { name: 'apple', quantity: 1 } ],
        () => [ { name: 'oats', quantity: 1 }, { name: 'yogurt', quantity: 1 }, { name: 'egg', quantity: 1 }, { name: 'gin', quantity: 1 }, { name: 'grape', quantity: 1 } ],
        () => [ { name: 'butter', quantity: 1 }, { name: 'water', quantity: 1 }, { name: 'banana', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'vodka', quantity: 0.5 } ],
        () => [ { name: 'chicken', quantity: 1 }, { name: 'milk', quantity: 1 }, { name: 'egg', quantity: 1 }, { name: 'tea', quantity: 1 }, { name: 'rum', quantity: 0.5 } ],
        () => [ { name: 'grape', quantity: 1 }, { name: 'yogurt', quantity: 1 }, { name: 'vodka', quantity: 0.5 }, { name: 'bread', quantity: 1 }, { name: 'egg', quantity: 1 } ],
        () => [ { name: 'chicken', quantity: 1 }, { name: 'cheese', quantity: 1 }, { name: 'rice', quantity: 1 }, { name: 'milk', quantity: 1 }, { name: 'beer', quantity: 1 } ],
        () => [ { name: 'milk', quantity: 1 }, { name: 'whiskey', quantity: 1 }, { name: 'egg', quantity: 2 }, { name: 'bread', quantity: 1 }, { name: 'oats', quantity: 1 } ],
        () => [ { name: 'banana', quantity: 1 }, { name: 'rice', quantity: 1 }, { name: 'milk', quantity: 1 }, { name: 'vodka', quantity: 0.5 }, { name: 'cheese', quantity: 1 } ],
        () => [ { name: 'duck', quantity: 1 }, { name: 'tea', quantity: 1 }, { name: 'grape', quantity: 1 }, { name: 'yogurt', quantity: 1 }, { name: 'rum', quantity: 0.5 } ],
    ]),
];


describe('Stats for estimate-cost jobs (e2e)', () => {
    let app: INestApplication

    const createJob = (userId: string, products: { name: string; quantity: number }[]) => {
        return request(app.getHttpServer())
            .post('/v1/jobs')
            .send({
                jobName: 'estimate-cost',
                arguments: [
                    JSON.stringify({ userId, products }),
                ],
            })
    }

    beforeAll(async () => {
        process.env.TASK = 'estimate-cost.js'
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = module.createNestApplication()
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    it('creates 40 estimate-cost jobs and returns aggregated statistics', async () => {
        for (const job of mockJobs) {
            await createJob(job.userId, job.products).expect(201)
        }

        await new Promise((r) => setTimeout(r, 4000))

        const statsRes = await request(app.getHttpServer())
            .get('/v1/stats/estimate')
            .expect(200)

        const stats = statsRes.body
        expect(stats).toBeDefined()
        console.log(stats)

        expect(stats.totalUsers).toBeGreaterThanOrEqual(40)
    })
})
