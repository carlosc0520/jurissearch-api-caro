import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LinkedRegisterInAuthGuard extends AuthGuard('linkedin-register') {}
