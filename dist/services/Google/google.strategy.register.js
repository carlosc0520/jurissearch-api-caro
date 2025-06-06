"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleRegisterStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
class GoogleRegisterStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google-register') {
    constructor() {
        let redirectURLAPI = 'https://api.jurissearch.com';
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${redirectURLAPI}/auth/google/redirect-register`,
            scope: ['email', 'profile']
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
}
exports.GoogleRegisterStrategy = GoogleRegisterStrategy;
//# sourceMappingURL=google.strategy.register.js.map