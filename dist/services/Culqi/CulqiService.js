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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulqiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const configMappers_1 = __importDefault(require("../configMappers"));
const typeorm_1 = require("typeorm");
let CulqiService = class CulqiService {
    constructor(http, connection) {
        this.http = http;
        this.connection = connection;
        this.CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;
    }
    async createOrder(body) {
        var _a, _b;
        const { amount, description, email, nombres, apellidos, telefono, dni, id_plan, tipo } = body;
        try {
            const order_number = (0, uuid_1.v4)().replace(/-/g, '').substring(0, 20);
            const expirationTimestamp = Math.floor(Date.now() / 1000) + 3600;
            const response = await (0, rxjs_1.firstValueFrom)(this.http.post('https://api.culqi.com/v2/orders', {
                amount: Math.round(amount * 100),
                currency_code: 'PEN',
                description,
                order_number: order_number,
                expiration_date: expirationTimestamp,
                client_details: {
                    first_name: nombres,
                    last_name: apellidos,
                    email: email,
                    phone_number: telefono,
                },
                confirm: false,
                metadata: {
                    dni: dni,
                    first_name: nombres,
                    last_name: apellidos,
                    email: email,
                    phone_number: telefono,
                    id_plan: id_plan
                },
            }, {
                headers: {
                    Authorization: `Bearer ${this.CULQI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }));
            return { data: response.data, success: true };
        }
        catch (error) {
            console.error('Error creating order in CulqiService:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            return { success: false, error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message };
        }
    }
    async chargeWithToken(body) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        try {
            const { token, order_id, email, amount, id_plan, id_user, tipo } = body;
            const response = await (0, rxjs_1.firstValueFrom)(this.http.post('https://api.culqi.com/v2/charges', {
                amount: Math.round(amount * 100),
                currency_code: 'PEN',
                email,
                source_id: token,
                capture: true,
                metadata: { order_id },
            }, {
                headers: {
                    Authorization: `Bearer ${this.CULQI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }));
            let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD4;
            queryAsync += ` @p_cData = '${JSON.stringify({ IDPLN: id_plan, IDUSR: id_user, ORDERID: order_id, TIPO: tipo })}',`;
            queryAsync += ` @p_cUser = 'auto_payment',`;
            queryAsync += ` @p_nTipo = ${3},`;
            queryAsync += ` @p_nId = ${0}`;
            try {
                const result = await this.connection.query(queryAsync);
                console.log('Result from updating user plan:', queryAsync);
                const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
                const MESSAGE = isSuccess ? "El plan se actualizó correctamente" : "No se pudo actualizar el plan";
                return { MESSAGE, STATUS: isSuccess, data: response.data, success: true };
            }
            catch (error) {
                const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Error al actualizar el plan";
                return { MESSAGE, STATUS: false, success: true };
            }
        }
        catch (error) {
            if (((_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.type) == "operacion_denegada") {
                return {
                    success: false, message: ((_g = (_f = error === null || error === void 0 ? void 0 : error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.merchant_message) + ', ' + ((_j = (_h = error === null || error === void 0 ? void 0 : error.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.user_message),
                    title: (_l = (_k = error === null || error === void 0 ? void 0 : error.response) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.type
                };
            }
            return { success: false };
        }
    }
    async handleWebhook(payload) {
        if (payload.type === 'order.status.changed' && payload.data.object.status === 'paid') {
            console.log(`✅ Orden pagada: ${payload.data.object.id}`);
        }
        return { received: true };
    }
};
exports.CulqiService = CulqiService;
exports.CulqiService = CulqiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService, typeorm_1.DataSource])
], CulqiService);
//# sourceMappingURL=CulqiService.js.map