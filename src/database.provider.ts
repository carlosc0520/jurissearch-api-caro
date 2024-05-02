import { DataSource } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: 'database-caro.crudeh2irmny.us-east-1.rds.amazonaws.com',
                port: 1433,
                username: 'admin',
                password: '123456789',
                database: 'JURIS_SEARCH',
                entities: [
                    __dirname + '/../**/*.entity{.ts,.js}',
                ],
                synchronize: true,
            });

            return dataSource.initialize();
        },
    },
];