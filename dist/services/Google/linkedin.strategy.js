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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInStrategy = void 0;
const passport_linkedin_oauth2_1 = require("passport-linkedin-oauth2");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
let LinkedInStrategy = class LinkedInStrategy extends (0, passport_1.PassportStrategy)(passport_linkedin_oauth2_1.Strategy, 'linkedin') {
    constructor() {
        let redirectURLAPI = process.env.URL_API;
        super({
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: `${redirectURLAPI}/auth/linkedin/redirect`,
            scope: ['r_emailaddress', 'r_liteprofile']
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        var _a;
        const { id, emails, displayName, photos } = profile;
        const user = {
            linkedinId: id,
            name: displayName,
            email: emails[0].value,
            picture: (_a = photos === null || photos === void 0 ? void 0 : photos[0]) === null || _a === void 0 ? void 0 : _a.value,
        };
        done(null, user);
    }
};
exports.LinkedInStrategy = LinkedInStrategy;
exports.LinkedInStrategy = LinkedInStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LinkedInStrategy);
//# sourceMappingURL=linkedin.strategy.js.map