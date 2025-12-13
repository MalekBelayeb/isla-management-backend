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
import { config } from './core/config';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalFilters(new GenericExceptionsFilter());

  const configOAI = new DocumentBuilder()
    .setTitle('IslaManagementBE')
    .setDescription('The Isla Management BE API description')
    .setVersion('1.0')
    .addTag('IslaManagementSystem')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, configOAI);
  SwaggerModule.setup('api', app, documentFactory);

  await app.register(fastifyCookie, {
    secret: config.JWT_SECRET, // Optional: used for signed cookies
  });

  await app.register(helmet);
  await app.register(fastifyCsrf);
  app.enableCors({
    origin: ['https://backoffice.isla-immobiliere.tn', 'http://localhost:4300'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
