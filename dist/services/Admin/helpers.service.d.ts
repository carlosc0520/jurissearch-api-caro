import { DataSource } from 'typeorm';
import { HelpersModel } from 'src/models/Admin/helpers.model';
export declare class HelpersService {
    private connection;
    constructor(connection: DataSource);
    getHead(TIPO: string): Promise<HelpersModel[]>;
}
