// src/stripe/stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {

    });

    async createCheckoutSession(customerEmail: string, amountInUSD: number, typeSubscription: string): Promise<string> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: customerEmail,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount: amountInUSD * 100,
                    product_data: {
                        name: typeSubscription
                    },
                },
                quantity: 1,
            }],
            success_url: process.env.FRONTEND_URL + '/success',
            cancel_url: process.env.FRONTEND_URL + '/cancel',
        });

        return session.url;
    }
}
