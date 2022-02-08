'use strict';

const ValidationContract = require('../validators/fluent-validator');
const repository = require('../repositories/product-repository');
const config = require('../config');
const { ShareServiceClient } = require("@azure/storage-file-share");
const shareServiceClient = ShareServiceClient.fromConnectionString(config.azureConnString);
const { Readable } = require('stream');

exports.get = async (res) => {
    try {
        let data = await repository.get();
        res.status(200).send(data);
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao buscar os produtos',
            data: e.message
        });
    }
}

exports.getById = async (req, res) => {
    try {
        let data = await repository.getById(req.params.id);
        res.status(200).send(data);
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao buscar o produto',
            data: e.message
        });
    }
}

exports.getBySlug = async (req, res) => {
    try {
        let data = await repository.getBySlug(req.params.slug);
        res.status(200).send(data);
    } catch {
        res.status(400).send({
            message: 'Ocorreu um erro ao buscar o produto',
            data: e.message
        });
    }
}

exports.getByTag = async (req, res) => {
    try {
        let data = await repository.getByTag(req.params.tag);
        res.status(200).send(data);
    } catch {
        res.status(400).send({
            message: 'Ocorreu um erro ao buscar os produtos',
            data: e.message
        });
    }
}

exports.post = async (req, res) => {
    var contract = new ValidationContract();
    contract.hasMinLen(req.body.title, 3, 'O nome do produto deve ter no mínimo 3 caracteres');
    contract.hasMinLen(req.body.description, 3, 'A descrição deve ter no mínimo 3 caracteres');
    contract.hasMinLen(req.body.slug, 3, 'O slug deve ter no mínimo 3 caracteres');

    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }

    try {
        let data = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            price: req.body.price,
            tags: req.body.tags
        }

        if (req.body.image) {
            data.image = req.body.image;
            const shareClient = shareServiceClient.getShareClient(config.fileShareName);
            let rawData = req.body.image;
            let matchesBase64Img = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            const fileName = 'product-' + new Date().getTime() + '.' + matchesBase64Img[1].substring(matchesBase64Img[1].indexOf('/') + 1);
            const fileClient = shareClient
                .getDirectoryClient('product-images')
                .getFileClient(fileName);
    
            let buffer = Buffer.from(matchesBase64Img[2], 'base64');
            const stream = Readable.from(buffer);
    
    
            fileClient.uploadStream(stream, Buffer.byteLength(buffer), (4 * 1024 * 1024), 10, {
                fileHttpHeaders: { fileContentType: matchesBase64Img[1] }
            });
        }

        await repository.post(data);
        res.status(201).send({ message: 'Produto cadastrado com sucesso.' });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao cadastrar o produto',
            data: e.message
        });
    }
}

exports.put = async (req, res) => {
    try {
        await repository.put(req.params.id, req.body);
        res.status(200).send({ message: 'Produto atualizado com sucesso.' });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao alterar o produto:',
            data: e.message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        await repository.delete(req.body.id);
        res.status(200).send({ message: 'Produto removido com sucesso.' });
    } catch (e) {
        res.status(400).send({
            message: 'Ocorreu um erro ao remover o produto:',
            data: e.message
        });
    }
}