import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  dotenv.config(); // Cargar las variables de entorno desde el archivo .env

  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));  // Para JSON
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));  // Para URL-encoded data

  // app.enableCors({
  //   origin: 'https://jurissearch.com', // Cambia esto por tu dominio
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true, // Si necesitas enviar cookies o autenticación
  // });
  app.enableCors();
  console.log(`Server running on ${3000}`);

  // aumentar memoria de node;

  await app.listen(3000);
}
bootstrap();
