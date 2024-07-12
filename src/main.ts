import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Cargar las variables de entorno desde el archivo .env

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log(`Server running on ${3001}`)

  // aumentar memoria de node;
  

  await app.listen(3001);
}
bootstrap();
