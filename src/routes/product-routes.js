'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/product-controller');
const authService = require('../services/auth-service');

router.get('/', authService.isAdmin, controller.get);
router.get('/admin/:id', authService.isAdmin, controller.getById);
router.get('/:slug', authService.isAdmin, controller.getBySlug);
router.get('/tags/:tag', authService.isAdmin, controller.getByTag);
router.post('/', authService.isAdmin, controller.post);
router.put('/:id', authService.isAdmin, controller.put);
router.delete('/', authService.isAdmin, controller.delete);

module.exports = router;