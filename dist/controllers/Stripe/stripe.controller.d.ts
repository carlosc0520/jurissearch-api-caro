import { StripeService } from 'src/services/Stripe/stripe.service';
export declare class StripeController {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    private stripe;
    createPaymentIntent(body: {
        amount: number;
    }): Promise<{
        clientSecret: string;
    }>;
}
