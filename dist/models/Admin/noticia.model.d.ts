export declare class NoticiaModel {
    ID: number;
    TITULO: string;
    DESCRIPCION: string;
    IMAGEN: string;
    IMAGEN2?: string;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    IDAUTORES: string;
    AUTORES: string;
    IDCATEGORIAS: string;
    ENLACE: string;
    CATEGORIAS: string;
    CDESTDO: string;
}
export declare class AutorModel {
    ID: number;
    NOMBRES: string;
    APELLIDOS: string;
    REDES: string;
    RUTA: string;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
}
export declare class CategoriaModel {
    ID: number;
    DESCP: string;
    DETALLE: string;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
}
