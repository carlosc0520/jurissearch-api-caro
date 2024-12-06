import { S3Service } from 'src/services/Aws/aws.service';
import { DataTable } from 'src/models/DataTable.model.';
import { BoletinService } from 'src/services/Admin/boletin.service';
import { BoletinModel } from 'src/models/Admin/boletin.model';
import { UserService } from 'src/services/User/user.service';
import { EmailService } from 'src/services/acompliance/email.service';
export declare class BoletinController {
    private readonly boletinService;
    private readonly s3Service;
    private readonly userService;
    private readonly emailService;
    constructor(boletinService: BoletinService, s3Service: S3Service, userService: UserService, emailService: EmailService);
    uploadMultipleFiles(req: any, entidad: BoletinModel, files: any): Promise<any>;
    list(entidad: DataTable): Promise<BoletinModel[]>;
}
