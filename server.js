const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db'); // Conexión a la base de datos
const bcrypt = require('bcryptjs'); // Para manejo de contraseñas
const app = express();

// Configuración de middlewares
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta de archivos estáticos
app.use(bodyParser.urlencoded({ extended: true })); // Parseo de datos de formularios
app.use(session({
    secret: 'techbuildersecret', // Llave para encriptar la sesión
    resave: false, // No volver a guardar si no hay cambios
    saveUninitialized: true // Guardar sesión incluso sin datos
}));

// Configuración de EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Carpeta para vistas EJS

// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Ruta principal (Inicio)
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user }); // Pasar usuario a la vista si está autenticado
});

// Ruta de login
app.get('/login', (req, res) => {
    res.render('login'); // Renderiza la vista de login
});

// Ruta de registro
app.get('/register', (req, res) => {
    res.render('register'); // Renderiza la vista de registro
});

// Middleware de autenticación
function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // Usuario autenticado, continuar
    }
    res.redirect('/login'); // Redirige si no hay sesión activa
}

// Ruta del perfil del usuario (protegida)
app.get('/profile', authMiddleware, (req, res) => {
    console.log("Usuario en sesión:", req.session.user); // Depuración: verifica datos de la sesión
    res.render('profile', { user: req.session.user }); // Renderiza el perfil del usuario
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.redirect('/login'); // Redirige al login después de cerrar sesión
    });
});
// Ruta para actualizar perfil
app.post('/profile/update', authMiddleware, async (req, res) => {
    const { nombre_usuario, correo, contrasena } = req.body;

    try {
        // Obtén el ID del usuario desde la sesión
        const userId = req.session.user.id;

        // Construye la consulta SQL dinámicamente
        let query = 'UPDATE usuarios SET nombre_usuario = ?, correo = ?';
        const params = [nombre_usuario, correo];

        if (contrasena && contrasena.trim() !== '') {
            // Encripta la contraseña si se proporciona
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            query += ', contrasena = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        // Ejecuta la consulta SQL
        await db.query(query, params);

        // Actualiza los datos de la sesión
        req.session.user.nombre_usuario = nombre_usuario;
        req.session.user.correo = correo;

        // Redirige al perfil con un mensaje de éxito (opcional)
        res.redirect('/profile');
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).send('Hubo un error al actualizar el perfil.');
    }
});


// Inicia el servidor
const PORT = 3001; // Puerto del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
