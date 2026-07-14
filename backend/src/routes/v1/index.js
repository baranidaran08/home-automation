'use strict';

const { Router } = require('express');
const healthRoutes = require('../health.routes');
const authRoutes = require('../auth.routes');
const dashboardRoutes = require('../dashboard.routes');
const categoryRoutes = require('../category.routes');
const productRoutes = require('../product.routes');
const templateRoutes = require('../template.routes');
const quotationRoutes = require('../quotation.routes');
const userRoutes = require('../user.routes');
const roleRoutes = require('../role.routes');
const permissionRoutes = require('../permission.routes');

/**
 * API v1 aggregate router. Mount every future module router here so versioning
 * stays centralised:
 *
 *   router.use('/auth', authRoutes);
 *   router.use('/categories', categoryRoutes);
 *   router.use('/products', productRoutes);
 *   router.use('/templates', templateRoutes);
 *   router.use('/quotations', quotationRoutes);
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

module.exports = router;
