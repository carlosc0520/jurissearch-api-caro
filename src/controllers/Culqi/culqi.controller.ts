import { Body, Controller, Post, Req, Request } from '@nestjs/common';
import { CulqiService } from '../../services/Culqi/CulqiService';

@Controller('admin/culqi')
export class CulqiController {
  constructor(private readonly culqiService: CulqiService) { }

  @Post('create-order')
  async createOrder(@Body() body: any) {
    try {
      return this.culqiService.createOrder(body);
    } catch (error) {
      console.error('Error in createOrder controller:', error);
      return { error };
    }
  }

  @Post('charge-with-token')
  async chargeWithToken(@Body() body: any, @Request() req) {
    try {
      return this.culqiService.chargeWithToken({ ...body, id_user: req.user.ID });
    } catch (error) {
      console.error('Error in chargeWithToken controller:', error);
      return { error };
    }
  }

  @Post('webhook')
  async webhook(@Body() payload: any) {
    return this.culqiService.handleWebhook(payload);
  }
}
