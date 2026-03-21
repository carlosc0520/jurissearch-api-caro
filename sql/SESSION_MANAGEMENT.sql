
-- ============================================
-- 1. CREAR SCHEMA (si no existe)
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'JURIS')
BEGIN
    EXEC('CREATE SCHEMA JURIS');
    PRINT 'Schema JURIS creado exitosamente';
END
ELSE
BEGIN
    PRINT 'Schema JURIS ya existe';
END
GO

-- ============================================
-- 2. CREAR TABLA DE SESIONES
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.USER_SESSIONS') AND type in (N'U'))
BEGIN
    PRINT 'Tabla JURIS.USER_SESSIONS ya existe - se eliminará';
    DROP TABLE JURIS.USER_SESSIONS;
END
GO

CREATE TABLE JURIS.USER_SESSIONS (
    -- Identificación de Sesión
    SESSION_ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    REFRESH_TOKEN_ID UNIQUEIDENTIFIER NOT NULL,
    
    -- Datos del Usuario
    USER_ID INT NOT NULL,
    USER_EMAIL NVARCHAR(255) NOT NULL,
    USER_ROLE INT NOT NULL,
    USER_NAME NVARCHAR(255) NOT NULL,
    USER_APELLIDO NVARCHAR(255) NOT NULL,
    USER_IDPLN INT NOT NULL,
    USER_UCRCN NVARCHAR(50) NOT NULL,
    USER_PERM NVARCHAR(MAX) NOT NULL,
    
    -- Control de Tiempos (UTC)
    CREATED_AT DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    EXPIRES_AT DATETIME2 NOT NULL,
    LAST_ACCESSED_AT DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Metadata de Seguridad
    IP_ADDRESS NVARCHAR(45) NULL,
    USER_AGENT NVARCHAR(500) NULL,
    IS_ACTIVE BIT NOT NULL DEFAULT 1,
    
    -- Índices
    INDEX IX_USER_SESSIONS_USER_ID (USER_ID),
    INDEX IX_USER_SESSIONS_USER_EMAIL (USER_EMAIL),
    INDEX IX_USER_SESSIONS_EXPIRES_AT (EXPIRES_AT),
    INDEX IX_USER_SESSIONS_REFRESH_TOKEN_ID (REFRESH_TOKEN_ID),
    INDEX IX_USER_SESSIONS_ACTIVE_EXPIRES (IS_ACTIVE, EXPIRES_AT)
);
GO

PRINT 'Tabla JURIS.USER_SESSIONS creada exitosamente';
GO

-- ============================================
-- 3. SP: CREAR NUEVA SESIÓN
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CREATE_SESSION') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_CREATE_SESSION;
END
GO

CREATE PROCEDURE JURIS.SP_CREATE_SESSION
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
    @EXPIRES_IN_MINUTES INT, -- 4 minutos (testing) o 10080 minutos (7 días producción)
    @IP_ADDRESS NVARCHAR(45) = NULL,
    @USER_AGENT NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Ya NO generamos el SESSION_ID aquí, viene como parámetro
        
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

PRINT 'SP JURIS.SP_CREATE_SESSION creado exitosamente';
GO

-- ============================================
-- 4. SP: OBTENER SESIÓN POR SESSION_ID
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_SESSION') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_GET_SESSION;
END
GO

CREATE PROCEDURE JURIS.SP_GET_SESSION
    @SESSION_ID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Obtener sesión si está activa y no ha expirado
        SELECT 
            SESSION_ID, USER_ID, USER_EMAIL, USER_ROLE, USER_NAME, USER_APELLIDO,
            USER_IDPLN, USER_UCRCN, USER_PERM, REFRESH_TOKEN_ID, EXPIRES_AT,
            CREATED_AT, LAST_ACCESSED_AT, IP_ADDRESS, USER_AGENT, IS_ACTIVE
        FROM JURIS.USER_SESSIONS
        WHERE SESSION_ID = @SESSION_ID 
          AND IS_ACTIVE = 1
          AND EXPIRES_AT > GETUTCDATE();
        
        -- Actualizar último acceso
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

PRINT 'SP JURIS.SP_GET_SESSION creado exitosamente';
GO

-- ============================================
-- 5. SP: OBTENER SESIÓN POR REFRESH_TOKEN_ID
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN;
END
GO

CREATE PROCEDURE JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN
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
          
        -- Actualizar último acceso
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

PRINT 'SP JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN creado exitosamente';
GO

-- ============================================
-- 6. SP: CERRAR SESIÓN (LOGOUT)
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CLOSE_SESSION') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_CLOSE_SESSION;
END
GO

CREATE PROCEDURE JURIS.SP_CLOSE_SESSION
    @SESSION_ID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE JURIS.USER_SESSIONS
        SET IS_ACTIVE = 0
        WHERE SESSION_ID = @SESSION_ID;
        
        SELECT 
            @@ROWCOUNT AS AFFECTED_ROWS,
            'OK' AS STATUS,
            'Sesión cerrada exitosamente' AS MESSAGE;
            
    END TRY
    BEGIN CATCH
        SELECT 
            0 AS AFFECTED_ROWS,
            'ERROR' AS STATUS,
            ERROR_MESSAGE() AS MESSAGE;
    END CATCH
END;
GO

PRINT 'SP JURIS.SP_CLOSE_SESSION creado exitosamente';
GO

-- ============================================
-- 7. SP: CERRAR TODAS LAS SESIONES DE UN USUARIO
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CLOSE_ALL_USER_SESSIONS') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_CLOSE_ALL_USER_SESSIONS;
END
GO

CREATE PROCEDURE JURIS.SP_CLOSE_ALL_USER_SESSIONS
    @USER_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE JURIS.USER_SESSIONS
        SET IS_ACTIVE = 0
        WHERE USER_ID = @USER_ID AND IS_ACTIVE = 1;
        
        SELECT 
            @@ROWCOUNT AS AFFECTED_ROWS,
            'OK' AS STATUS,
            'Todas las sesiones del usuario cerradas' AS MESSAGE;
            
    END TRY
    BEGIN CATCH
        SELECT 
            0 AS AFFECTED_ROWS,
            'ERROR' AS STATUS,
            ERROR_MESSAGE() AS MESSAGE;
    END CATCH
END;
GO

PRINT 'SP JURIS.SP_CLOSE_ALL_USER_SESSIONS creado exitosamente';
GO

-- ============================================
-- 8. SP: LIMPIAR SESIONES EXPIRADAS
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CLEANUP_EXPIRED_SESSIONS') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_CLEANUP_EXPIRED_SESSIONS;
END
GO

CREATE PROCEDURE JURIS.SP_CLEANUP_EXPIRED_SESSIONS
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DELETED_COUNT INT;
    
    BEGIN TRY
        -- Eliminar sesiones expiradas hace más de 7 días
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

PRINT 'SP JURIS.SP_CLEANUP_EXPIRED_SESSIONS creado exitosamente';
GO

-- ============================================
-- 9. SP: OBTENER SESIONES ACTIVAS DE UN USUARIO
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_USER_ACTIVE_SESSIONS') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_GET_USER_ACTIVE_SESSIONS;
END
GO

CREATE PROCEDURE JURIS.SP_GET_USER_ACTIVE_SESSIONS
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

PRINT 'SP JURIS.SP_GET_USER_ACTIVE_SESSIONS creado exitosamente';
GO

-- ============================================
-- 10. SP: OBTENER ESTADÍSTICAS DE SESIONES
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_SESSION_STATS') AND type in (N'P'))
BEGIN
    DROP PROCEDURE JURIS.SP_GET_SESSION_STATS;
END
GO

CREATE PROCEDURE JURIS.SP_GET_SESSION_STATS
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

PRINT 'SP JURIS.SP_GET_SESSION_STATS creado exitosamente';
GO

-- ============================================
-- 11. CREAR JOB PARA LIMPIEZA AUTOMÁTICA (OPCIONAL)
-- ============================================
/*
-- DESCOMENTAR PARA CREAR JOB AUTOMÁTICO

USE msdb;
GO

-- Eliminar job si existe
IF EXISTS (SELECT * FROM msdb.dbo.sysjobs WHERE name = 'JURIS_CLEANUP_EXPIRED_SESSIONS')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = 'JURIS_CLEANUP_EXPIRED_SESSIONS';
    PRINT 'Job anterior eliminado';
END
GO

-- Crear nuevo job
EXEC dbo.sp_add_job
    @job_name = N'JURIS_CLEANUP_EXPIRED_SESSIONS',
    @enabled = 1,
    @description = N'Elimina sesiones expiradas cada hora del sistema JurisSearch';
GO

-- Agregar paso de ejecución
EXEC sp_add_jobstep
    @job_name = N'JURIS_CLEANUP_EXPIRED_SESSIONS',
    @step_name = N'Ejecutar Limpieza',
    @subsystem = N'TSQL',
    @command = N'EXEC JURIS.SP_CLEANUP_EXPIRED_SESSIONS',
    @database_name = N'JURIS_BD', -- CAMBIAR AL NOMBRE DE TU BD
    @retry_attempts = 3,
    @retry_interval = 5;
GO

-- Agregar schedule (cada hora)
EXEC sp_add_schedule
    @schedule_name = N'Cada_Hora',
    @freq_type = 4, -- Diario
    @freq_interval = 1,
    @freq_subday_type = 8, -- Horas
    @freq_subday_interval = 1,
    @active_start_time = 0;
GO

-- Asociar schedule con job
EXEC sp_attach_schedule
    @job_name = N'JURIS_CLEANUP_EXPIRED_SESSIONS',
    @schedule_name = N'Cada_Hora';
GO

-- Agregar job al servidor
EXEC sp_add_jobserver
    @job_name = N'JURIS_CLEANUP_EXPIRED_SESSIONS';
GO

PRINT 'Job JURIS_CLEANUP_EXPIRED_SESSIONS creado exitosamente';
*/

-- ============================================
-- 12. PRUEBAS Y VERIFICACIÓN
-- ============================================

PRINT '';
PRINT '========================================';
PRINT 'INSTALACIÓN COMPLETADA';
PRINT '========================================';
PRINT '';
PRINT 'Objetos creados:';
PRINT '  - Schema: JURIS';
PRINT '  - Tabla: JURIS.USER_SESSIONS';
PRINT '  - 9 Stored Procedures';
PRINT '';
PRINT 'Para probar:';
PRINT '  EXEC JURIS.SP_GET_SESSION_STATS;';
PRINT '';
PRINT 'Para crear Job automático:';
PRINT '  Descomentar sección 11 del script';
PRINT '';
PRINT '========================================';

-- Verificar instalación
SELECT 
    'JURIS.USER_SESSIONS' AS OBJETO,
    'TABLA' AS TIPO,
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.USER_SESSIONS')) 
        THEN 'OK' ELSE 'ERROR' END AS ESTADO
UNION ALL
SELECT 'JURIS.SP_CREATE_SESSION', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CREATE_SESSION')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_GET_SESSION', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_SESSION')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_CLOSE_SESSION', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CLOSE_SESSION')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_CLOSE_ALL_USER_SESSIONS', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CLOSE_ALL_USER_SESSIONS')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_CLEANUP_EXPIRED_SESSIONS', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_CLEANUP_EXPIRED_SESSIONS')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_GET_USER_ACTIVE_SESSIONS', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_USER_ACTIVE_SESSIONS')) 
        THEN 'OK' ELSE 'ERROR' END
UNION ALL
SELECT 'JURIS.SP_GET_SESSION_STATS', 'SP', 
    CASE WHEN EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'JURIS.SP_GET_SESSION_STATS')) 
        THEN 'OK' ELSE 'ERROR' END;

GO
