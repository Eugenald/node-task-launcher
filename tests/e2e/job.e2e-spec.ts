import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../app.module'

describe('job create + get (e2e)', () => {
    let app: INestApplication
    let server: any

    beforeAll(async () => {
        const mod = await Test.createTestingModule({ imports: [AppModule] }).compile()

        app = mod.createNestApplication()
        await app.init()

        server = app.getHttpServer()
    })

    afterAll(() => app.close())

    it('POST /v1/jobs → 201 (single)', async () => {
        await request(server)
            .post('/v1/jobs')
            .send({ jobName: 'e2e-job', arguments: [] })
            .expect(201)
    })

    it('GET /v1/jobs → created job finished', async () => {
        const maxAttempts = 5
        const delay = 2_000
        let job: any = null

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const res = await request(server).get('/v1/jobs').expect(200)
            const found = res.body.find((j) => j.name === 'e2e-job')

            if (found && found.status !== 'running') {
                job = found
                break
            }
            await new Promise((r) => setTimeout(r, delay))
        }

        expect(job).toBeDefined()
        expect(['succeeded', 'failed', 'crashed', 'retried']).toContain(job.status)
    })
})
