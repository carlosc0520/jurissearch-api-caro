import { Request, Body, Controller, Get, Post, Query, UseInterceptors, UploadedFiles, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../services/User/user.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { ReporteModelEntrie } from 'src/models/Admin/reporte.model';
import { HostingerService } from 'src/services/Aws/hostinger.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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
  RTAFTO?: string;
}

@Controller('admin/user')
export class UsuarioController {
  constructor(
    private readonly userService: UserService,
    private readonly hostingerService: HostingerService
  ) { }

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
    let result = await this.userService.getUser(req.user.ID);
    result.RTAFTO = result.RTAFTO ? process.env.DOMINIO + result.RTAFTO : null;
    return result;
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

  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
          return cb(null, filename);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/png|jpg|jpeg|webp|avif/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen'), false);
        }
      },
    }),
  )
  @Post('edit-force')
  async editUserForce(@Request() req, @Body() entidad: User, @UploadedFiles() files): Promise<Result> {
    entidad.RTAFTO = entidad.RTAFTO ? entidad.RTAFTO.replace(process.env.DOMINIO, '') : null;

    if(files && files.length > 0) {
      let file = files[0];	
      if(entidad.RTAFTO) await this.hostingerService.deleteFile(entidad.RTAFTO);
      let result = await this.hostingerService.saveFile(file, "usuarios");
      entidad.RTAFTO = result.path;
    } 
  
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
