import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from '../controllers/login.controller';
import { UserService } from './User/user.service';
import { TokenService } from './User/token.service';

@Module({
    // access Note entity using TypeOrmModule
    imports: [TypeOrmModule.forFeature([])],
    controllers: [LoginController],
    providers: [UserService, TokenService],
})
export class UserModule { }