'use strict';

const errorHandler = require('./errorHandler');
const notFound = require('./notFound');
const validate = require('./validate');
const { authenticate, authorize, requirePermission } = require('./auth.middleware');

// Barrel export so future modules can `require('../middleware')`.
module.exports = { errorHandler, notFound, validate, authenticate, authorize, requirePermission };
