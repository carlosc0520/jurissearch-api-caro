import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  dotenv.config(); // Cargar las variables de entorno desde el archivo .env

  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '100mb' }));  // Para JSON
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));  // Para URL-encoded data

  // app.enableCors({
  //   origin: 'https://jurissearch.com', // Cambia esto por tu dominio
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true, // Si necesitas enviar cookies o autenticación
  // });
  app.enableCors({
    origin: '*', // Permitir cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Habilita cookies y credenciales
  });

  // aumentar memoria de node;

  
  await app.listen(3000);
}
bootstrap();
