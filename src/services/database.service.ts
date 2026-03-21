// Database Service for SQL Server Session Management
import * as sql from 'mssql';
import { DATABASE_CONFIG, validateDatabaseConfig } from '../config/database.config';

export class DatabaseService {
    private static pool: sql.ConnectionPool | null = null;
    private static isConnecting: boolean = false;

    /**
     * Obtiene o crea el pool de conexiones a SQL Server
     */
    static async getPool(): Promise<sql.ConnectionPool> {
        // Si ya tenemos un pool activo, devolverlo
        if (this.pool && this.pool.connected) {
            return this.pool;
        }

        // Si se está conectando, esperar
        if (this.isConnecting) {
            await this.waitForConnection(1000);
            return this.getPool();
        }

        // Crear nueva conexión
        this.isConnecting = true;

        try {
            validateDatabaseConfig();

            const config: sql.config = {
                user: DATABASE_CONFIG.USER,
                password: DATABASE_CONFIG.PASSWORD,
                database: DATABASE_CONFIG.DATABASE,
                server: DATABASE_CONFIG.SERVER,
                options: {
                    encrypt: DATABASE_CONFIG.OPTIONS.ENCRYPT,
                    trustServerCertificate: DATABASE_CONFIG.OPTIONS.TRUST_SERVER_CERTIFICATE,
                    enableArithAbort: DATABASE_CONFIG.OPTIONS.ENABLE_ARITH_ABORT,
                    connectionTimeout: DATABASE_CONFIG.OPTIONS.CONNECTION_TIMEOUT,
                    requestTimeout: DATABASE_CONFIG.OPTIONS.REQUEST_TIMEOUT,
                    useUTC: true, // ✅ CRÍTICO: Mantener fechas en UTC sin conversión de zona horaria
                },
                pool: {
                    max: DATABASE_CONFIG.POOL.MAX,
                    min: DATABASE_CONFIG.POOL.MIN,
                    idleTimeoutMillis: DATABASE_CONFIG.POOL.IDLE_TIMEOUT_MILLIS,
                },
            };

            this.pool = await sql.connect(config);

            // Manejar eventos de error
            this.pool.on('error', (err) => {
                this.pool = null;
            });

            return this.pool;
        } catch (error) {
            this.pool = null;
            throw new Error(`No se pudo conectar a SQL Server: ${error.message}`);
        } finally {
            this.isConnecting = false;
        }
    }

    /**
     * Ejecuta un Stored Procedure con parámetros de entrada y salida
     */
    static async executeStoredProcedure(
        procedureName: string,
        inputs: { name: string; type: any; value: any }[] = [],
        outputs: { name: string; type: any }[] = []
    ): Promise<any> {
        // Log de inicio con parámetros (sin valores sensibles)
        const inputSummary = inputs.map(i => `${i.name}=${i.name.includes('PASSWORD') ? '***' : i.value}`).join(', ');

        try {
            const pool = await this.getPool();
            const request = pool.request();

            // Agregar parámetros de entrada
            inputs.forEach(input => {
                request.input(input.name, input.type, input.value);
            });

            // Agregar parámetros de salida
            outputs.forEach(output => {
                request.output(output.name, output.type);
            });

            // Ejecutar stored procedure
            const result = await request.execute(procedureName);


            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Ejecuta una consulta SQL directa
     */
    static async query(queryString: string, params: { name: string; type: any; value: any }[] = []): Promise<any> {
        try {
            const pool = await this.getPool();
            const request = pool.request();

            // Agregar parámetros
            params.forEach(param => {
                request.input(param.name, param.type, param.value);
            });

            const result = await request.query(queryString);
            return result;
        } catch (error) {
            console.error('❌ Error ejecutando query:', error);
            throw error;
        }
    }

    /**
     * Cierra el pool de conexiones
     */
    static async close(): Promise<void> {
        if (this.pool) {
            try {
                await this.pool.close();
                this.pool = null;
            } catch (error) {
                console.error('❌ Error cerrando conexión SQL Server:', error);
            }
        }
    }

    /**
     * Fuerza el cierre y reconexión del pool (útil para aplicar cambios de configuración)
     */
    static async reconnect(): Promise<void> {
        await this.close();
        await this.getPool();
    }

    /**
     * Verifica si la conexión está activa
     */
    static isConnected(): boolean {
        return this.pool !== null && this.pool.connected;
    }

    /**
     * Helper: Esperar X milisegundos
     */
    private static waitForConnection(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Prueba la conexión ejecutando una consulta simple
     */
    static async testConnection(): Promise<boolean> {
        try {
            const result = await this.query('SELECT 1 AS TEST');
            return result.recordset && result.recordset[0].TEST === 1;
        } catch (error) {
            return false;
        }
    }
}
