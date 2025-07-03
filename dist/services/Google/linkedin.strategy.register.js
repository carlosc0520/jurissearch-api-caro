"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedRegisterInStrategy = void 0;
const passport_linkedin_oauth2_1 = require("passport-linkedin-oauth2");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let LinkedRegisterInStrategy = class LinkedRegisterInStrategy extends (0, passport_1.PassportStrategy)(passport_linkedin_oauth2_1.Strategy, 'linkedin-register') {
    constructor() {
        let redirectURLAPI = process.env.URL_API;
        super({
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: `${redirectURLAPI}/auth/linkedin/redirect-register`,
            scope: ['profile', 'email', 'openid']
        });
    }
    async userProfile(accessToken, done) {
        try {
            const profileResponse = await axios_1.default.get('https://api.linkedin.com/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const profile = profileResponse.data;
            done(null, profile);
        }
        catch (error) {
            console.log(error);
            done(error);
        }
    }
    ;
    async validate(accessToken, refreshToken, profile, done) {
        try {
            const user = {
                linkedinId: profile.sub,
                email: profile.email,
                name: profile.given_name + ' ' + profile.family_name,
                photo: profile.picture,
                accessToken,
            };
            done(null, user);
        }
        catch (err) {
            console.error('LinkedIn validate error:', err);
            done(err, null);
        }
    }
};
exports.LinkedRegisterInStrategy = LinkedRegisterInStrategy;
exports.LinkedRegisterInStrategy = LinkedRegisterInStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LinkedRegisterInStrategy);
//# sourceMappingURL=linkedin.strategy.register.js.map