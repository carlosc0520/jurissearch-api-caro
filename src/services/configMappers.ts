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
        }
    }
}

export default procedures;