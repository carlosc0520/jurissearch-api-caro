export class PreguntaModel {
    ID: number = 0;
    DESCRIPCION: string = '';
    HTMLTEXT: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    CDESTDO: string = '';
    ORDEN?: number = 0;
}