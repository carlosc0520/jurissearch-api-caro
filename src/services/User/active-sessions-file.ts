// active-sessions-file.ts
import * as fs from 'fs';
import * as path from 'path';

interface Session {
    userId: string;
    sessionId: string;
    expiresIn: number;
}

const SESSIONS_FILE_PATH = path.join(__dirname, 'active-sessions.json');

// Función para leer las sesiones activas desde el archivo
function readActiveSessionsFromFile(): Map<string, Session> {
    try {
        const sessionsData = fs.readFileSync(SESSIONS_FILE_PATH, 'utf8');
        const sessions: Session[] = JSON.parse(sessionsData);
        const activeSessions = new Map<string, Session>();
        
        sessions.forEach(session => {
            activeSessions.set(session.userId, session);
        });

        return activeSessions;
    } catch (error) {
        // Si hay un error al leer el archivo (por ejemplo, archivo no encontrado), devuelve un mapa vacío
        return new Map<string, Session>();
    }
}

// Función para escribir las sesiones activas en el archivo
function writeActiveSessionsToFile(activeSessions: Map<string, Session>): void {
    const sessionsArray: Session[] = Array.from(activeSessions.values());
    const sessionsData = JSON.stringify(sessionsArray, null, 2);
    fs.writeFileSync(SESSIONS_FILE_PATH, sessionsData, 'utf8');
}

export { readActiveSessionsFromFile, writeActiveSessionsToFile };
