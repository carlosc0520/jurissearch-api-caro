export class NoticiaModel {
    ID: number = 0;
    TITULO: string = '';
    DESCRIPCION: string = '';
    IMAGEN: string = '';
    IMAGEN2?: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    IDAUTORES: string = '';
    AUTORES: string = '';
    IDCATEGORIAS: string = '';
    ENLACE: string = '';
    CATEGORIAS: string = '';
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