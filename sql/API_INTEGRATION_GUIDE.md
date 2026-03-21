# INTEGRACIÓN API - SQL SERVER SESSION MANAGEMENT

## Paso 1: Instalar Dependencias

```bash
npm install mssql
npm install @types/mssql --save-dev
```

## Paso 2: Configuración de Conexión

Crear archivo: `src/config/database.config.ts`

```typescript
export const DATABASE_CONFIG = {
    USER: process.env.DB_USER || 'tu_usuario',
    PASSWORD: process.env.DB_PASSWORD || 'tu_password',
    DATABASE: process.env.DB_NAME || 'JURIS_BD',
    SERVER: process.env.DB_SERVER || 'localhost',
    OPTIONS: {
        ENCRYPT: true,
        TRUST_SERVER_CERTIFICATE: true,
        ENABLE_ARITH_ABORT: true
    },
    POOL: {
        MAX: 10,
        MIN: 0,
        IDLE_TIMEOUT_MILLIS: 30000
    }
};
```

## Paso 3: Servicio de Base de Datos

Crear archivo: `src/services/database.service.ts`

```typescript
import * as sql from 'mssql';
import { DATABASE_CONFIG } from '../config/database.config';

export class DatabaseService {
    private static pool: sql.ConnectionPool | null = null;

    static async getPool(): Promise<sql.ConnectionPool> {
        if (!this.pool) {
            this.pool = await sql.connect({
                user: DATABASE_CONFIG.USER,
                password: DATABASE_CONFIG.PASSWORD,
                database: DATABASE_CONFIG.DATABASE,
                server: DATABASE_CONFIG.SERVER,
                options: DATABASE_CONFIG.OPTIONS,
                pool: DATABASE_CONFIG.POOL
            });
        }
        return this.pool;
    }

    static async executeStoredProcedure(
        procedureName: string,
        inputs: { name: string; type: any; value: any }[],
        outputs: { name: string; type: any }[] = []
    ): Promise<any> {
        const pool = await this.getPool();
        const request = pool.request();

        // Agregar inputs
        inputs.forEach(input => {
            request.input(input.name, input.type, input.value);
        });

        // Agregar outputs
        outputs.forEach(output => {
            request.output(output.name, output.type);
        });

        const result = await request.execute(procedureName);
        return result;
    }

    static async close(): Promise<void> {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }
}
```

## Paso 4: Interfaces TypeScript

Agregar a `token.service.ts`:

```typescript
interface SessionData {
    SESSION_ID: string;
    USER_ID: number;
    USER_EMAIL: string;
    USER_ROLE: number;
    USER_NAME: string;
    USER_APELLIDO: string;
    USER_IDPLN: number;
    USER_UCRCN: string;
    USER_PERM: string;
    REFRESH_TOKEN_ID: string;
    EXPIRES_AT: Date;
    CREATED_AT: Date;
    LAST_ACCESSED_AT: Date;
    IP_ADDRESS?: string;
    USER_AGENT?: string;
    IS_ACTIVE: boolean;
}
```

## Paso 5: Métodos de Token Service

Actualizar `src/services/User/token.service.ts`:

```typescript
import { DatabaseService } from '../database.service';
import * as sql from 'mssql';

export class TokenService {
    // ... código existente ...

    // ============================================
    // CREAR SESIÓN EN SQL SERVER
    // ============================================
    async createSessionDB(
        user: any, 
        refreshTokenId: string, 
        expiresInMinutes: number,
        ipAddress?: string,
        userAgent?: string
    ): Promise<string> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_CREATE_SESSION',
                [
                    { name: 'USER_ID', type: sql.Int, value: user.ID },
                    { name: 'USER_EMAIL', type: sql.NVarChar(255), value: user.EMAIL },
                    { name: 'USER_ROLE', type: sql.Int, value: user.IDROLE },
                    { name: 'USER_NAME', type: sql.NVarChar(255), value: user.NOMBRES },
                    { name: 'USER_APELLIDO', type: sql.NVarChar(255), value: user.APELLIDO },
                    { name: 'USER_IDPLN', type: sql.Int, value: user.IDPLN },
                    { name: 'USER_UCRCN', type: sql.NVarChar(50), value: user.UCRCN },
                    { name: 'USER_PERM', type: sql.NVarChar(sql.MAX), value: user.RESTRICIONES },
                    { name: 'REFRESH_TOKEN_ID', type: sql.UniqueIdentifier, value: refreshTokenId },
                    { name: 'EXPIRES_IN_MINUTES', type: sql.Int, value: expiresInMinutes },
                    { name: 'IP_ADDRESS', type: sql.NVarChar(45), value: ipAddress || null },
                    { name: 'USER_AGENT', type: sql.NVarChar(500), value: userAgent || null }
                ],
                [
                    { name: 'SESSION_ID', type: sql.UniqueIdentifier }
                ]
            );

            return result.output.SESSION_ID;
        } catch (error) {
            console.error('Error creando sesión en DB:', error);
            throw new Error('Error al crear sesión en base de datos');
        }
    }

    // ============================================
    // OBTENER SESIÓN POR SESSION_ID
    // ============================================
    async getSessionDB(sessionId: string): Promise<SessionData | null> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_GET_SESSION',
                [
                    { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId }
                ]
            );

            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo sesión:', error);
            return null;
        }
    }

    // ============================================
    // OBTENER SESIÓN POR REFRESH_TOKEN_ID
    // ============================================
    async getSessionByRefreshTokenDB(refreshTokenId: string): Promise<SessionData | null> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN',
                [
                    { name: 'REFRESH_TOKEN_ID', type: sql.UniqueIdentifier, value: refreshTokenId }
                ]
            );

            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo sesión por refresh token:', error);
            return null;
        }
    }

    // ============================================
    // CERRAR SESIÓN
    // ============================================
    async closeSessionDB(sessionId: string): Promise<boolean> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_CLOSE_SESSION',
                [
                    { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId }
                ]
            );

            return result.recordset[0]?.AFFECTED_ROWS > 0;
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            return false;
        }
    }

    // ============================================
    // CERRAR TODAS LAS SESIONES DE UN USUARIO
    // ============================================
    async closeAllUserSessionsDB(userId: number): Promise<number> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_CLOSE_ALL_USER_SESSIONS',
                [
                    { name: 'USER_ID', type: sql.Int, value: userId }
                ]
            );

            return result.recordset[0]?.AFFECTED_ROWS || 0;
        } catch (error) {
            console.error('Error cerrando sesiones de usuario:', error);
            return 0;
        }
    }

    // ============================================
    // OBTENER SESIONES ACTIVAS DE UN USUARIO
    // ============================================
    async getUserActiveSessionsDB(userId: number): Promise<any[]> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_GET_USER_ACTIVE_SESSIONS',
                [
                    { name: 'USER_ID', type: sql.Int, value: userId }
                ]
            );

            return result.recordset || [];
        } catch (error) {
            console.error('Error obteniendo sesiones activas:', error);
            return [];
        }
    }

    // ============================================
    // MODIFICAR generateTokens() PARA USAR SQL SERVER
    // ============================================
    async generateTokens(user: any, ipAddress?: string, userAgent?: string) {
        try {
            const sessionId = uuidv4();
            const refreshTokenId = uuidv4();

            // Payload del Access Token
            const accessPayload = {
                EMAIL: user.EMAIL,
                ID: user.ID,
                role: user.IDROLE,
                IDPLN: user.IDPLN,
                NAME: user.NOMBRES,
                APELLIDO: user.APELLIDO,
                UCRCN: user.UCRCN,
                PERM: user.RESTRICIONES,
                sessionId: sessionId,
                jti: uuidv4()
            };

            // Payload del Refresh Token
            const refreshPayload = {
                tokenId: refreshTokenId,
                userId: user.ID,
                sessionId: sessionId,
                jti: uuidv4()
            };

            // Generar tokens JWT
            const accessToken = jwt.sign(accessPayload, this.ACCESS_TOKEN_SECRET, {
                expiresIn: '3m', // 3 minutos (TESTING)
                algorithm: 'HS256'
            });

            const refreshToken = jwt.sign(refreshPayload, this.REFRESH_TOKEN_SECRET, {
                expiresIn: '4m', // 4 minutos (TESTING)
                algorithm: 'HS256'
            });

            // GUARDAR SESIÓN EN SQL SERVER (reemplaza archivo JSON)
            const dbSessionId = await this.createSessionDB(
                user,
                refreshTokenId,
                4, // 4 minutos para testing
                ipAddress,
                userAgent
            );

            console.log('Sesión creada en SQL Server:', dbSessionId);

            return { accessToken, refreshToken };
        } catch (error) {
            console.error('Error generando tokens:', error);
            throw error;
        }
    }

    // ============================================
    // MODIFICAR refreshAccessToken() PARA USAR SQL SERVER
    // ============================================
    async refreshAccessToken(refreshToken: string): Promise<string | null> {
        try {
            // Verificar refresh token
            const payload: any = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);

            if (!payload.tokenId || !payload.sessionId) {
                throw new Error('Refresh token inválido');
            }

            // OBTENER SESIÓN DE SQL SERVER (reemplaza lectura de archivo)
            const session = await this.getSessionByRefreshTokenDB(payload.tokenId);

            if (!session) {
                throw new Error('Sesión no encontrada o expirada');
            }

            // Crear nuevo access token con datos de la sesión
            const newAccessPayload = {
                EMAIL: session.USER_EMAIL,
                ID: session.USER_ID,
                role: session.USER_ROLE,
                IDPLN: session.USER_IDPLN,
                NAME: session.USER_NAME,
                APELLIDO: session.USER_APELLIDO,
                UCRCN: session.USER_UCRCN,
                PERM: session.USER_PERM,
                sessionId: payload.sessionId,
                jti: uuidv4()
            };

            const newAccessToken = jwt.sign(newAccessPayload, this.ACCESS_TOKEN_SECRET, {
                expiresIn: '3m', // 3 minutos (TESTING)
                algorithm: 'HS256'
            });

            return newAccessToken;
        } catch (error) {
            console.error('Error refrescando access token:', error);
            return null;
        }
    }

    // ============================================
    // MODIFICAR logout() PARA USAR SQL SERVER
    // ============================================
    async logout(accessToken: string): Promise<boolean> {
        try {
            const decoded: any = jwt.decode(accessToken);
            
            if (!decoded || !decoded.sessionId) {
                return false;
            }

            // CERRAR SESIÓN EN SQL SERVER (reemplaza eliminación de archivo)
            const closed = await this.closeSessionDB(decoded.sessionId);
            
            return closed;
        } catch (error) {
            console.error('Error en logout:', error);
            return false;
        }
    }
}
```

## Paso 6: Variables de Entorno (.env)

```env
# Database Configuration
DB_USER=tu_usuario_sql
DB_PASSWORD=tu_password_sql
DB_NAME=JURIS_BD
DB_SERVER=localhost
# O para producción:
# DB_SERVER=tu-servidor.database.windows.net

# JWT Secrets (mantener los existentes)
ACCESS_TOKEN_SECRET=tu_secret_existente
REFRESH_TOKEN_SECRET=tu_refresh_secret_existente
```

## Paso 7: Controlador de Administración (Opcional)

Agregar endpoints para administrar sesiones:

```typescript
// src/controllers/session.controller.ts

import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { TokenService } from '../services/User/token.service';

@Controller('sessions')
export class SessionController {
    constructor(private tokenService: TokenService) {}

    // Obtener sesiones activas de un usuario
    @Get('user/:userId')
    async getUserSessions(@Param('userId') userId: number) {
        const sessions = await this.tokenService.getUserActiveSessionsDB(userId);
        return { sessions };
    }

    // Cerrar sesión específica
    @Delete(':sessionId')
    async closeSession(@Param('sessionId') sessionId: string) {
        const closed = await this.tokenService.closeSessionDB(sessionId);
        return { success: closed };
    }

    // Cerrar todas las sesiones de un usuario
    @Delete('user/:userId/all')
    async closeAllUserSessions(@Param('userId') userId: number) {
        const count = await this.tokenService.closeAllUserSessionsDB(userId);
        return { closedSessions: count };
    }
}
```

## Paso 8: Migración de Datos (Si tenías archivo JSON)

```typescript
// Script de migración (ejecutar una sola vez)
import * as fs from 'fs';
import { TokenService } from './services/User/token.service';

async function migrateSessionsFromJSON() {
    const tokenService = new TokenService();
    
    // Leer archivo JSON antiguo
    const jsonPath = './active-sessions.json';
    if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        for (const sessionId in data) {
            const session = data[sessionId];
            
            // Migrar a SQL Server
            await tokenService.createSessionDB(
                {
                    ID: session.userId,
                    EMAIL: session.userEmail,
                    IDROLE: session.userRole,
                    NOMBRES: session.userName,
                    APELLIDO: session.userApellido,
                    IDPLN: session.userIdPln,
                    UCRCN: session.userUcrcn,
                    RESTRICIONES: session.userPerm
                },
                session.tokenId,
                Math.ceil((session.expiresIn - Date.now()) / 60000) // minutos restantes
            );
        }
        
        console.log('Migración completada');
        // Opcional: renombrar archivo antiguo
        fs.renameSync(jsonPath, jsonPath + '.backup');
    }
}
```

## Resumen de Cambios

1. ✅ Instalar `mssql`
2. ✅ Configurar conexión a SQL Server
3. ✅ Reemplazar lectura/escritura de `active-sessions.json` con llamadas a stored procedures
4. ✅ Mantener estructura de tokens JWT sin cambios
5. ✅ Eliminar código relacionado con archivos JSON
6. ✅ Agregar manejo de IP y User-Agent

## Ventajas de Esta Implementación

- **Escalabilidad**: Múltiples instancias del API comparten sesiones
- **Performance**: SQL Server optimizado para consultas
- **Persistencia**: Datos seguros en base de datos
- **Auditoría**: Historial completo de sesiones
- **Limpieza automática**: SQL Agent Job
- **Consultas**: Stored Procedures optimizados
