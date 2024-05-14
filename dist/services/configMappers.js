"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
};
exports.default = procedures;
//# sourceMappingURL=configMappers.js.map