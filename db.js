const mysql = require('mysql');

// Configura tu conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia por tu contraseña si tienes una
    database: 'techbuilder1'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conexión exitosa a la base de datos.');
});

module.exports = db;
