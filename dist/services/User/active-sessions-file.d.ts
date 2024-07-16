interface Session {
    userId: string;
    sessionId: string;
    expiresIn: number;
}
declare function readActiveSessionsFromFile(): Map<string, Session>;
declare function writeActiveSessionsToFile(activeSessions: Map<string, Session>): void;
export { readActiveSessionsFromFile, writeActiveSessionsToFile };
