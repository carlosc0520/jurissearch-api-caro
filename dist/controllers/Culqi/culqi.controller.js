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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulqiController = void 0;
const common_1 = require("@nestjs/common");
const CulqiService_1 = require("../../services/Culqi/CulqiService");
let CulqiController = class CulqiController {
    constructor(culqiService) {
        this.culqiService = culqiService;
    }
    async createOrder(body) {
        try {
            return this.culqiService.createOrder(body);
        }
        catch (error) {
            console.error('Error in createOrder controller:', error);
            return { error };
        }
    }
    async chargeWithToken(body, req) {
        try {
            return this.culqiService.chargeWithToken(Object.assign(Object.assign({}, body), { id_user: req.user.ID }));
        }
        catch (error) {
            console.error('Error in chargeWithToken controller:', error);
            return { error };
        }
    }
    async webhook(payload) {
        return this.culqiService.handleWebhook(payload);
    }
};
exports.CulqiController = CulqiController;
__decorate([
    (0, common_1.Post)('create-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CulqiController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('charge-with-token'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CulqiController.prototype, "chargeWithToken", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CulqiController.prototype, "webhook", null);
exports.CulqiController = CulqiController = __decorate([
    (0, common_1.Controller)('admin/culqi'),
    __metadata("design:paramtypes", [CulqiService_1.CulqiService])
], CulqiController);
//# sourceMappingURL=culqi.controller.js.map