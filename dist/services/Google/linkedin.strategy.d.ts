declare const LinkedInStrategy_base: new (...args: any) => any;
export declare class LinkedInStrategy extends LinkedInStrategy_base {
    constructor();
    userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): Promise<void>;
    validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<void>;
}
export {};
