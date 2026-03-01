const { Sequelize } = require('sequelize');

// 1. Prioridad: DATABASE_URL (Railway suele dar una URL completa que es más estable)
// 2. Backup: Variables individuales (MYSQLUSER, MYSQLPASSWORD, etc.)
const sequelize = process.env.DATABASE_URL 
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      })
    : new Sequelize(
        process.env.MYSQL_DATABASE || 'railway', 
        process.env.MYSQLUSER || 'root', 
        process.env.MYSQLPASSWORD || '', // Tu password local suele ser vacío o 'root'
        {
            host: process.env.MYSQLHOST || 'localhost',
            port: process.env.MYSQLPORT || 3306,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );

// NOTA: No necesitamos ejecutar .authenticate() aquí porque ya lo 
// estamos haciendo en app.js antes de arrancar el servidor. 
// Mantener el código limpio ayuda a evitar logs duplicados.

module.exports = sequelize;