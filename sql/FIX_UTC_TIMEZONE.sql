-- ============================================
-- FIX: Cambiar todas las fechas de GETDATE() a GETUTCDATE()
-- Para resolver problema de zona horaria
-- ============================================
-- EJECUTAR ESTE SCRIPT EN SQL5113.site4now.net
-- ============================================

USE JURIS_BD;
GO

PRINT 'Actualizando Stored Procedures para usar UTC...';
GO

-- ============================================
-- 1. SP_CREATE_SESSION - INPUT sessionId + GETUTCDATE()
-- ============================================
ALTER PROCEDURE JURIS.SP_CREATE_SESSION
    @SESSION_ID UNIQUEIDENTIFIER, -- INPUT (no OUTPUT) - recibe el ID desde TypeScript
    @USER_ID INT,
    @USER_EMAIL NVARCHAR(255),
    @USER_ROLE INT,
    @USER_NAME NVARCHAR(255),
    @USER_APELLIDO NVARCHAR(255),
    @USER_IDPLN INT,
    @USER_UCRCN NVARCHAR(50),
    @USER_PERM NVARCHAR(MAX),
    @REFRESH_TOKEN_ID UNIQUEIDENTIFIER,
    @EXPIRES_IN_MINUTES INT,
    @IP_ADDRESS NVARCHAR(45) = NULL,
    @USER_AGENT NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO JURIS.USER_SESSIONS (
            SESSION_ID, USER_ID, USER_EMAIL, USER_ROLE, USER_NAME, USER_APELLIDO,
            USER_IDPLN, USER_UCRCN, USER_PERM, REFRESH_TOKEN_ID, EXPIRES_AT,
            IP_ADDRESS, USER_AGENT
        )
        VALUES (
            @SESSION_ID, @USER_ID, @USER_EMAIL, @USER_ROLE, @USER_NAME, @USER_APELLIDO,
            @USER_IDPLN, @USER_UCRCN, @USER_PERM, @REFRESH_TOKEN_ID, 
            DATEADD(MINUTE, @EXPIRES_IN_MINUTES, GETUTCDATE()),
            @IP_ADDRESS, @USER_AGENT
        );
        
        SELECT 
            @SESSION_ID AS SESSION_ID,
            'OK' AS STATUS,
            'Sesión creada exitosamente' AS MESSAGE;
            
    END TRY
    BEGIN CATCH
        SELECT 
            NULL AS SESSION_ID,
            'ERROR' AS STATUS,
            ERROR_MESSAGE() AS MESSAGE;
    END CATCH
END;
GO

PRINT '✓ SP_CREATE_SESSION actualizado';
GO

-- ============================================
-- 2. SP_GET_SESSION - GETUTCDATE()
-- ============================================
ALTER PROCEDURE JURIS.SP_GET_SESSION
    @SESSION_ID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            SESSION_ID, USER_ID, USER_EMAIL, USER_ROLE, USER_NAME, USER_APELLIDO,
            USER_IDPLN, USER_UCRCN, USER_PERM, REFRESH_TOKEN_ID, EXPIRES_AT,
            CREATED_AT, LAST_ACCESSED_AT, IP_ADDRESS, USER_AGENT, IS_ACTIVE
        FROM JURIS.USER_SESSIONS
        WHERE SESSION_ID = @SESSION_ID 
          AND IS_ACTIVE = 1
          AND EXPIRES_AT > GETUTCDATE();
        
        UPDATE JURIS.USER_SESSIONS 
        SET LAST_ACCESSED_AT = GETUTCDATE()
        WHERE SESSION_ID = @SESSION_ID AND IS_ACTIVE = 1;
        
    END TRY
    BEGIN CATCH
        SELECT 
            ERROR_MESSAGE() AS ERROR,
            'ERROR' AS STATUS;
    END CATCH
END;
GO

PRINT '✓ SP_GET_SESSION actualizado';
GO

-- ============================================
-- 3. SP_GET_SESSION_BY_REFRESH_TOKEN - GETUTCDATE()
-- ============================================
ALTER PROCEDURE JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN
    @REFRESH_TOKEN_ID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            SESSION_ID, USER_ID, USER_EMAIL, USER_ROLE, USER_NAME, USER_APELLIDO,
            USER_IDPLN, USER_UCRCN, USER_PERM, REFRESH_TOKEN_ID, EXPIRES_AT,
            CREATED_AT, LAST_ACCESSED_AT, IP_ADDRESS, USER_AGENT, IS_ACTIVE
        FROM JURIS.USER_SESSIONS
        WHERE REFRESH_TOKEN_ID = @REFRESH_TOKEN_ID 
          AND IS_ACTIVE = 1
          AND EXPIRES_AT > GETUTCDATE();
          
        UPDATE JURIS.USER_SESSIONS 
        SET LAST_ACCESSED_AT = GETUTCDATE()
        WHERE REFRESH_TOKEN_ID = @REFRESH_TOKEN_ID AND IS_ACTIVE = 1;
        
    END TRY
    BEGIN CATCH
        SELECT 
            ERROR_MESSAGE() AS ERROR,
            'ERROR' AS STATUS;
    END CATCH
END;
GO

PRINT '✓ SP_GET_SESSION_BY_REFRESH_TOKEN actualizado';
GO

-- ============================================
-- 4. SP_GET_USER_ACTIVE_SESSIONS - GETUTCDATE()
-- ============================================
ALTER PROCEDURE JURIS.SP_GET_USER_ACTIVE_SESSIONS
    @USER_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            SESSION_ID, 
            CREATED_AT, 
            LAST_ACCESSED_AT, 
            EXPIRES_AT,
            IP_ADDRESS, 
            USER_AGENT,
            DATEDIFF(MINUTE, GETUTCDATE(), EXPIRES_AT) AS MINUTES_REMAINING
        FROM JURIS.USER_SESSIONS
        WHERE USER_ID = @USER_ID 
          AND IS_ACTIVE = 1
          AND EXPIRES_AT > GETUTCDATE()
        ORDER BY LAST_ACCESSED_AT DESC;
        
    END TRY
    BEGIN CATCH
        SELECT 
            ERROR_MESSAGE() AS ERROR,
            'ERROR' AS STATUS;
    END CATCH
END;
GO

PRINT '✓ SP_GET_USER_ACTIVE_SESSIONS actualizado';
GO

-- ============================================
-- 5. SP_CLEANUP_EXPIRED_SESSIONS - GETUTCDATE()
-- ============================================
ALTER PROCEDURE JURIS.SP_CLEANUP_EXPIRED_SESSIONS
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DELETED_COUNT INT;
    
    BEGIN TRY
        DELETE FROM JURIS.USER_SESSIONS
        WHERE EXPIRES_AT < DATEADD(DAY, -7, GETUTCDATE());
        
        SET @DELETED_COUNT = @@ROWCOUNT;
        
        SELECT 
            @DELETED_COUNT AS DELETED_ROWS,
            'OK' AS STATUS,
            'Limpieza completada' AS MESSAGE;
            
    END TRY
    BEGIN CATCH
        SELECT 
            0 AS DELETED_ROWS,
            'ERROR' AS STATUS,
            ERROR_MESSAGE() AS MESSAGE;
    END CATCH
END;
GO

PRINT '✓ SP_CLEANUP_EXPIRED_SESSIONS actualizado';
GO

-- ============================================
-- 6. SP_GET_SESSION_STATS - GETUTCDATE()
-- ============================================
ALTER PROCEDURE JURIS.SP_GET_SESSION_STATS
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS TOTAL_SESSIONS,
        SUM(CASE WHEN IS_ACTIVE = 1 AND EXPIRES_AT > GETUTCDATE() THEN 1 ELSE 0 END) AS ACTIVE_SESSIONS,
        SUM(CASE WHEN IS_ACTIVE = 0 THEN 1 ELSE 0 END) AS CLOSED_SESSIONS,
        SUM(CASE WHEN EXPIRES_AT < GETUTCDATE() THEN 1 ELSE 0 END) AS EXPIRED_SESSIONS,
        COUNT(DISTINCT USER_ID) AS UNIQUE_USERS,
        MIN(CREATED_AT) AS OLDEST_SESSION,
        MAX(CREATED_AT) AS NEWEST_SESSION
    FROM JURIS.USER_SESSIONS;
END;
GO

PRINT '✓ SP_GET_SESSION_STATS actualizado';
GO

-- ============================================
-- 7. LIMPIAR SESIONES EXISTENTES (OPCIONAL)
-- ============================================
-- Descomentar si quieres limpiar las sesiones antiguas con fechas incorrectas:
/*
DELETE FROM JURIS.USER_SESSIONS;
PRINT '✓ Sesiones existentes eliminadas';
GO
*/

-- ============================================
-- VERIFICACIÓN
-- ============================================
PRINT '';
PRINT '========================================';
PRINT 'ACTUALIZACIÓN COMPLETADA';
PRINT '========================================';
PRINT '';
PRINT 'Todos los SPs ahora usan GETUTCDATE() (UTC)';
PRINT '';
PRINT 'Verificar:';
PRINT '  SELECT GETDATE() AS HoraLocal, GETUTCDATE() AS HoraUTC;';
PRINT '';
PRINT 'Probar login y verificar que las fechas coincidan';
PRINT '========================================';
GO
