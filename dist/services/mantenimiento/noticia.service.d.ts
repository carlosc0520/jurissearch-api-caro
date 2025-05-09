import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { AutorModel, CategoriaModel, NoticiaModel } from 'src/models/Admin/noticia.model';
export declare class NoticiaService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: NoticiaModel): Promise<Result>;
    list(entidad: DataTable): Promise<NoticiaModel[]>;
    listNoticias(entidad: DataTable): Promise<NoticiaModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: NoticiaModel): Promise<Result>;
    listAutores(entidad: DataTable): Promise<NoticiaModel[]>;
    createAutor(entidad: AutorModel): Promise<Result>;
    editAutor(entidad: AutorModel): Promise<Result>;
    deleteAutor(id: number, UCRCN: string): Promise<Result>;
    listCategorias(entidad: DataTable): Promise<NoticiaModel[]>;
    createCategoria(entidad: CategoriaModel): Promise<Result>;
    editCategoria(entidad: CategoriaModel): Promise<Result>;
    deleteCategoria(id: number, UCRCN: string): Promise<Result>;
    listRecursos(entidad: DataTable): Promise<any[]>;
    createRecurso(entidad: NoticiaModel): Promise<Result>;
    deleteRecurso(id: number, UCRCN: string): Promise<Result>;
}
