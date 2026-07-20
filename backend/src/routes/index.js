'use strict';

const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const templateRoutes = require('./template.routes');
const quotationRoutes = require('./quotation.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const permissionRoutes = require('./permission.routes');
const profileRoutes = require('./profile.routes');

/**
 * Top-level API router, mounted at `/api` in app.js. Every module router is
 * aggregated here, so the full paths are `/api/<module>` (e.g. `/api/auth/login`).
 */
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/templates', templateRoutes);
router.use('/quotations', quotationRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
