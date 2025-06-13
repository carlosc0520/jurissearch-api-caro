declare const LinkedInStrategy_base: new (...args: any) => any;
export declare class LinkedInStrategy extends LinkedInStrategy_base {
    constructor();
    validate(accessToken: any, refreshToken: any, profile: any, done: any): Promise<void>;
}
export {};
