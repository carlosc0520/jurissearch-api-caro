// src/guards/google-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      prompt: 'select_account', // 👈 fuerza mostrar cuenta cada vez
      accessType: 'offline',
      scope: ['email', 'profile'],
    });
  }
}
