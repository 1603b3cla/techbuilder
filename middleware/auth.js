// middleware/auth.js
module.exports = function(req, res, next) {
    if (req.session && req.session.user) {
        return next();  // El usuario está autenticado, permitimos el acceso
    }
    return res.redirect('/login');  // Si no está autenticado, redirigimos al login
};
