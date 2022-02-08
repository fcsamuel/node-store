'use strict';

const ValidationContract = require('../validators/fluent-validator');
const repository = require('../repositories/customer-repository');
const emailService = require('../services/email-service');
const authService = require('../services/auth-service');


const md5 = require('md5');

exports.post = async(req, res, next) => {
    var contract = new ValidationContract();
    contract.hasMinLen(req.body.name, 3, 'O nome do cliente deve ter no mínimo 3 caracteres');
    contract.isEmail(req.body.email, 'Email informado é inválido');
    contract.hasMinLen(req.body.password, 6, 'A senha deve ter no mínimo 6 caracteres');

    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }

    try {
        await repository.post({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY),
            roles: ['user']
        });
        emailService.send(req.body.email, 'Bem vindo ao Node.js', global.EMAIL_TMPL.replace('{0}', data.name));

        res.status(201).send({ message: 'Cliente cadastrado com sucesso.' });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao cadastrar o cliente',
            data: e.message
        });
    }
}

exports.authenticate = async(req, res) => {
    try {
        let customer = await repository.authenticate({
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });

        if (!customer) {
            res.status(401).send({
                message: 'Usuário e/ou senha inválido(s)'
            })
            return;
        }

        const token = await authService.generateToken({
            customerId: customer.id,
            email: customer.email,
            name: customer.name,
            roles: customer.roles
        });

        res.status(201).send({
            token: token,
            data: {
                customerId: customer.id,
                name: customer.name,
                email: customer.email
            }
        });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao cadastrar o cliente',
            data: e.message
        });
    }
}

exports.refreshToken = async(req, res) => {
    try {
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        let data = await authService.decodeToken(token);

        let customer = await repository.getById(data.customerId);

        if (!customer) {
            res.status(401).send({
                message: 'Usuário não encontrado'
            })
        }

        const newToken = await authService.generateToken({
            customerId: customer.id,
            email: customer.email,
            name: customer.name,
            roles: customer.roles
        });

        res.status(201).send({
            token: newToken,
            data: {
                customerId: customer.id,
                name: customer.name,
                email: customer.email
            }
        });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao cadastrar o cliente',
            data: e.message
        });
    }
}