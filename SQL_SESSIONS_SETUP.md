# Guía de Configuración - Sesiones SQL Server

## ✅ Cambios Implementados

Se ha implementado integración con SQL Server para almacenamiento de sesiones de usuario con sistema de fallback automático a archivos JSON.

### Archivos Modificados
- ✅ `src/config/database.config.ts` (NUEVO)
- ✅ `src/services/database.service.ts` (NUEVO)
- ✅ `src/services/User/token.service.ts` (MODIFICADO)
- ✅ `.env.example` (ACTUALIZADO)

### Métodos Actualizados en TokenService
- ✅ `generateTokens()` → Ahora es `async`, guarda sesiones en SQL Server
- ✅ `refreshAccessToken()` → Ahora es `async`, consulta sesiones desde SQL Server
- ✅ `removeSession()` → Cierra sesiones en SQL Server (soft delete)
- ✅ `constructor()` → Prueba conexión SQL al iniciar

---

## 🔧 Configuración

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# JWT Secrets (obligatorios)
SECRET_KEY=your-secret-key-minimum-32-characters
REFRESH_TOKEN_SECRET=your-refresh-token-secret-minimum-32-characters

# SQL Server Configuration
DB_USER=sa
DB_PASSWORD=YourStrongPassword123
DB_SERVER=localhost
DB_NAME=JURIS_BD
DB_TRUST_CERT=true

# Enable/Disable SQL Sessions
USE_SQL_SESSIONS=true
```

### 2. Base de Datos SQL Server

#### Opción A: Ejecutar Script Completo
```bash
# Ubicación: jurissearch-api-caro/sql/SESSION_MANAGEMENT.sql
# Ejecutar en SQL Server Management Studio o Azure Data Studio
```

El script creará automáticamente:
- ✅ Schema `JURIS` (si no existe)
- ✅ Tabla `JURIS.USER_SESSIONS`
- ✅ 9 Stored Procedures de gestión de sesiones
- ✅ Índices optimizados

#### Opción B: Verificación Manual
```sql
-- Verificar que el schema existe
SELECT * FROM sys.schemas WHERE name = 'JURIS';

-- Verificar que la tabla existe
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'JURIS' AND TABLE_NAME = 'USER_SESSIONS';

-- Verificar stored procedures
SELECT name FROM sys.procedures WHERE schema_id = SCHEMA_ID('JURIS');
```

### 3. Instalación de Dependencias

El paquete `mssql` ya está instalado. Verificar versión:

```bash
npm list mssql
# Debe mostrar: mssql@10.0.2
```

---

## 🚀 Uso

### Inicio de Sesión (con SQL)

```typescript
import { TokenService } from './services/User/token.service';

const tokenService = new TokenService();

// Al iniciar sesión
const tokens = await tokenService.generateTokens(
  user,           // User object
  false,          // bandera (forzar nueva sesión)
  'Web Browser',  // deviceInfo
  '192.168.1.100', // ipAddress (opcional)
  'Mozilla/5.0...' // userAgent (opcional)
);

console.log(tokens.accessToken);   // Access token JWT (3 minutos)
console.log(tokens.refreshToken);  // Refresh token JWT (4 minutos)
console.log(tokens.expiresIn);     // 180 (segundos)
```

### Renovar Access Token

```typescript
// Con refresh token
const newTokens = await tokenService.refreshAccessToken(
  refreshToken,
  'Web Browser'
);

console.log(newTokens.accessToken);  // Nuevo access token
console.log(newTokens.refreshToken); // Nuevo refresh token (rotación automática)
```

### Cerrar Sesión

```typescript
// Con access token actual
await tokenService.removeSession(accessToken);
```

---

## 🔍 Comportamiento del Sistema

### Estrategia de Fallback

El sistema funciona con **doble almacenamiento**:

1. **SQL Server (Principal)**: Si `USE_SQL_SESSIONS=true` y la conexión es exitosa
2. **Archivos JSON (Fallback)**: Siempre se mantiene sincronizado como respaldo

```
Inicio de Sesión
   ├─▶ Intenta guardar en SQL Server
   │   ├─▶ ✅ Éxito: Log "[SQL] Sesión creada en BD"
   │   └─▶ ❌ Error: Log "[SQL] Error..." y continúa
   └─▶ SIEMPRE guarda en archivo JSON
```

### Logs de Diagnóstico

Al iniciar la aplicación verás:

```
[SQL] ✓ Conexión a SQL Server exitosa
```

O uno de estos mensajes de error:

```
[SQL] ⚠ No se pudo conectar a SQL Server, usando archivo JSON
[SQL] ✗ Error al probar conexión SQL: ConnectionError: Failed to connect...
[SQL] Sistema funcionará con archivos JSON como fallback
```

Durante operaciones:

```
[SQL] Sesión creada en BD: 550e8400-e29b-41d4-a716-446655440000 para usuario user@example.com
[SQL] Sesión encontrada en BD: 550e8400-e29b-41d4-a716-446655440000
[SQL] Sesión cerrada en BD: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🧪 Testing

### 1. Ejecutar Tests SQL

```bash
# Ubicación: jurissearch-api-caro/sql/SESSION_MANAGEMENT_TESTS.sql
# Ejecutar en SQL Server Management Studio
```

### 2. Verificar Aplicación

```bash
# Iniciar servidor
npm run start:dev

# Observar logs de conexión
# Debe mostrar: [SQL] ✓ Conexión a SQL Server exitosa
```

### 3. Prueba Manual

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 2. Verificar en SQL Server
# SELECT * FROM JURIS.USER_SESSIONS WHERE USER_EMAIL = 'test@example.com';

# 3. Refresh Token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token_from_step_1>"}'

# 4. Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

## 🛠️ Troubleshooting

### Error: "ConnectionError: Failed to connect to localhost:1433"

**Solución:**
1. Verificar que SQL Server esté corriendo
2. Verificar puerto (por defecto 1433)
3. Habilitar TCP/IP en SQL Server Configuration Manager
4. Verificar configuración de firewall

```powershell
# Windows: Verificar si SQL Server está corriendo
Get-Service -Name MSSQL*

# Verificar puerto abierto
Test-NetConnection -ComputerName localhost -Port 1433
```

### Error: "Login failed for user 'sa'"

**Solución:**
1. Verificar credenciales en `.env`
2. Verificar que SQL Server permita autenticación mixta (Windows + SQL)
3. Verificar que el usuario tenga permisos en la base de datos

```sql
-- Verificar permisos
USE JURIS_BD;
EXEC sp_helprotect NULL, 'sa';

-- Otorgar permisos si es necesario
GRANT EXECUTE ON SCHEMA::JURIS TO [sa];
```

### Error: "Invalid object name 'JURIS.USER_SESSIONS'"

**Solución:**
Ejecutar el script `SESSION_MANAGEMENT.sql` completo.

```sql
-- Verificar si existe
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'JURIS' AND TABLE_NAME = 'USER_SESSIONS';

-- Si no existe, ejecutar CREATE TABLE del script
```

### Sistema usa archivos JSON en lugar de SQL

**Diagnóstico:**
```bash
# Verificar logs al iniciar aplicación
# Debe mostrar: [SQL] ✓ Conexión a SQL Server exitosa

# Si muestra warning/error, revisar:
1. Variables de entorno (.env)
2. Conexión de red a SQL Server
3. Credenciales de base de datos
```

**Solución temporal:**
El sistema funcionará normalmente con archivos JSON hasta que se resuelva el problema de SQL Server.

---

## 📋 Checklist de Implementación

- [x] Crear `database.config.ts`
- [x] Crear `database.service.ts`
- [x] Modificar `token.service.ts` (imports, interfaces, métodos SQL)
- [x] Actualizar `generateTokens()` para usar SQL
- [x] Actualizar `refreshAccessToken()` para usar SQL
- [x] Actualizar `removeSession()` para usar SQL
- [x] Agregar test de conexión en constructor
- [x] Actualizar `.env.example`
- [x] Crear documentación de configuración
- [ ] Ejecutar script SQL (`SESSION_MANAGEMENT.sql`)
- [ ] Configurar archivo `.env` con credenciales reales
- [ ] Probar conexión SQL Server
- [ ] Ejecutar tests SQL (`SESSION_MANAGEMENT_TESTS.sql`)
- [ ] Probar flujo completo: login → refresh → logout
- [ ] Verificar logs en producción
- [ ] Configurar limpieza automática de sesiones expiradas

---

## 📊 Schema de Base de Datos

### Tabla: JURIS.USER_SESSIONS

| Columna | Tipo | Descripción |
|---------|------|-------------|
| SESSION_ID | UNIQUEIDENTIFIER | PK - UUID de sesión |
| REFRESH_TOKEN_ID | UNIQUEIDENTIFIER | UUID del refresh token |
| USER_EMAIL | NVARCHAR(255) | Email del usuario |
| USER_ROLE | INT | ID del rol (IDROLE) |
| USER_ID | INT | ID del usuario |
| USER_NAME | NVARCHAR(100) | Nombre del usuario |
| USER_APELLIDO | NVARCHAR(100) | Apellido del usuario |
| IP_ADDRESS | NVARCHAR(45) | Dirección IP |
| USER_AGENT | NVARCHAR(500) | User agent del navegador |
| CREATED_AT | DATETIME | Fecha de creación |
| EXPIRES_AT | DATETIME | Fecha de expiración |
| LAST_ACCESSED_AT | DATETIME | Último acceso |
| IS_ACTIVE | BIT | 1=Activa, 0=Cerrada |
| DEVICE_INFO | NVARCHAR(200) | Info del dispositivo |
| USER_PERM | NVARCHAR(MAX) | Permisos (JSON) |

### Stored Procedures

1. `SP_CREATE_SESSION` - Crear nueva sesión
2. `SP_GET_SESSION` - Obtener sesión por ID
3. `SP_GET_SESSION_BY_REFRESH_TOKEN` - Obtener por refresh token
4. `SP_UPDATE_SESSION_LAST_ACCESS` - Actualizar último acceso
5. `SP_CLOSE_SESSION` - Cerrar sesión (soft delete)
6. `SP_CLOSE_ALL_USER_SESSIONS` - Cerrar todas las sesiones del usuario
7. `SP_GET_USER_ACTIVE_SESSIONS` - Listar sesiones activas
8. `SP_CLEANUP_EXPIRED_SESSIONS` - Limpiar expiradas
9. `SP_GET_SESSION_COUNT_BY_USER` - Contar sesiones por usuario

---

## 🔐 Seguridad

### Buenas Prácticas Implementadas

✅ **Soft Delete**: Las sesiones se marcan como inactivas (`IS_ACTIVE=0`) en lugar de eliminarse

✅ **Rotación de Tokens**: El refresh token se renueva en cada uso (token rotation)

✅ **Registro de Auditoría**: Cada sesión registra IP, User-Agent, timestamps

✅ **Expiración Automática**: Limpieza de sesiones expiradas con SP dedicado

✅ **Índices Optimizados**: Búsquedas rápidas por email, refresh_token, session_id

✅ **Fallback Automático**: Sistema continúa funcionando si SQL falla

### Recomendaciones Adicionales

1. **Cambiar tiempos de expiración en producción**:
   - Access Token: 15-30 minutos (actualmente 3min para testing)
   - Refresh Token: 7 días (actualmente 4min para testing)

2. **Configurar job periódico**:
   ```sql
   -- Ejecutar cada hora
   EXEC JURIS.SP_CLEANUP_EXPIRED_SESSIONS;
   ```

3. **Monitorear sesiones activas**:
   ```sql
   -- Ver sesiones activas
   SELECT COUNT(*) as ACTIVE_SESSIONS
   FROM JURIS.USER_SESSIONS
   WHERE IS_ACTIVE = 1 AND EXPIRES_AT > GETDATE();
   ```

4. **Limitar sesiones concurrentes**:
   ```sql
   -- Implementar límite de 5 sesiones por usuario
   -- Cerrar sesiones más antiguas si se excede el límite
   ```

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs de la aplicación (`console.log`)
2. Verificar tabla `JURIS.USER_SESSIONS` en SQL Server
3. Ejecutar tests SQL para validar stored procedures
4. Verificar archivo `.env` tiene todas las variables

---

**Última actualización**: Implementación SQL Server Sessions v1.0
**Compatibilidad**: NestJS + SQL Server 2016+ + mssql@10.0.2
