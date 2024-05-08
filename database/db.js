const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
connection.connect((error)=>{
    if(error){
        console.log('El error de conexión es:' +error);
        return;
    }
    console.log('Conectado a la base!');
});
module.exports = connection;