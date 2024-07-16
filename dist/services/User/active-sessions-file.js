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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeActiveSessionsToFile = exports.readActiveSessionsFromFile = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SESSIONS_FILE_PATH = path.join(__dirname, 'active-sessions.json');
function readActiveSessionsFromFile() {
    try {
        const sessionsData = fs.readFileSync(SESSIONS_FILE_PATH, 'utf8');
        const sessions = JSON.parse(sessionsData);
        const activeSessions = new Map();
        sessions.forEach(session => {
            activeSessions.set(session.userId, session);
        });
        return activeSessions;
    }
    catch (error) {
        return new Map();
    }
}
exports.readActiveSessionsFromFile = readActiveSessionsFromFile;
function writeActiveSessionsToFile(activeSessions) {
    const sessionsArray = Array.from(activeSessions.values());
    const sessionsData = JSON.stringify(sessionsArray, null, 2);
    fs.writeFileSync(SESSIONS_FILE_PATH, sessionsData, 'utf8');
}
exports.writeActiveSessionsToFile = writeActiveSessionsToFile;
//# sourceMappingURL=active-sessions-file.js.map