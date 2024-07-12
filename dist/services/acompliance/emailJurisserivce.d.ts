import { DataSource } from 'typeorm';
import { Result } from 'src/models/result.model';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
import { TokenService } from '../User/token.service';
import { User } from 'src/models/Admin/user.model';
export declare class EmailJurisService {
    private tokenService;
    private connection;
    private transporter;
    private transporter2;
    constructor(tokenService: TokenService, connection: DataSource);
    sendEmail(model: SolicitudModel): Promise<Result>;
    ccfirmaSendEmail(model: SolicitudModel): Promise<Result>;
    recoveryPassword(model: User): Promise<Result>;
    sendCCFIRMAOportunidaes(name: string, email: string, message: string, file: any, file2: any): Promise<Result>;
}
