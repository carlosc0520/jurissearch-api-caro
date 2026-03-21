PRINT '========================================';
PRINT 'INICIANDO PRUEBAS DE SESIONES';
PRINT '========================================';
PRINT '';

-- ============================================
-- TEST 1: CREAR NUEVA SESIÓN
-- ============================================
PRINT '-- TEST 1: Crear nueva sesión';

DECLARE @NEW_SESSION_ID UNIQUEIDENTIFIER;
DECLARE @REFRESH_TOKEN_ID UNIQUEIDENTIFIER = NEWID();

EXEC JURIS.SP_CREATE_SESSION
    @SESSION_ID = @NEW_SESSION_ID OUTPUT,
    @USER_ID = 123,
    @USER_EMAIL = 'test@jurissearch.com',
    @USER_ROLE = 2,
    @USER_NAME = 'Juan',
    @USER_APELLIDO = 'Pérez',
    @USER_IDPLN = 1,
    @USER_UCRCN = 'UCRCN123',
    @USER_PERM = 'READ,WRITE,DELETE',
    @REFRESH_TOKEN_ID = @REFRESH_TOKEN_ID,
    @EXPIRES_IN_MINUTES = 4, -- 4 minutos para testing
    @IP_ADDRESS = '192.168.1.100',
    @USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

PRINT 'Session ID creado: ' + CAST(@NEW_SESSION_ID AS VARCHAR(50));
PRINT '';

-- ============================================
-- TEST 2: OBTENER SESIÓN POR SESSION_ID
-- ============================================
PRINT '-- TEST 2: Obtener sesión por SESSION_ID';

EXEC JURIS.SP_GET_SESSION @SESSION_ID = @NEW_SESSION_ID;
PRINT '';

-- ============================================
-- TEST 3: OBTENER SESIÓN POR REFRESH_TOKEN_ID
-- ============================================
PRINT '-- TEST 3: Obtener sesión por REFRESH_TOKEN_ID';

EXEC JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN @REFRESH_TOKEN_ID = @REFRESH_TOKEN_ID;
PRINT '';

-- ============================================
-- TEST 4: OBTENER SESIONES ACTIVAS DE USUARIO
-- ============================================
PRINT '-- TEST 4: Obtener sesiones activas del usuario';

EXEC JURIS.SP_GET_USER_ACTIVE_SESSIONS @USER_ID = 123;
PRINT '';

-- ============================================
-- TEST 5: ESTADÍSTICAS DE SESIONES
-- ============================================
PRINT '-- TEST 5: Estadísticas generales';

EXEC JURIS.SP_GET_SESSION_STATS;
PRINT '';

-- ============================================
-- TEST 6: CERRAR SESIÓN ESPECÍFICA
-- ============================================
PRINT '-- TEST 6: Cerrar sesión específica';

EXEC JURIS.SP_CLOSE_SESSION @SESSION_ID = @NEW_SESSION_ID;
PRINT '';

-- Verificar que la sesión está inactiva
SELECT IS_ACTIVE, SESSION_ID FROM JURIS.USER_SESSIONS WHERE SESSION_ID = @NEW_SESSION_ID;
PRINT '';

-- ============================================
-- TEST 7: CREAR MÚLTIPLES SESIONES PARA UN USUARIO
-- ============================================
PRINT '-- TEST 7: Crear múltiples sesiones para mismo usuario';

DECLARE @SESSION_2 UNIQUEIDENTIFIER;
DECLARE @SESSION_3 UNIQUEIDENTIFIER;
DECLARE @REFRESH_2 UNIQUEIDENTIFIER = NEWID();
DECLARE @REFRESH_3 UNIQUEIDENTIFIER = NEWID();

EXEC JURIS.SP_CREATE_SESSION
    @SESSION_ID = @SESSION_2 OUTPUT,
    @USER_ID = 456,
    @USER_EMAIL = 'maria@jurissearch.com',
    @USER_ROLE = 1,
    @USER_NAME = 'María',
    @USER_APELLIDO = 'González',
    @USER_IDPLN = 2,
    @USER_UCRCN = 'UCRCN456',
    @USER_PERM = 'READ',
    @REFRESH_TOKEN_ID = @REFRESH_2,
    @EXPIRES_IN_MINUTES = 10080, -- 7 días
    @IP_ADDRESS = '192.168.1.101',
    @USER_AGENT = 'Chrome/120.0.0';

EXEC JURIS.SP_CREATE_SESSION
    @SESSION_ID = @SESSION_3 OUTPUT,
    @USER_ID = 456,
    @USER_EMAIL = 'maria@jurissearch.com',
    @USER_ROLE = 1,
    @USER_NAME = 'María',
    @USER_APELLIDO = 'González',
    @USER_IDPLN = 2,
    @USER_UCRCN = 'UCRCN456',
    @USER_PERM = 'READ',
    @REFRESH_TOKEN_ID = @REFRESH_3,
    @EXPIRES_IN_MINUTES = 10080,
    @IP_ADDRESS = '192.168.1.102',
    @USER_AGENT = 'Firefox/120.0';

PRINT 'Sesiones creadas para USER_ID 456';
PRINT '';

-- Ver sesiones activas del usuario
EXEC JURIS.SP_GET_USER_ACTIVE_SESSIONS @USER_ID = 456;
PRINT '';

-- ============================================
-- TEST 8: CERRAR TODAS LAS SESIONES DE UN USUARIO
-- ============================================
PRINT '-- TEST 8: Cerrar todas las sesiones del usuario 456';

EXEC JURIS.SP_CLOSE_ALL_USER_SESSIONS @USER_ID = 456;
PRINT '';

-- Verificar que no hay sesiones activas
EXEC JURIS.SP_GET_USER_ACTIVE_SESSIONS @USER_ID = 456;
PRINT '';

-- ============================================
-- TEST 9: CREAR SESIÓN EXPIRADA (PARA TESTING CLEANUP)
-- ============================================
PRINT '-- TEST 9: Crear sesión expirada (simulación)';

DECLARE @OLD_SESSION UNIQUEIDENTIFIER = NEWID();

INSERT INTO JURIS.USER_SESSIONS (
    SESSION_ID, USER_ID, USER_EMAIL, USER_ROLE, USER_NAME, USER_APELLIDO,
    USER_IDPLN, USER_UCRCN, USER_PERM, REFRESH_TOKEN_ID, 
    CREATED_AT, EXPIRES_AT, LAST_ACCESSED_AT
)
VALUES (
    @OLD_SESSION, 789, 'old@jurissearch.com', 1, 'Test', 'Usuario',
    1, 'TEST', 'READ', NEWID(),
    DATEADD(DAY, -10, GETDATE()), -- Creada hace 10 días
    DATEADD(DAY, -3, GETDATE()),  -- Expiró hace 3 días
    DATEADD(DAY, -10, GETDATE())
);

PRINT 'Sesión antigua creada para pruebas de limpieza';
PRINT '';

-- ============================================
-- TEST 10: LIMPIAR SESIONES EXPIRADAS
-- ============================================
PRINT '-- TEST 10: Ejecutar limpieza de sesiones expiradas';

EXEC JURIS.SP_CLEANUP_EXPIRED_SESSIONS;
PRINT '';

-- ============================================
-- TEST 11: ESTADÍSTICAS FINALES
-- ============================================
PRINT '-- TEST 11: Estadísticas finales';

EXEC JURIS.SP_GET_SESSION_STATS;
PRINT '';

-- ============================================
-- TEST 12: CONSULTAR TODAS LAS SESIONES (MANUAL)
-- ============================================
PRINT '-- TEST 12: Ver todas las sesiones en la tabla';

SELECT 
    SESSION_ID,
    USER_ID,
    USER_EMAIL,
    USER_NAME + ' ' + USER_APELLIDO AS NOMBRE_COMPLETO,
    CREATED_AT,
    EXPIRES_AT,
    DATEDIFF(MINUTE, GETDATE(), EXPIRES_AT) AS MINUTOS_RESTANTES,
    IS_ACTIVE,
    IP_ADDRESS
FROM JURIS.USER_SESSIONS
ORDER BY CREATED_AT DESC;

PRINT '';
PRINT '========================================';
PRINT 'PRUEBAS COMPLETADAS';
PRINT '========================================';

GO

-- ============================================
-- EJEMPLOS DE CONSULTAS ÚTILES
-- ============================================

-- Ver sesiones activas ahora mismo
SELECT 
    USER_EMAIL,
    COUNT(*) AS SESIONES_ACTIVAS,
    MAX(LAST_ACCESSED_AT) AS ULTIMO_ACCESO
FROM JURIS.USER_SESSIONS
WHERE IS_ACTIVE = 1 AND EXPIRES_AT > GETDATE()
GROUP BY USER_EMAIL;

-- Ver sesiones por expirar en los próximos 5 minutos
SELECT 
    SESSION_ID,
    USER_EMAIL,
    DATEDIFF(SECOND, GETDATE(), EXPIRES_AT) AS SEGUNDOS_RESTANTES
FROM JURIS.USER_SESSIONS
WHERE IS_ACTIVE = 1 
  AND EXPIRES_AT > GETDATE()
  AND EXPIRES_AT < DATEADD(MINUTE, 5, GETDATE())
ORDER BY EXPIRES_AT ASC;

-- Ver actividad de sesiones por día
SELECT 
    CAST(CREATED_AT AS DATE) AS FECHA,
    COUNT(*) AS SESIONES_CREADAS,
    COUNT(DISTINCT USER_ID) AS USUARIOS_UNICOS
FROM JURIS.USER_SESSIONS
WHERE CREATED_AT >= DATEADD(DAY, -7, GETDATE())
GROUP BY CAST(CREATED_AT AS DATE)
ORDER BY FECHA DESC;

