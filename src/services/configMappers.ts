const procedures = {
    "JURIS": {
        "loguearUsuario": `EXEC JURIS.USR01_LoguearUsuario`,
    },
    "ADMIN": {
        "USUARIO": {
            "CRUD": "EXEC JURIS.USP_CRUD_USR01",
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
            "CRUD": "EXEC JURIS.USP_CRUD_NOTICIAS"
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
    },
    "CCFIRMA": {
        "SOLICITUDES": {
            "CRUD": `EXEC CCFIRMA.USP_CRUD_SOLICITUDES`
        }
    }
}

export default procedures;