import { Request, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../../services/User/user.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { ReporteModelEntrie } from 'src/models/Admin/reporte.model';

class User {
  ID: number;
  USER: string;
  IDROLE: number;
  EMAIL: string;
  PASSWORD: string;
  NOMBRES: string;
  APELLIDO: string;
  APATERNO: string;
  AMATERNO: string;
  TELEFONO: string;
  FNACIMIENTO: Date;
  EBLOQUEO: boolean;
  FVCMNTO: Date;
  RESTRICIONES: string;
  INTENTOS: number;
  CARGO: string;
  DIRECCION: string;
  PROFESION: string;
  UCRCN: string;
  FCRCN: Date;
  FEDCN: Date;
  CDESTDO: string;
  TOKEN: string;
  DATOS?: string;
}

@Controller('admin/user')
export class UsuarioController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Get('validate-token')
  async validateToken(
    @Request() req,
  ): Promise<{
    STATUS: boolean;
    DATA: { IDR: number; ROLE: string; PERM: string[] };
  }> {
    const IDR = req.user.role;
    return {
      STATUS: true,
      DATA: {
        IDR,
        ROLE: IDR === 0 ? 'ADMINISTRADOR' : IDR === 1 ? 'DIGITADOR' : 'USUARIO',
        PERM: req?.user?.PERM || [],
      },
    };
  }

  @Post('add')
  async addUser(@Request() req, @Body() entidad: User): Promise<Result> {
    entidad.USER = req.user.UCRCN;
    entidad.PASSWORD = entidad.APATERNO;
    return await this.userService.createUser(entidad);
  }

  @Get('list')
  async listUsers(
    @Query() entidad: DataTable,
    @Query('IDROLE') IDROLE: string,
  ): Promise<User[]> {
    return await this.userService.list(entidad, IDROLE);
  }

  @Get('get')
  async getUser(@Request() req): Promise<User> {
    return await this.userService.getUser(req.user.ID);
  }

  @Post('delete')
  async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
    return await this.userService.deleteUser(ID, req.user.UCRCN);
  }

  @Post('delete-favorite-directory')
  async deleteFavoriteDirectory(
    @Request() req,
    @Body('IDDIRECTORIO') IDDIRECTORIO: number,
    @Body('IDENTRIE') IDENTRIE: number,
  ): Promise<Result> {
    return await this.userService.deleteFavoriteDirectory(
      IDDIRECTORIO,
      IDENTRIE,
      req.user.UCRCN,
    );
  }

  @Post('edit')
  async editUser(@Request() req, @Body() entidad: User): Promise<Result> {
    entidad.USER = req.user.UCRCN;
    return await this.userService.editUser(entidad);
  }

  @Post('edit-force')
  async editUserForce(@Request() req, @Body() entidad: User): Promise<Result> {
    entidad.USER = req.user.UCRCN;
    entidad.ID = req.user.ID;
    return await this.userService.editUser(entidad);
  }

  @Post('add-directory')
  async createDirectory(@Request() req, @Body() entidad: any): Promise<Result> {
    entidad.USER = req.user.UCRCN;
    entidad.ID = req.user.ID;
    return await this.userService.createDirectory(entidad);
  }

  @Post('shared-directory')
  async sharedDirectory(@Request() req, @Body() entidad: any): Promise<Result> {
    entidad.USER = req.user.UCRCN;
    entidad.ID = req.user.ID;
    return await this.userService.sharedDirectory(entidad);
  }

  @Get('list-directory')
  async listDirectory(
    @Request() req,
    @Query('DSCRPCN') DSCRPCN: string,
    @Query('TYPE') TYPE: string,
  ): Promise<any> {
    return await this.userService.listDirectory(req.user.ID, DSCRPCN, TYPE);
  }

  @Get('list-directory-all')
  async listDirectoryAll(@Request() req): Promise<any> {
    return await this.userService.listDirectoryAll(req.user.ID);
  }

  // **** FAVORITOS ****
  @Get('add-favorite')
  async addFavoriteUser(
    @Request() req,
    @Query('IDENTRIE') IDENTRIE: number,
  ): Promise<any> {
    return await this.userService.addFavoriteUser(
      req.user.UCRCN,
      req.user.ID,
      IDENTRIE,
    );
  }

  @Get('reporte-estadisticos')
  async reporteEstadisticos(
    @Request() req,
    @Query() entidad: ReporteModelEntrie,
  ): Promise<any> {
    return await this.userService.reporteEstadisticos(entidad);
  }
}
