import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { AutorModel, CategoriaModel, NoticiaModel } from 'src/models/Admin/noticia.model';

@Injectable()
export class NoticiaService {
    constructor(
        private connection: DataSource
    ) { }

    async create(entidad: NoticiaModel): Promise<Result> {

        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const ID = result?.[0]?.RESULT;
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Noticia agregada correctamente" : "Ocurrió un error al intentar agregar la noticia";
            return { MESSAGE, STATUS: isSuccess, ID };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la noticia";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable): Promise<NoticiaModel[]> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async listNoticias(entidad: DataTable): Promise<NoticiaModel[]> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async delete(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }

    async edit(entidad: NoticiaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        let jsonData = JSON.stringify(entidad).replace(/'/g, "''");  // solo escapamos comillas simples para SQL
        
        queryAsync += ` @p_cData = ${entidad ? `'${jsonData}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad?.UCRCN}',`;  // agrega COMILLAS AQUÍ porque es string
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;
                
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Noticia editada correctamente" : "Ocurrió un error al intentar editar la noticia";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la noticia";
            return { MESSAGE, STATUS: false };
        }
    }

    // autores
    async listAutores(entidad: DataTable): Promise<NoticiaModel[]> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async createAutor(entidad: AutorModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Autor agregado correctamente" : "Ocurrió un error al intentar agregar el autor";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar el autor";
            return { MESSAGE, STATUS: false };
        }
    }

    async editAutor(entidad: AutorModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Autor editado correctamente" : "Ocurrió un error al intentar editar el autor";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el autor";
            return { MESSAGE, STATUS: false };
        }
    }

    async deleteAutor(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }

    // CATEGORIAS
    async listCategorias(entidad: DataTable): Promise<NoticiaModel[]> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async createCategoria(entidad: CategoriaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Categoria agregada correctamente" : "Ocurrió un error al intentar agregar la categoria";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la categoria";
            return { MESSAGE, STATUS: false };
        }
    }

    async editCategoria(entidad: CategoriaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Categoria editada correctamente" : "Ocurrió un error al intentar editar la categoria";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la categoria";
            return { MESSAGE, STATUS: false };
        }
    }

    async deleteCategoria(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }

    // * RECURSOS
    async listRecursos(entidad: DataTable): Promise<any[]> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD4;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async createRecurso(entidad: NoticiaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD4;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Recurso agregado correctamente" : "Ocurrió un error al intentar agregar el recurso";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar el recurso";
            return { MESSAGE, STATUS: false };
        }
    }

    async deleteRecurso(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD4;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }
}
