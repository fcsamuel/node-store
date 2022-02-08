'use strict';
const jwt = require('jsonwebtoken');

exports. generateToken = async (data) => {
    return jwt.sign(data, global.SALT_KEY, { expiresIn: '2h' });
}

exports.decodeToken = async (token) => {
    var data = jwt.verify(token, global.SALT_KEY);
    return data;
}

exports.authorize = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        res.status(401).json({
            message: 'Acesso restrito'
        });
    } else {
        jwt.verify(token, global.SALT_KEY, (error) => {
            if (error) {
                res.status(401).json({ message: 'Token inválido' });
            } else {
                next();
            }
        });
    }
}

exports.isAdmin = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        res.status(401).json({
            message: 'Acesso restrito'
        });
    } else {
        jwt.verify(token, global.SALT_KEY, (error, decoded) => {
            if (error) {
                res.status(401).json({ message: 'Token inválido' });
                return;
            }
            if (!decoded.roles.includes('admin')) {
                res.status(403).json({
                    message: 'Funcionalidade restrita aos administradores'
                });
                return;
            }
            next();
        });
    }
}