// Database Configuration - Lee desde variables de entorno
import * as dotenv from 'dotenv';

// Cargar variables de entorno ANTES de leer process.env
dotenv.config();

const entorno = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV';

const DBS = {
  "DEV": {
    "host": process.env.DB_SERVER || "SQL5113.site4now.net",
    "port": parseInt(process.env.DB_PORT || "1433"),
    "username": process.env.DB_USER || "db_a9ec8e_jurissearchdev_admin",
    "password": process.env.DB_PASSWORD || "ING052001",
    "database": process.env.DB_NAME || "db_a9ec8e_jurissearchdev",
  },
  "PROD": {
    "host": process.env.DB_SERVER || "SQL5113.site4now.net",
    "port": parseInt(process.env.DB_PORT || "1433"),
    "username": process.env.DB_USER || "db_a9ec8e_jurissearchpro_admin",
    "password": process.env.DB_PASSWORD || "ING052001",
    "database": process.env.DB_NAME || "db_a9ec8e_jurissearchpro",
  }
}

export default DBS[entorno];