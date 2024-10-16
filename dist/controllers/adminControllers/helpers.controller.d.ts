import { HelpersService } from 'src/services/Admin/helpers.service';
import { HelpersModel } from 'src/models/Admin/helpers.model';
export declare class HelpersController {
    private readonly helpersService;
    constructor(helpersService: HelpersService);
    getHead(TIPO: string): Promise<HelpersModel[]>;
}
