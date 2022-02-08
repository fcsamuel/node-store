'use strict';

const repository = require('../repositories/order-repository');
const { v4: guid } = require('uuid');
const authService = require('../services/auth-service');

exports.get = async(req, res) => {
    try {
        let data = await repository.get();
        res.status(200).send(data);
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao buscar o pedido',
            data: e.message
        });
    }
}

exports.post = async(req, res) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    let tokenData = await authService.decodeToken(token);

    let data = {
        customer: tokenData.customerId,
        number: guid().substring(0, 6),
        items: req.body.items
    };

    try {
        await repository.post(data);
        res.status(201).send({ message: 'Pedido cadastrado com sucesso.' });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao cadastrar o pedido',
            data: e.message
        });
    }
}