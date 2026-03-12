"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaModel = exports.AutorModel = exports.NoticiaModel = void 0;
class NoticiaModel {
    constructor() {
        this.ID = 0;
        this.TIPO = 1;
        this.DTIPO = '';
        this.TITULO = '';
        this.SUBTITULO = '';
        this.IMAGEN = '';
        this.IMAGEN2 = '';
        this.UCRCN = '';
        this.FCRCN = new Date();
        this.FEDCN = new Date();
        this.IDAUTORES = '';
        this.AUTORES = '';
        this.FCHPUB = null;
        this.FCHCONSULTA = null;
        this.ORGANO = '';
        this.DORGANO = '';
        this.ARCHIVO = '';
        this.CDESTDO = '';
    }
}
exports.NoticiaModel = NoticiaModel;
class AutorModel {
    constructor() {
        this.ID = 0;
        this.NOMBRES = '';
        this.APELLIDOS = '';
        this.REDES = '';
        this.RUTA = '';
        this.UCRCN = '';
        this.FCRCN = new Date();
        this.FEDCN = new Date();
        this.CDESTDO = '';
    }
}
exports.AutorModel = AutorModel;
class CategoriaModel {
    constructor() {
        this.ID = 0;
        this.DESCP = '';
        this.DETALLE = '';
        this.UCRCN = '';
        this.FCRCN = new Date();
        this.FEDCN = new Date();
        this.CDESTDO = '';
    }
}
exports.CategoriaModel = CategoriaModel;
//# sourceMappingURL=noticia.model.js.map