import { Controller, Get, Query } from '@nestjs/common';
import { HelpersService } from 'src/services/Admin/helpers.service';
import { HelpersModel } from 'src/models/Admin/helpers.model';

@Controller('admin/helpers')
export class HelpersController {
  constructor(private readonly helpersService: HelpersService) {}

  @Get('getHead')
  async getHead(
    @Query('TIPO') TIPO: string
  ): Promise<HelpersModel[]> {
    return await this.helpersService.getHead(TIPO);
  }
}
