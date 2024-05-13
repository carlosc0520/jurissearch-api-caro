"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let TokenService = class TokenService {
    constructor() {
        this.secretKey = '123456789';
    }
    generateToken(user) {
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
            role: 1,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO
        };
        return jwt.sign(payload, this.secretKey);
    }
    validateToken(token) {
        try {
            jwt.verify(token, this.secretKey);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)()
], TokenService);
//# sourceMappingURL=token.service.js.map