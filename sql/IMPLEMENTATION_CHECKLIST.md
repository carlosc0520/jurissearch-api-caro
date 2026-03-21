# CHECKLIST DE IMPLEMENTACIÓN - SQL SERVER SESSION MANAGEMENT

## 📋 FASE 1: BASE DE DATOS (15 minutos)

### Paso 1.1: Preparar SQL Server
- [ ] Abrir SQL Server Management Studio
- [ ] Conectar a tu servidor
- [ ] Localizar tu base de datos (probablemente `JURIS_BD`)

### Paso 1.2: Ejecutar Scripts SQL
- [ ] Abrir archivo `SESSION_MANAGEMENT.sql`
- [ ] **IMPORTANTE**: Cambiar línea 8 al nombre real de tu BD
  ```sql
  USE [JURIS_BD]; -- CAMBIAR AL NOMBRE DE TU BASE DE DATOS
  ```
- [ ] Ejecutar todo el script (F5)
- [ ] Verificar que al final diga "INSTALACIÓN COMPLETADA"
- [ ] Verificar que todos los objetos muestren "OK" en la tabla de verificación

### Paso 1.3: Probar Instalación (Opcional)
- [ ] Abrir archivo `SESSION_MANAGEMENT_TESTS.sql`
- [ ] Cambiar línea 6 al nombre de tu BD
- [ ] Ejecutar script completo
- [ ] Verificar que todos los tests pasen sin errores

---

## 📦 FASE 2: CONFIGURAR API (20 minutos)

### Paso 2.1: Instalar Dependencias
```bash
cd jurissearch-api-caro
npm install mssql
npm install @types/mssql --save-dev
```

### Paso 2.2: Variables de Entorno
- [ ] Abrir archivo `.env` en la raíz del proyecto API
- [ ] Agregar variables de conexión SQL Server:
  ```env
  DB_USER=tu_usuario
  DB_PASSWORD=tu_password
  DB_NAME=JURIS_BD
  DB_SERVER=localhost
  ```
- [ ] **IMPORTANTE**: No commitear este archivo a Git

### Paso 2.3: Crear Archivos de Configuración

#### Archivo: `src/config/database.config.ts`
- [ ] Crear carpeta `src/config` si no existe
- [ ] Copiar contenido de `API_INTEGRATION_GUIDE.md` sección "Paso 2"
- [ ] Guardar archivo

#### Archivo: `src/services/database.service.ts`
- [ ] Copiar contenido de `API_INTEGRATION_GUIDE.md` sección "Paso 3"
- [ ] Guardar archivo

---

## 🔧 FASE 3: MODIFICAR TOKEN SERVICE (30 minutos)

### Paso 3.1: Agregar Imports
- [ ] Abrir `src/services/User/token.service.ts`
- [ ] Agregar al inicio del archivo:
  ```typescript
  import { DatabaseService } from '../database.service';
  import * as sql from 'mssql';
  ```

### Paso 3.2: Agregar Interfaces
- [ ] Copiar interface `SessionData` del `API_INTEGRATION_GUIDE.md` (después de imports)

### Paso 3.3: Agregar Métodos SQL
Copiar estos métodos NUEVOS al token.service.ts:
- [ ] `createSessionDB()`
- [ ] `getSessionDB()`
- [ ] `getSessionByRefreshTokenDB()`
- [ ] `closeSessionDB()`
- [ ] `closeAllUserSessionsDB()`
- [ ] `getUserActiveSessionsDB()`

### Paso 3.4: MODIFICAR Método `generateTokens()`
BUSCAR el método existente `generateTokens()` y:
- [ ] Agregar parámetros `ipAddress?: string, userAgent?: string`
- [ ] ELIMINAR código que escribe a `active-sessions.json`
- [ ] AGREGAR llamada a `this.createSessionDB()`
- [ ] Usar código del `API_INTEGRATION_GUIDE.md` como referencia

### Paso 3.5: MODIFICAR Método `refreshAccessToken()`
BUSCAR el método existente `refreshAccessToken()` y:
- [ ] ELIMINAR código que lee `active-sessions.json`
- [ ] AGREGAR llamada a `this.getSessionByRefreshTokenDB()`
- [ ] Mantener lógica de generación de nuevo access token

### Paso 3.6: MODIFICAR Método `logout()`
BUSCAR el método existente `logout()` y:
- [ ] ELIMINAR código que modifica `active-sessions.json`
- [ ] AGREGAR llamada a `this.closeSessionDB()`

### Paso 3.7: ELIMINAR Código Obsoleto
- [ ] ELIMINAR método `loadActiveSessions()` si existe
- [ ] ELIMINAR método `saveActiveSessions()` si existe
- [ ] ELIMINAR imports de `fs` si ya no se usan
- [ ] ELIMINAR variable `SESSIONS_FILE_PATH`

---

## 🌐 FASE 4: ACTUALIZAR CONTROLADORES (15 minutos)

### Paso 4.1: Login Controller
- [ ] Abrir tu controlador de login (probablemente en `src/controllers/`)
- [ ] BUSCAR donde se llama `tokenService.generateTokens()`
- [ ] AGREGAR parámetros de request:
  ```typescript
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const tokens = await tokenService.generateTokens(user, ipAddress, userAgent);
  ```

### Paso 4.2: Logout Controller
- [ ] Verificar que `logout()` reciba el `accessToken` como parámetro
- [ ] No necesita cambios adicionales

### Paso 4.3: Refresh Token Controller (si existe)
- [ ] Verificar que pase el `refreshToken` correctamente
- [ ] No necesita cambios adicionales

---

## 🧪 FASE 5: TESTING (20 minutos)

### Paso 5.1: Limpiar Datos Antiguos
- [ ] HACER BACKUP del archivo `active-sessions.json` (renombrarlo o copiarlo)
- [ ] Detener el servidor API si está corriendo

### Paso 5.2: Iniciar Servidor
```bash
npm run start:dev
```
- [ ] Verificar que no haya errores de conexión SQL
- [ ] Revisar logs para confirmar conexión exitosa

### Paso 5.3: Probar Login
- [ ] Hacer login desde el frontend
- [ ] Verificar en SQL Server que se creó la sesión:
  ```sql
  SELECT * FROM JURIS.USER_SESSIONS ORDER BY CREATED_AT DESC;
  ```
- [ ] Verificar que aparezca tu sesión con datos correctos

### Paso 5.4: Probar Refresh Token
- [ ] Esperar 3 minutos (para que expire access token)
- [ ] Hacer una petición que requiera autenticación
- [ ] Verificar en Network tab que el token se renovó automáticamente
- [ ] Verificar en SQL que LAST_ACCESSED_AT se actualizó

### Paso 5.5: Probar Logout
- [ ] Hacer logout desde el frontend
- [ ] Verificar en SQL que IS_ACTIVE = 0:
  ```sql
  SELECT SESSION_ID, IS_ACTIVE FROM JURIS.USER_SESSIONS WHERE USER_EMAIL = 'tu@email.com';
  ```

### Paso 5.6: Probar Sesión Expirada
- [ ] Hacer login
- [ ] Esperar 4 minutos (para que expire refresh token)
- [ ] Intentar acceder a página protegida
- [ ] Verificar que te redirija a login con mensaje de sesión expirada

---

## 🔍 FASE 6: VERIFICACIÓN Y MONITOREO (10 minutos)

### Paso 6.1: Estadísticas de Sesiones
```sql
EXEC JURIS.SP_GET_SESSION_STATS;
```
- [ ] Ejecutar este SP periódicamente para ver estado

### Paso 6.2: Ver Sesiones Activas
```sql
SELECT 
    USER_EMAIL,
    DATEDIFF(MINUTE, GETDATE(), EXPIRES_AT) AS MINUTOS_RESTANTES,
    LAST_ACCESSED_AT
FROM JURIS.USER_SESSIONS
WHERE IS_ACTIVE = 1 AND EXPIRES_AT > GETDATE();
```

### Paso 6.3: Configurar Job de Limpieza (Opcional)
- [ ] Descomentar sección 11 de `SESSION_MANAGEMENT.sql`
- [ ] Ejecutar esa sección
- [ ] Verificar en SQL Agent que el job se creó

---

## 🚀 FASE 7: PRODUCCIÓN (Cuando todo funcione)

### Paso 7.1: Cambiar Tiempos de Expiración
En `token.service.ts` CAMBIAR:
```typescript
// DE:
expiresIn: '3m'  // Access Token
expiresIn: '4m'  // Refresh Token

// A:
expiresIn: '15m'     // Access Token → 15 minutos
expiresIn: '10080m'  // Refresh Token → 7 días
```

### Paso 7.2: Actualizar Llamadas a DB
Cambiar `expiresInMinutes` en `createSessionDB()`:
```typescript
// DE:
expiresInMinutes: 4

// A:
expiresInMinutes: 10080  // 7 días
```

### Paso 7.3: Remover Código de Testing
- [ ] Eliminar comentarios "(TESTING)"
- [ ] Eliminar `console.log()` de debugging

### Paso 7.4: Documentar
- [ ] Guardar credenciales SQL en gestor de secretos (Azure Key Vault, etc.)
- [ ] Documentar proceso de restore si se necesita
- [ ] Verificar que `.env` esté en `.gitignore`

---

## ✅ CHECKLIST FINAL

- [ ] ✅ Tabla JURIS.USER_SESSIONS creada
- [ ] ✅ 9 Stored Procedures funcionando
- [ ] ✅ Dependencia `mssql` instalada
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ DatabaseService implementado
- [ ] ✅ TokenService modificado (sin archivos JSON)
- [ ] ✅ Login funcional con sesiones en SQL
- [ ] ✅ Refresh token funcional
- [ ] ✅ Logout funcional
- [ ] ✅ Sesión expirada funcional
- [ ] ✅ Tests manuales pasados
- [ ] ✅ Archivo `active-sessions.json` respaldado
- [ ] ✅ Estadísticas de sesiones monitoreadas
- [ ] ✅ (Opcional) SQL Agent Job configurado

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot connect to SQL Server"
- Verificar que SQL Server esté corriendo
- Verificar credenciales en `.env`
- Verificar firewall (puerto 1433)
- Probar conexión con SSMS primero

### Error: "Invalid object name JURIS.USER_SESSIONS"
- Ejecutar `SESSION_MANAGEMENT.sql` completo
- Verificar que estás usando la BD correcta (USE [JURIS_BD])

### Error: "Cannot find module 'mssql'"
```bash
npm install mssql --save
```

### Sesiones no se actualizan
- Verificar logs del servidor API
- Ejecutar `SELECT * FROM JURIS.USER_SESSIONS` para ver datos
- Verificar que `DatabaseService.getPool()` no lance error

### Token no se refresca automáticamente
- Verificar que AxiosProvider tenga el interceptor
- Verificar tiempo de expiración (3 minutos access, 4 minutos refresh)
- Revisar Network tab en navegador

---

## 📞 SOPORTE

Si encuentras problemas, verifica:
1. Logs del servidor API
2. Datos en tabla SQL (`SELECT * FROM JURIS.USER_SESSIONS`)
3. Network tab del navegador
4. Variables de entorno correctas

**Tiempo estimado total: 1.5 - 2 horas**
