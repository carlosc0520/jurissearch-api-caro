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
        }
    }
}

export default procedures;