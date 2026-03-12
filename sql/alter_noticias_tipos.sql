-- =============================================
-- 1. AGREGAR COLUMNAS NUEVAS A JURIS.NOTICIA
-- =============================================
ALTER TABLE JURIS.NOTICIA ADD
    TIPO        NUMERIC(2)      NULL,
    SUBTITULO   VARCHAR(500)    NULL,
    FCHPUB      DATE            NULL,
    FCHCONSULTA DATE            NULL,
    ORGANO      VARCHAR(200)    NULL,
    ARCHIVO     VARCHAR(500)    NULL;

-- Tipos: 1=Alertas, 2=Artículos, 3=Consultas, 4=Compendios, 5=Boletines
UPDATE JURIS.NOTICIA SET TIPO = 1 WHERE TIPO IS NULL;

-- =============================================
-- 2. ACTUALIZAR EL STORED PROCEDURE
-- =============================================
CREATE OR ALTER PROCEDURE [JURIS].[USP_CRUD_NOTICIAS]
(
    @p_cData        VARCHAR(MAX),
    @p_cUser        VARCHAR(30),
    @p_nTipo        INT,
    @p_nId          NUMERIC(15) OUTPUT
)
AS
BEGIN

DECLARE @cData          VARCHAR(MAX),
        @nExiste        NUMERIC(15),
        @cError         VARCHAR(100),
        @cDescrip       VARCHAR(50),
        @cStatus        CHAR(1),
        @nInit          INT,
        @p_IdTemp       INT,
        @Title          VARCHAR(1000),
        @FCHA           DATETIME = (SELECT SYSDATETIMEOFFSET() AT TIME ZONE 'UTC' AT TIME ZONE 'SA Pacific Standard Time'),
        @nRows          INT;

    SET @p_nId  = ISNULL(@p_nId, 0);
    SET @cData  = REPLACE(@p_cData, 'NULL', 'null');

    IF @p_nTipo IN (1, 3) BEGIN

        SELECT TOP 1 @nExiste = A.ID
        FROM    JURIS.NOTICIA A WITH(NOLOCK)
        OUTER APPLY (
            SELECT TITULO FROM OPENJSON(@cData) WITH (TITULO VARCHAR(200) '$.TITULO')
        ) B
        WHERE   A.TITULO = B.TITULO
        AND     A.ID != @p_nId

        IF @nExiste > 0 AND @p_nTipo = 1 BEGIN
            SET @p_nId = @nExiste;
            RAISERROR('YA EXISTE LA NOTICIA REGISTRADA, VALIDAR!', 15, 217);
            RETURN;
        END;

        BEGIN TRY
            BEGIN TRANSACTION

            MERGE JURIS.NOTICIA AS DEST
            USING (
                SELECT
                    TIPO,
                    TITULO,
                    SUBTITULO,
                    IMAGEN,
                    IDAUTORES,
                    FCHPUB,
                    FCHCONSULTA,
                    ORGANO,
                    ARCHIVO
                FROM OPENJSON(@cData)
                WITH (
                    TIPO            NUMERIC(2)      '$.TIPO',
                    TITULO          VARCHAR(200)    '$.TITULO',
                    SUBTITULO       VARCHAR(500)    '$.SUBTITULO',
                    IMAGEN          VARCHAR(100)    '$.IMAGEN',
                    IDAUTORES       VARCHAR(1000)   '$.IDAUTORES',
                    FCHPUB          DATE            '$.FCHPUB',
                    FCHCONSULTA     DATE            '$.FCHCONSULTA',
                    ORGANO          VARCHAR(200)    '$.ORGANO',
                    ARCHIVO         VARCHAR(500)    '$.ARCHIVO'
                )
            ) AS A (TIPO, TITULO, SUBTITULO, IMAGEN, IDAUTORES, FCHPUB, FCHCONSULTA, ORGANO, ARCHIVO)

            ON (DEST.ID = @p_nId)
            WHEN MATCHED AND @p_nTipo = 3 THEN
                DELETE
            WHEN NOT MATCHED AND @p_nTipo = 1 THEN
                INSERT (
                    TIPO, TITULO, SUBTITULO, IMAGEN, CDESTDO,
                    UCRCN, FCRCN, FEDCN, UEDCN,
                    IDAUTORES, FCHPUB, FCHCONSULTA, ORGANO, ARCHIVO
                )
                VALUES (
                    A.TIPO, A.TITULO, A.SUBTITULO, A.IMAGEN, 'A',
                    @p_cUser, @FCHA, @FCHA, @p_cUser,
                    A.IDAUTORES, A.FCHPUB, A.FCHCONSULTA, A.ORGANO, A.ARCHIVO
                )
            WHEN MATCHED THEN
                UPDATE SET
                    DEST.TIPO           = A.TIPO,
                    DEST.TITULO         = A.TITULO,
                    DEST.SUBTITULO      = A.SUBTITULO,
                    DEST.IMAGEN         = A.IMAGEN,
                    DEST.IDAUTORES      = A.IDAUTORES,
                    DEST.FCHPUB         = A.FCHPUB,
                    DEST.FCHCONSULTA    = A.FCHCONSULTA,
                    DEST.ORGANO         = A.ORGANO,
                    DEST.ARCHIVO        = A.ARCHIVO,
                    DEST.FEDCN          = @FCHA,
                    DEST.UEDCN          = @p_cUser;

            COMMIT TRANSACTION;

            SET @p_IdTemp = @p_nId
            SET @p_nId = IIF(@p_nId = 0, SCOPE_IDENTITY(), @p_nId)

            IF @p_IdTemp = 0 AND @p_nId > 0 BEGIN
                SET @Title = (SELECT TOP 1 TITULO FROM JURIS.NOTICIA WHERE ID = @p_nId);

                INSERT INTO JURIS.NOTIFICACIONES
                    (IDUSER, DESCP, UCRCN, FCRCN, CESTDO, TIPO, IDREL, DEL)
                SELECT
                    A.ID,
                    'Se agregó la noticia ' + @Title,
                    @p_cUser, @FCHA, 'A', 2, @p_nId, 0
                FROM JURIS.USR01 A WITH(NOLOCK)
                WHERE A.CDESTDO = 'A' AND A.NOTIFI IN ('2', '3');
            END

            SELECT @p_nId RESULT

        END TRY
        BEGIN CATCH
            SET @cError = 'ERROR AL INTENTAR PROCESAR EL REGISTRO. ' + ERROR_MESSAGE()
            SET @p_nId = -1;
            PRINT ERROR_MESSAGE()
            ROLLBACK TRANSACTION;
        END CATCH;

    END ELSE IF @p_nTipo = 2 BEGIN

        UPDATE JURIS.NOTICIA
        SET     CDESTDO = IIF(CDESTDO = 'A', 'I', 'A'),
                UEDCN   = @p_cUser,
                FEDCN   = @FCHA
        WHERE   ID = @p_nId

        SELECT @p_nId RESULT

    END ELSE IF @p_nTipo = 4 BEGIN

        DECLARE @ORDER  INT = 0;
        DECLARE @nTipoFiltro NUMERIC(2);

        SELECT  @cStatus        = IIF(CESTDO = '', NULL, CESTDO),
                @nInit          = [INIT],
                @nRows          = [ROWS],
                @cDescrip       = IIF([DESC] = '', NULL, [DESC]),
                @p_nId          = ID,
                @ORDER          = [ORDER],
                @nTipoFiltro    = TIPO
        FROM OPENJSON(@cData)
        WITH (
            CESTDO  CHAR(1)     '$.CESTDO',
            [INIT]  INT         '$.INIT',
            [ROWS]  INT         '$.ROWS',
            [DESC]  VARCHAR(50) '$.DESC',
            ID      NUMERIC(15) '$.ID',
            [ORDER] INT         '$.ORDER',
            TIPO    NUMERIC(2)  '$.TIPO'
        );

        SELECT
            ROW_NUMBER() OVER(ORDER BY A.FEDCN DESC) AS RN,
            COUNT(0) OVER() AS TOTALROWS,
            A.*
        FROM JURIS.NOTICIA A WITH(NOLOCK)
        WHERE   (A.CDESTDO = @cStatus OR @cStatus IS NULL)
        AND     (A.TITULO LIKE '%' + @cDescrip + '%' OR @cDescrip IS NULL)
        AND     (A.ID != @p_nId OR @p_nId IS NULL)
        AND     (A.TIPO = @nTipoFiltro OR @nTipoFiltro IS NULL)
        ORDER BY
            CASE WHEN @ORDER = 0 THEN A.FEDCN END DESC,
            CASE WHEN @ORDER <> 0 THEN A.FEDCN END ASC
        OFFSET @nInit ROWS FETCH NEXT @nRows ROWS ONLY;

    END ELSE IF @p_nTipo = 5 BEGIN

        DECLARE @IDCATEGORIA NUMERIC(15);

        SELECT  @cStatus        = IIF(CESTDO = '', NULL, CESTDO),
                @nInit          = [INIT],
                @nRows          = [ROWS],
                @cDescrip       = IIF([DESC] = '', NULL, [DESC]),
                @p_nId          = ID,
                @IDCATEGORIA    = IDCATEGORIA
        FROM OPENJSON(@cData)
        WITH (
            CESTDO      CHAR(1)     '$.CESTDO',
            [INIT]      INT         '$.INIT',
            [ROWS]      INT         '$.ROWS',
            [DESC]      VARCHAR(50) '$.DESC',
            ID          NUMERIC(15) '$.ID',
            IDCATEGORIA NUMERIC(15) '$.IDCATEGORIA'
        );

        SELECT
            ROW_NUMBER() OVER(ORDER BY A.FEDCN DESC) AS RN,
            COUNT(0) OVER() AS TOTALROWS,
            A.*,
            ISNULL((
                SELECT
                    TRIM(B.NOMBRES) + ' ' + TRIM(B.APELLIDOS) AS AUTOR,
                    B.REDES, B.RUTA
                FROM STRING_SPLIT(A.IDAUTORES, ',') AS split
                JOIN JURIS.AUTORES B ON TRY_CAST(split.value AS INT) = B.ID
                FOR JSON PATH
            ), '[]') AS AUTORES,
            ISNULL((
                SELECT STRING_AGG(C.DESCP, ', ')
                FROM STRING_SPLIT(A.IDCATEGORIAS, ',') AS split
                JOIN JURIS.CATEGORIA C ON TRY_CAST(split.value AS INT) = C.ID
            ), '') AS CATEGORIAS
        FROM JURIS.NOTICIA A WITH(NOLOCK)
        WHERE   (A.CDESTDO = @cStatus OR @cStatus IS NULL)
        AND     (A.TITULO LIKE '%' + @cDescrip + '%' OR @cDescrip IS NULL)
        AND     (@IDCATEGORIA IS NULL OR ',' + A.IDCATEGORIAS + ',' LIKE '%,' + CAST(@IDCATEGORIA AS VARCHAR) + ',%')
        AND     (A.ID = @p_nId OR @p_nId IS NULL)
        ORDER BY A.FEDCN DESC
        OFFSET @nInit ROWS FETCH NEXT @nRows ROWS ONLY;

    END;
END
