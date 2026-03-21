"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const sql = __importStar(require("mssql"));
const database_config_1 = require("../config/database.config");
class DatabaseService {
    static async getPool() {
        if (this.pool && this.pool.connected) {
            return this.pool;
        }
        if (this.isConnecting) {
            await this.waitForConnection(1000);
            return this.getPool();
        }
        this.isConnecting = true;
        try {
            (0, database_config_1.validateDatabaseConfig)();
            const config = {
                user: database_config_1.DATABASE_CONFIG.USER,
                password: database_config_1.DATABASE_CONFIG.PASSWORD,
                database: database_config_1.DATABASE_CONFIG.DATABASE,
                server: database_config_1.DATABASE_CONFIG.SERVER,
                options: {
                    encrypt: database_config_1.DATABASE_CONFIG.OPTIONS.ENCRYPT,
                    trustServerCertificate: database_config_1.DATABASE_CONFIG.OPTIONS.TRUST_SERVER_CERTIFICATE,
                    enableArithAbort: database_config_1.DATABASE_CONFIG.OPTIONS.ENABLE_ARITH_ABORT,
                    connectionTimeout: database_config_1.DATABASE_CONFIG.OPTIONS.CONNECTION_TIMEOUT,
                    requestTimeout: database_config_1.DATABASE_CONFIG.OPTIONS.REQUEST_TIMEOUT,
                    useUTC: true,
                },
                pool: {
                    max: database_config_1.DATABASE_CONFIG.POOL.MAX,
                    min: database_config_1.DATABASE_CONFIG.POOL.MIN,
                    idleTimeoutMillis: database_config_1.DATABASE_CONFIG.POOL.IDLE_TIMEOUT_MILLIS,
                },
            };
            this.pool = await sql.connect(config);
            this.pool.on('error', (err) => {
                this.pool = null;
            });
            return this.pool;
        }
        catch (error) {
            this.pool = null;
            throw new Error(`No se pudo conectar a SQL Server: ${error.message}`);
        }
        finally {
            this.isConnecting = false;
        }
    }
    static async executeStoredProcedure(procedureName, inputs = [], outputs = []) {
        const inputSummary = inputs.map(i => `${i.name}=${i.name.includes('PASSWORD') ? '***' : i.value}`).join(', ');
        try {
            const pool = await this.getPool();
            const request = pool.request();
            inputs.forEach(input => {
                request.input(input.name, input.type, input.value);
            });
            outputs.forEach(output => {
                request.output(output.name, output.type);
            });
            const result = await request.execute(procedureName);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    static async query(queryString, params = []) {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            params.forEach(param => {
                request.input(param.name, param.type, param.value);
            });
            const result = await request.query(queryString);
            return result;
        }
        catch (error) {
            console.error('❌ Error ejecutando query:', error);
            throw error;
        }
    }
    static async close() {
        if (this.pool) {
            try {
                await this.pool.close();
                this.pool = null;
            }
            catch (error) {
                console.error('❌ Error cerrando conexión SQL Server:', error);
            }
        }
    }
    static async reconnect() {
        await this.close();
        await this.getPool();
    }
    static isConnected() {
        return this.pool !== null && this.pool.connected;
    }
    static waitForConnection(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static async testConnection() {
        try {
            const result = await this.query('SELECT 1 AS TEST');
            return result.recordset && result.recordset[0].TEST === 1;
        }
        catch (error) {
            return false;
        }
    }
}
exports.DatabaseService = DatabaseService;
DatabaseService.pool = null;
DatabaseService.isConnecting = false;
//# sourceMappingURL=database.service.js.map