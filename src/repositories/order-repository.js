'use strict';

const mongoose = require('mongoose');
const Order = mongoose.model('Order');

exports.get = async() => {
    return await Order.find({})
        .populate('customer', 'name email')
        .populate('items.product', 'title slug');
}

exports.post = async(data) => {
    return await new Order(data).save();
}