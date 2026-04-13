// Database Configuration - Lee desde variables de entorno
import * as dotenv from 'dotenv';

// Cargar variables de entorno ANTES de leer process.env
dotenv.config();

const entorno = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV';

const DBS = {
  "DEV": {
    "host": process.env.DB_SERVER || "SQL5110.site4now.net",
    "port": parseInt(process.env.DB_PORT || "1433"),
    "username": process.env.DB_USER || "db_ac769b_jurisearchprueba_admin",
    "password": process.env.DB_PASSWORD || "O18Z1NIISXL2",
    "database": process.env.DB_NAME || "db_ac769b_jurisearchprueba",
  },
  "PROD": {
    "host": process.env.DB_SERVER || "SQL5113.site4now.net",
    "port": parseInt(process.env.DB_PORT || "1433"),
    "username": process.env.DB_USER || "db_ac769b_jurissearchpro_admin",
    "password": process.env.DB_PASSWORD || "O18Z1NIISXL2",
    "database": process.env.DB_NAME || "db_ac769b_jurissearchpro",
  }
}

export default DBS[entorno];