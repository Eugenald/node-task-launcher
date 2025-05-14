import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  })

  const configService = app.get(ConfigService)

  const host = configService.get<string>('host')
  const port = configService.get<number>('port')

  const config = new DocumentBuilder()
    .setTitle('Node C++ Task Launcher')
    .setDescription('Service for spawning and tracking native C++ tasks')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(port, host)
}
bootstrap()
