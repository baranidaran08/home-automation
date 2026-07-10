'use strict';

/**
 * Generic Active/Inactive status shared by content entities (categories, and
 * later products/templates). Stored lowercase in the database.
 */
const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const ENTITY_STATUS_VALUES = Object.values(ENTITY_STATUS);

module.exports = { ENTITY_STATUS, ENTITY_STATUS_VALUES };
