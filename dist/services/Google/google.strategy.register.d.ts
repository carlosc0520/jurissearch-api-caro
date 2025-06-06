import { VerifyCallback } from 'passport-google-oauth20';
declare const GoogleRegisterStrategy_base: new (...args: any) => any;
export declare class GoogleRegisterStrategy extends GoogleRegisterStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any>;
}
export {};
