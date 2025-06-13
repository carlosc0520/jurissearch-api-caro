import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleRegisterAuthGuard extends AuthGuard('google-register') {
  constructor() {
    super({
      prompt: 'select_account', // 👈 fuerza mostrar cuenta cada vez
      accessType: 'offline',
      scope: ['email', 'profile'],
    });
  }
}
