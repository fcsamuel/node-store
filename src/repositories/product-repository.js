'use strict';

const mongoose = require('mongoose');
const Product = mongoose.model('Product');

const filter = 'title description price slug tags';

exports.get = async() => {
    return await Product.find({ active: true }, 'title price slug');
}

exports.getById = async(id) => {
    return await Product.findById(id, filter);
}

exports.getBySlug = async(slug) => {
    return await Product.findOne({
        slug: slug,
        active: true
    }, filter);
}

exports.getByTag = async(tag) => {
    return await Product.find({
        tags: tag,
        active: true
    }, filter);
}

exports.post = async(data) => {
    let product = new Product(data);
    return await product.save();
}

exports.put = async(id, data) => {
    return await Product.findByIdAndUpdate(id, {
        $set: {
            title: data.title,
            description: data.description,
            slug: data.slug,
            price: data.price
        }
    });
}

exports.delete = async(id) => {
    return await Product.findByIdAndRemove(id);
}