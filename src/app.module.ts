import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { AppService } from './app.service';

// Modelos Entity
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './services/UserModule';


@Module({
  imports: [
    TypeOrmModule.forRoot(
      {
        "type": "mssql",
        "host": "database-caro.crudeh2irmny.us-east-1.rds.amazonaws.com",
        "port": 1433,
        "username": "admin",
        "password": "123456789",
        "database": "JURIS_SEARCH",
        "entities": ["dist/**/*.entity{.ts,.js}"],
        "synchronize": true,
        autoLoadEntities: true,
        extra: {
          trustServerCertificate: true,
        }
      },
    ),
    UserModule
  ],
  exports: [
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
