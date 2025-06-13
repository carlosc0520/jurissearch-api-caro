import { Strategy } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkedRegisterInStrategy extends PassportStrategy(Strategy, 'linkedin-register') {

  constructor() {
    let redirectURLAPI: string = process.env.URL_API;

    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${redirectURLAPI}/auth/linkedin/redirect-register`,
      scope: ['r_emailaddress', 'r_liteprofile']
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const { id, emails, displayName, photos } = profile;
    const user = {
      linkedinId: id,
      name: displayName,
      email: emails[0].value,
      picture: photos?.[0]?.value,
    };
    done(null, user);
  }
}
