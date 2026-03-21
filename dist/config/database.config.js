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
exports.DATABASE_CONFIG = void 0;
exports.validateDatabaseConfig = validateDatabaseConfig;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.DATABASE_CONFIG = {
    USER: process.env.DB_USER || '',
    PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE: process.env.DB_NAME || 'JURIS_BD',
    SERVER: process.env.DB_SERVER || 'localhost',
    OPTIONS: {
        ENCRYPT: true,
        TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_CERT !== 'false',
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
function validateDatabaseConfig() {
    const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
    }
}
//# sourceMappingURL=database.config.js.map