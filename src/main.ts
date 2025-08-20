import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';
import { GenericExceptionsFilter } from './core/exceptions/generic.exception';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalFilters(new GenericExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('FitnessBE')
    .setDescription('The Fitness BE API description')
    .setVersion('1.0')
    .addTag('Fitness')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.register(helmet);
  await app.register(fastifyCsrf);
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
