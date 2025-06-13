import { Strategy } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    let redirectURLAPI: string = process.env.URL_API;

    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${redirectURLAPI}/auth/linkedin/redirect`,
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
