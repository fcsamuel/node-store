'use strict';

const config = require('../config');
const sendgrid = require('@sendgrid/mail').setApiKey(config.sendgridKey);

exports.send = async(to, subject, body) => {
    sendgrid.send({
        to: to,
        from: 'felipecarvalhosamuel@gmail.com',
        subject: subject,
        html: body
    });
}