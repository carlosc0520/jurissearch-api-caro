import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';

import { AppService } from './app.service';

// Modelos Entity
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './services/UserModule';

// Middleware
import { AuthMiddleware } from './middleware/auth.middleware';
import { TokenService } from './services/User/token.service';
import DBS from './config';


@Module({
  imports: [
    TypeOrmModule.forRoot(
      {
        "type": "mssql",
        ...DBS,
        "entities": ["dist/**/*.entity{.ts,.js}"],
        "synchronize": true,
        autoLoadEntities: true,
        extra: {
          trustServerCertificate: true,
        }
      },
    ),
    UserModule,
  ],
  exports: [
    TokenService
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService,
    TokenService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'admin/*',
      method: RequestMethod.ALL,
    });
  }
}
