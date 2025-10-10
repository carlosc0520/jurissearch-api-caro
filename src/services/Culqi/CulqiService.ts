import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import procedures from '../configMappers';
import { DataSource } from 'typeorm';

@Injectable()
export class CulqiService {
    private readonly CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;

    constructor(private readonly http: HttpService, private connection: DataSource) { }

    async createOrder(body: any) {
        const { amount, description, email, nombres, apellidos, telefono, dni, id_plan, tipo } = body;

        try {
            const order_number = uuidv4().replace(/-/g, '').substring(0, 20);
            const expirationTimestamp = Math.floor(Date.now() / 1000) + 3600;

            const response = await firstValueFrom(
                this.http.post(
                    'https://api.culqi.com/v2/orders',
                    {
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
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.CULQI_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            return { data: response.data, success: true };
        } catch (error) {
            console.error('Error creating order in CulqiService:', error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    async chargeWithToken(body: any) {
        try {
            const { token, order_id, email, amount, id_plan, id_user, tipo } = body;
            const response = await firstValueFrom(
                this.http.post(
                    'https://api.culqi.com/v2/charges',
                    {
                        amount: Math.round(amount * 100),
                        currency_code: 'PEN',
                        email,
                        source_id: token,
                        capture: true,
                        metadata: { order_id },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.CULQI_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            // si pago fue exitoso actualizar plan ...
            let queryAsync = procedures.ADMIN.USUARIO.CRUD4;
            queryAsync += ` @p_cData = '${JSON.stringify({ IDPLN: id_plan, IDUSR: id_user, ORDERID: order_id, TIPO: tipo })}',`;
            queryAsync += ` @p_cUser = 'auto_payment',`;
            queryAsync += ` @p_nTipo = ${3},`
            queryAsync += ` @p_nId = ${0}`;

            try {
                const result = await this.connection.query(queryAsync);
                console.log('Result from updating user plan:', queryAsync);
                const isSuccess = result?.[0]?.RESULT > 0;
                const MESSAGE = isSuccess ? "El plan se actualizó correctamente" : "No se pudo actualizar el plan";
                return { MESSAGE, STATUS: isSuccess, data: response.data, success: true };
            } catch (error) {
                const MESSAGE = error.originalError?.info?.message || "Error al actualizar el plan";
                return { MESSAGE, STATUS: false, success: true };
            }

        } catch (error) {
            if (error?.response?.data?.type == "operacion_denegada") {
                return {
                    success: false, message: error?.response?.data?.merchant_message + ', ' + error?.response?.data?.user_message,
                    title: error?.response?.data?.type
                };
            }
            return { success: false };
        }
    }

    async handleWebhook(payload: any) {
        // Aquí puedes validar firma (opcional) y actualizar tu DB
        if (payload.type === 'order.status.changed' && payload.data.object.status === 'paid') {
            console.log(`✅ Orden pagada: ${payload.data.object.id}`);
            // Actualiza tu BD o envía email
        }

        return { received: true };
    }
}
