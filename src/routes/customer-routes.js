'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/customer-controller');
const authService = require('../services/auth-service');

router.post('/', controller.post);
router.post('/auth', controller.authenticate);
router.put('/refresh-token', authService.authorize, controller.refreshToken);

module.exports = router;