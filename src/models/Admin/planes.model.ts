export class PlanesModel {
    ID: number = 0;
    DESCRIPCION: string = '';
    VALOR: string = '';
    TIEMPO: number = null;
    PRECIO: number = null;
    RESTRICIONES: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    CDESTDO: string = '';
    ACTUAL?: number = null;
}