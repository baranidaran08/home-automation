'use strict';

const { APP_NAME } = require('./app');
const { HTTP_STATUS } = require('./httpStatus');
const { MESSAGES } = require('./messages');
const { COLLECTIONS, PRODUCT_STOCK_FIELD } = require('./collections');
const { ENTITY_STATUS, ENTITY_STATUS_VALUES } = require('./status');
const { REQUIRED_PLACEHOLDERS } = require('./placeholders');
const {
  MODULES,
  ACTIONS,
  CRUD,
  PERMISSION_MATRIX,
  ALL_PERMISSION_KEYS,
  PERMS,
  permissionKey,
} = require('./permissions');
const { DEFAULT_ROLES, SUPER_ADMIN } = require('./rbac');

module.exports = {
  APP_NAME,
  HTTP_STATUS,
  MESSAGES,
  COLLECTIONS,
  PRODUCT_STOCK_FIELD,
  ENTITY_STATUS,
  ENTITY_STATUS_VALUES,
  REQUIRED_PLACEHOLDERS,
  // RBAC
  MODULES,
  ACTIONS,
  CRUD,
  PERMISSION_MATRIX,
  ALL_PERMISSION_KEYS,
  PERMS,
  permissionKey,
  DEFAULT_ROLES,
  SUPER_ADMIN,
};
