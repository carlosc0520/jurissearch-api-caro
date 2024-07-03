"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanesModel = void 0;
class PlanesModel {
    constructor() {
        this.ID = 0;
        this.DESCRIPCION = '';
        this.VALOR = '';
        this.TIEMPO = null;
        this.PRECIO = null;
        this.RESTRICIONES = '';
        this.UCRCN = '';
        this.FCRCN = new Date();
        this.FEDCN = new Date();
        this.CDESTDO = '';
    }
}
exports.PlanesModel = PlanesModel;
//# sourceMappingURL=planes.model.js.map