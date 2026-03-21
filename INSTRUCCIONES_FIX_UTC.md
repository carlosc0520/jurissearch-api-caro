# 🔧 INSTRUCCIONES: Fix Zona Horaria UTC

## Problema
El driver `mssql` está convirtiendo las fechas de SQL Server a la zona horaria local de Node.js (GMT-0500).

## Solución Aplicada

### 1. ✅ Cambios en el código (ya aplicados):
- **database.service.ts**: Agregado `useUTC: true` en opciones de conexión
- **token.service.ts**: Logging extensivo para ver formato de fechas
- **SESSION_MANAGEMENT.sql**: Todos los SPs ahora usan `GETUTCDATE()`

### 2. 📋 Pasos para aplicar el fix:

#### **PASO 1: Ejecutar script SQL** (si no lo has hecho)
```sql
-- Conecta a SQL5113.site4now.net y ejecuta:
-- jurissearch-api-caro\sql\FIX_UTC_TIMEZONE.sql
```

#### **PASO 2: CERRAR COMPLETAMENTE el backend**
```powershell
# 1. En la terminal del backend, presiona Ctrl+C VARIAS VECES hasta que termine

# 2. Verifica que NO haya procesos Node.js corriendo:
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Espera 5 segundos
Start-Sleep -Seconds 5
```

#### **PASO 3: Reiniciar backend COMPLETAMENTE**
```powershell
# En la carpeta jurissearch-api-caro:
cd C:\Proyectos\CARO_ASOCIADOS\JURIS_SEARCH\jurissearch-api-caro

# Reiniciar desde cero:
npm run start:dev
```

#### **PASO 4: Verificar logs de conexión**
Deberías ver en la consola:
```
[DB] Conectando a SQL Server: SQL5113.site4now.net / Base: JURIS_BD / Usuario: ...
[DB] Config useUTC: true (forzando fechas en UTC)
[DB] ✓ Conexión exitosa a SQL Server: SQL5113.site4now.net
[DB] ✓ Pool configurado con useUTC=true para evitar conversión de zona horaria
```

#### **PASO 5: Intentar login y verificar logs**
Deberías ver:
```
[SQL] ✓ Sesión encontrada en BD para sessionId: xxx
[SQL] Datos: IS_ACTIVE=true, EXPIRES_AT=...
[SQL] EXPIRES_AT type: object, constructor: Date
[SQL] EXPIRES_AT.getTime(): 1710947464000
[SQL] EXPIRES_AT.toISOString(): 2026-03-20T15:37:44.000Z  ← DEBE TERMINAR EN Z (UTC)
[SQL] new Date().toISOString(): 2026-03-20T15:33:20.123Z
```

**IMPORTANTE**: Si `toISOString()` muestra la hora correcta en UTC (termina en Z), pero el `toString()` muestra GMT-0500, **eso es NORMAL** - JavaScript convierte a la zona local para mostrar, pero el objeto Date internamente está en UTC.

#### **PASO 6: Verificación final**
Si la autenticación funciona correctamente:
```
[AUTH MIDDLEWARE] ✓ Sesión válida para sessionId: xxx
```

¡Login exitoso! ✅

---

## ⚠️ Si aún falla:

### Opción A: Verificar versión de mssql
```powershell
# Ver la versión del driver:
cat package.json | Select-String "mssql"
```

Si es una versión antigua (<9.0.0), `useUTC` podría no funcionar correctamente.

### Opción B: Alternativa - Configuración global del driver
Agregar en `database.service.ts` ANTES de cualquier import de sql:
```typescript
import * as sql from 'mssql';

// Configuración global del driver
(sql as any).ConnectionPool.prototype.config.options.useUTC = true;
```

### Opción C: Conversión manual en middleware
Si nada funciona, podemos convertir manualmente las fechas en el middleware de autenticación.

---

## 📊 Checklist de verificación:

- [ ] Script SQL ejecutado en SQL5113.site4now.net
- [ ] Proceso Node.js completamente cerrado (verificado con Get-Process)
- [ ] Backend reiniciado desde cero
- [ ] Log muestra "Config useUTC: true"
- [ ] Log muestra "Pool configurado con useUTC=true"
- [ ] Login muestra logs de EXPIRES_AT.toISOString() terminando en Z
- [ ] Login exitoso sin error de "Sesión expirada"

---

## 🎯 Resultado esperado:

```
[LOGIN] Usuario ccarbajal@ccfirma.com (ID: 211) intentando login. BANDERA: true
[SQL] Creando sesión en BD para usuario ccarbajal@ccfirma.com, sessionId: xxx
[DB] ✓ SP JURIS.SP_CREATE_SESSION ejecutado exitosamente
[SQL] ✓ Sesión creada exitosamente en BD: xxx
[AUTH MIDDLEWARE] Validando sesión para sessionId: xxx
[SQL] Buscando sesión en BD con sessionId: xxx
[SQL] ✓ Sesión encontrada en BD para sessionId: xxx
[SQL] EXPIRES_AT.toISOString(): 2026-03-20T15:41:00.000Z
[SQL] new Date().toISOString(): 2026-03-20T15:37:00.000Z
[AUTH MIDDLEWARE] ✓ Sesión válida para sessionId: xxx
```

**Login exitoso** → Dashboard cargado ✅
