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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const entorno = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV';
const DBS = {
    "DEV": {
        "host": process.env.DB_SERVER || "SQL5110.site4now.net",
        "port": parseInt(process.env.DB_PORT || "1433"),
        "username": process.env.DB_USER || "db_ac769b_jurisearchprueba_admin",
        "password": process.env.DB_PASSWORD || "O18Z1NIISXL2",
        "database": process.env.DB_NAME || "db_ac769b_jurisearchprueba",
    },
    "PROD": {
        "host": process.env.DB_SERVER || "SQL5113.site4now.net",
        "port": parseInt(process.env.DB_PORT || "1433"),
        "username": process.env.DB_USER || "db_ac769b_jurissearchpro_admin",
        "password": process.env.DB_PASSWORD || "O18Z1NIISXL2",
        "database": process.env.DB_NAME || "db_ac769b_jurissearchpro",
    }
};
exports.default = DBS[entorno];
//# sourceMappingURL=config.js.map