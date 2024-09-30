import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Cargar las variables de entorno desde el archivo .env

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://jurissearch.com', // Cambia esto por tu dominio
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Si necesitas enviar cookies o autenticación
  });
  console.log(`Server running on ${3000}`);

  // aumentar memoria de node;

  await app.listen(3000);
}
bootstrap();
