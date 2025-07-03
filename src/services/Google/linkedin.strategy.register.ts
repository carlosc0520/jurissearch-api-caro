import { Strategy } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LinkedRegisterInStrategy extends PassportStrategy(Strategy, 'linkedin-register') {

  constructor() {
    let redirectURLAPI: string = process.env.URL_API;

    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${redirectURLAPI}/auth/linkedin/redirect-register`,
      scope: ['profile', 'email', 'openid']
    });
  }

 async userProfile(
    accessToken: string,
    done: (err?: Error | null, profile?: any) => void,
  ): Promise<void> {
    try {
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profile = profileResponse.data;

      done(null, profile);
    } catch (error) {
      console.log(error)
      done(error);
    }
  };



  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const user = {
        linkedinId: profile.sub,
        email: profile.email,
        name: profile.given_name + ' ' + profile.family_name,
        photo: profile.picture,
        accessToken,
      };
      done(null, user);
    } catch (err) {
      console.error('LinkedIn validate error:', err);
      done(err, null);
    }
  }
}
