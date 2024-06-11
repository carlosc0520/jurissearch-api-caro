import { UserService } from '../services/User/user.service';
import { TokenService } from '../services/User/token.service';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { DataTable } from 'src/models/DataTable.model.';
import { S3Service } from 'src/services/Aws/aws.service';
import { PreguntasService } from 'src/services/mantenimiento/preguntas.service';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';
import { EmailJurisService } from 'src/services/acompliance/emailJurisserivce';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
import { Result } from 'src/models/result.model';
declare class User {
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
    INTENTOS: number;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
    TOKEN: string;
}
export declare class LoginController {
    private readonly userService;
    private readonly tokenService;
    private readonly noticiaService;
    private readonly preguntaService;
    private readonly emailJurisService;
    private readonly s3Service;
    constructor(userService: UserService, tokenService: TokenService, noticiaService: NoticiaService, preguntaService: PreguntasService, emailJurisService: EmailJurisService, s3Service: S3Service);
    autenticarUsuario(entidad: User): Promise<User>;
    listaAll(entidad: DataTable): Promise<NoticiaModel[]>;
    listaPreguntas(entidad: DataTable): Promise<PreguntaModel[]>;
    sendEmail(entidad: SolicitudModel): Promise<Result>;
}
export {};
