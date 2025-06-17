// src/stripe/stripe.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from 'src/services/Stripe/stripe.service';
import Stripe from 'stripe';

@Controller('payment')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {

    });

    @Post('create-payment-intent')
    async createPaymentIntent(@Body() body: { amount: number }) {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(body.amount * 100),
            currency: 'pen',
            automatic_payment_methods: { enabled: true },
        });

        return { clientSecret: paymentIntent.client_secret };
    }

}
