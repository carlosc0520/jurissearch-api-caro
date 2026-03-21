export declare const DATABASE_CONFIG: {
    USER: string;
    PASSWORD: string;
    DATABASE: string;
    SERVER: string;
    OPTIONS: {
        ENCRYPT: boolean;
        TRUST_SERVER_CERTIFICATE: boolean;
        ENABLE_ARITH_ABORT: boolean;
        CONNECTION_TIMEOUT: number;
        REQUEST_TIMEOUT: number;
    };
    POOL: {
        MAX: number;
        MIN: number;
        IDLE_TIMEOUT_MILLIS: number;
    };
};
export declare function validateDatabaseConfig(): void;
