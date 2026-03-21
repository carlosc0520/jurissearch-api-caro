// Script de prueba para verificar variables de entorno
require('dotenv').config();

console.log('=== TEST DE VARIABLES DE ENTORNO ===\n');

console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('DB_SERVER:', process.env.DB_SERVER || 'undefined');
console.log('DB_PORT:', process.env.DB_PORT || 'undefined');
console.log('DB_USER:', process.env.DB_USER || 'undefined');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'undefined');
console.log('DB_NAME:', process.env.DB_NAME || 'undefined');
console.log('DB_TRUST_CERT:', process.env.DB_TRUST_CERT || 'undefined');
console.log('USE_SQL_SESSIONS:', process.env.USE_SQL_SESSIONS || 'undefined');

console.log('\n=== IMPORTANDO CONFIG.TS ===\n');

const DBS = require('./dist/config').default;
console.log('Config cargado:', JSON.stringify(DBS, null, 2));
