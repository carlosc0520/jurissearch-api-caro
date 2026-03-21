// Database Configuration for SQL Server
import * as dotenv from 'dotenv';

// Cargar variables de entorno ANTES de leer process.env
dotenv.config();

export const DATABASE_CONFIG = {
    USER: process.env.DB_USER || '',
    PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE: process.env.DB_NAME || 'JURIS_BD',
    SERVER: process.env.DB_SERVER || 'localhost',
    OPTIONS: {
        ENCRYPT: true,
        TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_CERT !== 'false', // true por defecto
        ENABLE_ARITH_ABORT: true,
        CONNECTION_TIMEOUT: 30000,
        REQUEST_TIMEOUT: 30000,
    },
    POOL: {
        MAX: 10,
        MIN: 0,
        IDLE_TIMEOUT_MILLIS: 30000,
    },
};

// Validar configuración al cargar
export function validateDatabaseConfig(): void {
    const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
    }
}
