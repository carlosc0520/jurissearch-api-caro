export class NoticiaModel {
    ID: number = 0;
    TIPO: number = 1;
    DTIPO: string = '';
    TITULO: string = '';
    SUBTITULO: string = '';
    IMAGEN: string = '';
    IMAGEN2?: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    IDAUTORES: string = '';
    AUTORES: string = '';
    FCHPUB: Date = null;
    FCHCONSULTA: Date = null;
    ORGANO: string = '';
    DORGANO: string = '';
    ARCHIVO: string = '';
    CDESTDO: string = '';
}

export class AutorModel {
    ID: number = 0;
    NOMBRES: string = '';
    APELLIDOS: string = '';
    REDES: string = '';
    RUTA: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    CDESTDO: string = '';
}

export class CategoriaModel {
    ID: number = 0;
    DESCP: string = '';
    DETALLE: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    CDESTDO: string = '';
}