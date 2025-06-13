declare const LinkedRegisterInStrategy_base: new (...args: any) => any;
export declare class LinkedRegisterInStrategy extends LinkedRegisterInStrategy_base {
    constructor();
    validate(accessToken: any, refreshToken: any, profile: any, done: any): Promise<void>;
}
export {};
