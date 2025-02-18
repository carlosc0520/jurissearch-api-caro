// const entorno = "DEV" // PROD
const entorno = "DEV" // PROD
const DBS = {
  "DEV": {
    "host": "SQL5113.site4now.net",
    "port": 1433,
    "username": "db_a9ec8e_jurissearchdev_admin",
    "password": "ING052001",
    "database": "db_a9ec8e_jurissearchdev",
  },
  "PROD": {
    "host": "SQL5113.site4now.net",
    "port": 1433,
    "username": "db_a9ec8e_jurissearchpro_admin",
    "password": "ING052001",
    "database": "db_a9ec8e_jurissearchpro",
  }
}

export default DBS[entorno];