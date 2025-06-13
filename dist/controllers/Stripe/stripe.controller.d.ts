import { StripeService } from 'src/services/Stripe/stripe.service';
export declare class StripeController {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    private stripe;
    createCheckout(body: {
        email: string;
        amount: number;
    }): Promise<string>;
    createPaymentIntent(body: {
        amount: number;
    }): Promise<{
        clientSecret: string;
    }>;
}
