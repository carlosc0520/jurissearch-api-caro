# 🔐 Sistema de Refresh Tokens - Implementación Completa

## 📋 Resumen de Cambios

Se ha implementado un sistema robusto de **Refresh Tokens** con rotación automática y validaciones de seguridad mejoradas.

---

## 🎯 Características Principales

### **1. Access Token**
- ⏱️ **Duración**: 15 minutos
- 🔑 **Uso**: Autenticación de requests API
- 📦 **Payload**: Información completa del usuario (ID, EMAIL, ROLE, PERMISOS, etc.)
- 🔐 **Algoritmo**: HS256 (especificado explícitamente)

### **2. Refresh Token**
- ⏱️ **Duración**: 7 días
- 🔑 **Uso**: Renovar access token
- 📦 **Payload**: Información mínima (tokenId, userId, sessionId)
- 🔄 **Rotación**: Se genera un nuevo refresh token cada vez que se usa
- 💾 **Almacenamiento**: Archivo JSON persistente

### **3. Seguridad**
- ✅ Validación de SECRET_KEY (mínimo 32 caracteres)
- ✅ Algoritmo específico (HS256) en todas las operaciones JWT
- ✅ JWT ID (jti) único para cada token
- ✅ Revocación de tokens por sesión o usuario
- ✅ Limpieza automática de tokens expirados
- ✅ Validación de formato y estructura de tokens
- ✅ Protección contra ataques de timing

---

## 📁 Archivos Modificados

### **Backend (NestJS/TypeScript)**

#### 1. `token.service.ts`
**Nuevos métodos:**
- `generateTokens()` - Genera access + refresh token
- `refreshAccessToken()` - Renueva access token con rotación
- `revokeRefreshTokensBySession()` - Revoca tokens por sesión
- `revokeRefreshTokensByUser()` - Revoca todos los tokens de un usuario
- `cleanupExpiredTokens()` - Limpia tokens expirados
- `getUserRefreshTokens()` - Lista tokens activos de un usuario
- `getRefreshTokenInfo()` - Obtiene información de un refresh token

**Mejoras:**
- Validación de SECRET_KEY en constructor
- Algoritmo HS256 especificado en todos los jwt.sign()
- Manejo robusto de errores
- Validaciones de inputs
- Operaciones de archivos con manejo de errores

#### 2. `login.controller.ts`
**Nuevos endpoints:**
- `POST /login/refresh` - Renueva access token usando refresh token

**Modificaciones:**
- `/login/autenticar` ahora devuelve `accessToken`, `refreshToken` y `expiresIn`
- `/login/logout` revoca refresh tokens asociados
- Validaciones mejoradas en todos los endpoints

### **Frontend (Vue.js)**

#### 3. `LoginProxy.js`
**Nuevo método:**
- `refresh(refreshToken)` - Llama al endpoint de refresh

**Modificaciones:**
- Actualizado `logout()` para usar `accessToken`

#### 4. `AxiosProvider.js`
**Implementación completa de interceptor de refresh:**
- Detecta errores 401 automáticamente
- Renueva token usando refresh token
- Encola requests mientras se renueva el token
- Reintenta requests fallidos con nuevo token
- Redirige a login si el refresh token expira
- Previene múltiples refreshes simultáneos

#### 5. `Login.vue`
**Modificaciones:**
- Almacena `refreshToken` en localStorage
- Valida `refreshToken` recibido del servidor
- Limpia `refreshToken` al cerrar sesión
- Mejoras de seguridad adicionales

---

## 🔧 Configuración Requerida

### **Variables de Entorno (.env)**

```env
SECRET_KEY=tu_secret_key_de_minimo_32_caracteres_aqui
REFRESH_TOKEN_SECRET=otro_secret_diferente_de_minimo_32_caracteres
```

⚠️ **IMPORTANTE**: 
- Las claves deben tener mínimo 32 caracteres
- Usar claves diferentes para access y refresh tokens
- No compartir estas claves en repositorios públicos

---

## 🚀 Flujo de Autenticación

### **1. Login Inicial**
```
Usuario → POST /login/autenticar
       ↓
Backend valida credenciales
       ↓
Backend genera accessToken (15min) + refreshToken (7 días)
       ↓
Frontend almacena ambos en localStorage
```

### **2. Request Normal**
```
Frontend → Request con Authorization: Bearer {accessToken}
          ↓
Backend valida token (middleware)
          ↓
Response exitosa
```

### **3. Token Expirado**
```
Frontend → Request con accessToken expirado
          ↓
Backend → 401 Unauthorized
          ↓
Interceptor detecta 401
          ↓
POST /login/refresh con refreshToken
          ↓
Backend valida refreshToken
          ↓
Backend genera NUEVOS accessToken + refreshToken (rotación)
          ↓
Frontend actualiza tokens en localStorage
          ↓
Reintenta request original con nuevo accessToken
```

### **4. Refresh Token Expirado**
```
Frontend → POST /login/refresh con refreshToken expirado
          ↓
Backend → 401 Unauthorized
          ↓
Frontend limpia localStorage
          ↓
Redirige a /auth/login
```

---

## 📊 Almacenamiento

### **Backend - Archivos JSON**
```
/services/User/active-sessions.json
- sessionId
- expiresIn

/services/User/refresh-tokens.json
- tokenId
- userId
- sessionId
- expiresAt
- createdAt
- lastUsed
- deviceInfo
```

### **Frontend - LocalStorage**
```javascript
localStorage.accessToken    // Access token (15min)
localStorage.refreshToken   // Refresh token (7 días)
localStorage.user          // Datos del usuario
```

---

## 🔒 Mejoras de Seguridad Implementadas

### **Token Service**
1. ✅ Validación de SECRET_KEY (mínimo 32 caracteres)
2. ✅ Algoritmo HS256 especificado explícitamente
3. ✅ JWT ID único (jti) en cada token
4. ✅ Validación de estructura de payload
5. ✅ Rotación automática de refresh tokens
6. ✅ Revocación de tokens por sesión/usuario
7. ✅ Limpieza de tokens expirados
8. ✅ Validación de inputs robusta
9. ✅ Manejo de errores mejorado
10. ✅ Logs de errores sin exponer información sensible

### **Controllers**
1. ✅ Sanitización de inputs
2. ✅ Validación de formato de tokens
3. ✅ Validación de longitud min/max
4. ✅ Regex para validar formato JWT
5. ✅ Mensajes de error genéricos
6. ✅ Validación de campos requeridos
7. ✅ Rate limiting en frontend

### **Middleware**
1. ✅ Validación de algoritmo (HS256)
2. ✅ Validación de estructura de payload
3. ✅ Validación de sessionId
4. ✅ Verificación de sesión activa
5. ✅ Manejo de errores específico por tipo

---

## 🧪 Testing

### **Probar Login**
```bash
curl -X POST http://localhost:3000/login/autenticar \
  -H "Content-Type: application/json" \
  -d '{
    "USER": "test@example.com",
    "PASSWORD": "password123"
  }'
```

### **Probar Refresh**
```bash
curl -X POST http://localhost:3000/login/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "tu_refresh_token_aqui"
  }'
```

---

## 📝 Notas Adicionales

### **Compatibilidad**
- Se mantiene el método `generateToken()` legacy para compatibilidad
- Se mantiene el endpoint `/login/refreshToken` (GET) legacy
- El nuevo sistema usa `generateTokens()` y `/login/refresh` (POST)

### **Mejoras Futuras Sugeridas**
1. 📱 Almacenar refresh tokens en base de datos (más escalable)
2. 🔄 Implementar refresh token en OAuth (Google/LinkedIn)
3. 📊 Dashboard de sesiones activas para usuarios
4. 🚨 Notificaciones de login desde nuevo dispositivo
5. 🔐 Implementar fingerprinting de dispositivos
6. ⏰ Refresh tokens con tiempo de vida variable por rol
7. 📧 Notificación por email al renovar tokens
8. 🔄 Implementar refresh token en otros controllers

### **Consideraciones de Producción**
- Los archivos JSON deben tener permisos 600 (solo lectura/escritura por owner)
- Considerar migrar a Redis o base de datos para alta concurrencia
- Implementar limpieza automática de tokens cada hora
- Monitorear uso de refresh tokens para detectar anomalías
- Implementar límite de refresh tokens activos por usuario (ej: 5 dispositivos)

---

## 🐛 Troubleshooting

### **Error: "SECRET_KEY no configurada"**
- Verificar que `.env` tenga `SECRET_KEY` y `REFRESH_TOKEN_SECRET`
- Las claves deben tener mínimo 32 caracteres

### **Error: "Refresh token expirado"**
- El usuario debe iniciar sesión nuevamente
- Los refresh tokens duran 7 días

### **Error: "Sesión inválida"**
- La sesión fue revocada (logout)
- Iniciar sesión nuevamente

### **Token no se renueva automáticamente**
- Verificar que `AxiosProvider.js` esté importado en `main.js`
- Verificar que el interceptor esté configurado correctamente

---

## 📧 Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

**Fecha de Implementación**: Marzo 2026
**Versión**: 1.0.0
