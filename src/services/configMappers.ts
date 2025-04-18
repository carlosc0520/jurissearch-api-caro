const procedures = {
    "JURIS": {
        "loguearUsuario": `EXEC JURIS.USR01_LoguearUsuario`,
    },
    "ADMIN": {
        "USUARIO": {
            "CRUD": "EXEC JURIS.USP_CRUD_USR01",
            "CRUD2": "EXEC JURIS.USP_CRUD_DIRECTORY",
        },
        "FILTROS": {
            "CRUD": "EXEC JURIS.USP_CRUD_FILTROS",
        },
        "ENTRIES": {
            "CRUD": "EXEC JURIS.USP_CRUD_ENTRIES",
        },
        "MAGISTRADOS": {
            "CRUD": "EXEC JURIS.USP_CRUD_MAGISTRADOS"
        },
        "BUSQUEDAS": {
            "CRUD": "EXEC JURIS.USP_CRUD_ENTRIES_BUSQUEDA"
        },
        "HELP": {
            "CRUD": "EXEC JURIS.USP_CRUD_HELP"
        },
        "NOTICIA": {
            "CRUD": "EXEC JURIS.USP_CRUD_NOTICIAS",
            "CRUD2": "EXEC JURIS.USP_CRUD_AUTORES",
            "CRUD3": "EXEC JURIS.USP_CRUD_CATEGORIA",
        },
        "PREGUNTAS": {
            "CRUD": "EXEC JURIS.USP_CRUD_PREGUNTAS"
        },
        "AUDITORIA": {
            "CRUD": "EXEC JURIS.USP_CRUD_AUDITORIA"
        },
        "PLANES": {
            "CRUD": "EXEC JURIS.USP_CRUD_PLANES"
        },
        "HELPERS": {
            "CRUD": "EXEC JURIS.USP_CRUD_HELPERS"
        },
        "BOLETINES": {
            "CRUD": "EXEC JURIS.USP_CRUD_BOLETINES"
        },
        "REPORTES": {
            "CRUD": "EXEC JURIS.USP_CRUD_REPORTES"
        },
    },
    "CCFIRMA": {
        "SOLICITUDES": {
            "CRUD": `EXEC CCFIRMA.USP_CRUD_SOLICITUDES`
        },
        "ASISTENCIAS": {
            "CRUD": `EXEC CCFIRMA.USP_CRUD_ASISTENCIAS`,
            "CRUD2": `EXEC CCFIRMA.USP_CRUD_ASISTENCIAS2`,
            "CRUD3": `EXEC CCFIRMA.USP_CRUD_FEVENTOS`,
        }
    }
}

export default procedures;