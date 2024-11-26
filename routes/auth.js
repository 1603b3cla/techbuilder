const express = require('express');
const auth = require('../middleware/auth');  // Asegúrate de que la ruta sea correcta
const bcrypt = require('bcryptjs');
const db = require('../db'); // Configuración de la base de datos
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    const { nombre_usuario, correo, contrasena } = req.body;

    // Validaciones básicas
    if (!nombre_usuario || !correo || !contrasena) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    try {
        // Verificar si el correo ya está registrado
        const checkQuery = 'SELECT * FROM usuarios WHERE correo = ?';
        db.query(checkQuery, [correo], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al verificar el correo.');
            }
            if (results.length > 0) {
                return res.status(400).send('El correo ya está registrado.');
            }

            // Encriptar contraseña y registrar usuario
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            const insertQuery = `INSERT INTO usuarios (nombre_usuario, correo, contrasena) VALUES (?, ?, ?)`;

            db.query(insertQuery, [nombre_usuario, correo, hashedPassword], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error al registrar al usuario.');
                }
                res.redirect('/login'); // Redirigir al login después del registro
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor.');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).send('Correo y contraseña son obligatorios.');
    }

    try {
        const query = `SELECT * FROM usuarios WHERE correo = ?`;
        db.query(query, [correo], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error en el servidor.');
            }
            if (results.length === 0) {
                return res.status(400).send('Correo o contraseña incorrectos.');
            }

            const user = results[0];
            const match = await bcrypt.compare(contrasena, user.contrasena);

            if (!match) {
                return res.status(400).send('Correo o contraseña incorrectos.');
            }

            // Guardar datos en la sesión
            req.session.user = {
                id: user.id,
                nombre_usuario: user.nombre_usuario,
                correo: user.correo
            };

            res.redirect('/'); // Redirigir al inicio después de iniciar sesión
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor.');
    }
});


// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.redirect('/'); 
    });
});



// Actualizar perfil
router.post('/profile/update', auth, async (req, res) => {
    const { nombre_usuario, correo, contrasena } = req.body;
    const userId = req.session.user.id;

    try {
        let updatedPassword = '';
        if (contrasena) {
            updatedPassword = await bcrypt.hash(contrasena, 10);
        }

        const updateQuery = 'UPDATE usuarios SET nombre_usuario = ?, correo = ?, contrasena = ? WHERE id = ?';
        db.query(updateQuery, [nombre_usuario, correo, updatedPassword || null, userId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al actualizar el perfil.');
            }
            res.redirect('/profile');  // Redirigir al perfil después de actualizar
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el perfil.');
    }
});


// middleware/auth.js
module.exports = function(req, res, next) {
    if (req.session && req.session.user) {
        return next();  // El usuario está autenticado, continuamos
    }
    return res.redirect('/login');  // Si no está autenticado, redirigir a login
};

module.exports = router;
