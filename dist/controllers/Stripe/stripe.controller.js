"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("../../services/Stripe/stripe.service");
const stripe_1 = __importDefault(require("stripe"));
let StripeController = class StripeController {
    constructor(stripeService) {
        this.stripeService = stripeService;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {});
    }
    async createCheckout(body) {
        console.log('Creating checkout session with body:', body);
        return this.stripeService.createCheckoutSession(body.email, body.amount, 'Subscription Type');
    }
    async createPaymentIntent(body) {
        console.log('Creating payment intent with body:', body);
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(body.amount * 100),
            currency: 'pen',
            automatic_payment_methods: { enabled: true },
        });
        console.log('Payment intent created:', paymentIntent);
        return { clientSecret: paymentIntent.client_secret };
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('create-checkout-session'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('create-payment-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createPaymentIntent", null);
exports.StripeController = StripeController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map