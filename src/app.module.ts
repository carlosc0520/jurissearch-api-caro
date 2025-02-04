  import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
  import { AppController } from './app.controller';

  import { AppService } from './app.service';

  // Modelos Entity
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { UserModule } from './services/UserModule';

  // Middleware
  import { AuthMiddleware } from './middleware/auth.middleware';
  import { TokenService } from './services/User/token.service';

  @Module({
    imports: [
      TypeOrmModule.forRoot(
        {
          // * en aws
          // "type": "mssql",
          // "host": "database-caro.crudeh2irmny.us-east-1.rds.amazonaws.com",
          // "port": 1433,
          // "username": "admin",
          // "password": "lo9T@Y[6!xq^lXk<N9H*]S+g49D:",
          // "database": "JURIS_SEARCH",
          // "entities": ["dist/**/*.entity{.ts,.js}"],
          // "synchronize": true,
          // autoLoadEntities: true,
          // extra: {
          //   trustServerCertificate: true,
          // }
          "type": "mssql",
          "host": "SQL1002.site4now.net",
          "port": 1433,
          "username": "db_ab1d37_jurissearch_admin",
        "password": "jurissearch123",
        "database": "db_ab1d37_jurissearch",
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
