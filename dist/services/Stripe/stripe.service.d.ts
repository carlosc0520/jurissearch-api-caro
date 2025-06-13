export declare class StripeService {
    private stripe;
    createCheckoutSession(customerEmail: string, amountInUSD: number, typeSubscription: string): Promise<string>;
}
