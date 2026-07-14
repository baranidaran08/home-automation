'use strict';

const { MODULES, ACTIONS, PERMISSION_MATRIX, permissionKey } = require('../constants/permissions');

// ============================================================================
// CENTRALIZED DEPENDENCY CONFIGURATION
// ----------------------------------------------------------------------------
// The single place that declares how features depend on one another. Adding a
// future module (Warranty, AMC, Inventory, Service Requests) is a one-line
// change here — no service, controller, or component edits required.
// ============================================================================

const READ = ACTIONS.READ;
const DASHBOARD_READ = permissionKey(MODULES.DASHBOARD, READ);

/**
 * Cross-module dependencies: operating a feature needs READ access to the data
 * it pulls from other modules. Declared at module granularity — every
 * permission in a module inherits these READ requirements.
 *
 * Generate Quotation reads Products, Categories and Templates, so any
 * `quotations:*` permission requires `products:read`, `categories:read`
 * and `templates:read`.
 *
 * Future example:
 *   [MODULES.WARRANTY]: [MODULES.PRODUCTS],
 *   [MODULES.AMC]:      [MODULES.PRODUCTS, MODULES.CATEGORIES],
 */
const MODULE_DEPENDENCIES = {
  [MODULES.QUOTATIONS]: [MODULES.PRODUCTS, MODULES.CATEGORIES, MODULES.TEMPLATES],
};

/**
 * Explicit per-permission dependencies for cases the generic rules don't
 * capture. In this product "Generate Quotation" both creates the quotation and
 * generates its PDF (an update) in a single action, so Create must also bring
 * Update.
 */
const PERMISSION_DEPENDENCIES = {
  [permissionKey(MODULES.QUOTATIONS, ACTIONS.CREATE)]: [
    permissionKey(MODULES.QUOTATIONS, ACTIONS.UPDATE),
  ],
};

// ============================================================================
// DEPENDENCY ENGINE (reusable)
// ============================================================================

/**
 * The direct prerequisites of one permission key, from three composable rules:
 *   1. Read-parent  — any non-read action requires its own module's READ.
 *   2. Cross-module — MODULE_DEPENDENCIES require those modules' READ.
 *   3. Explicit     — any PERMISSION_DEPENDENCIES entries for the key.
 * The Dashboard baseline is applied once over the whole set (see resolve()).
 *
 * @param {string} key - e.g. 'products:update'
 * @returns {string[]} prerequisite keys
 */
const directDependencies = (key) => {
  const [module, action] = key.split(':');
  const deps = [];

  // 1. Read is the parent of every write action in the same module.
  if (action !== READ && (PERMISSION_MATRIX[module] || []).includes(READ)) {
    deps.push(permissionKey(module, READ));
  }
  // 2. The feature needs READ on the modules it consumes.
  for (const depModule of MODULE_DEPENDENCIES[module] || []) {
    deps.push(permissionKey(depModule, READ));
  }
  // 3. Any explicitly configured prerequisites.
  for (const depKey of PERMISSION_DEPENDENCIES[key] || []) {
    deps.push(depKey);
  }
  return deps;
};

/**
 * Expand a set of permission keys into its full required closure: every
 * prerequisite (transitively) plus the Dashboard baseline — any access at all
 * implies `dashboard:read`. Deterministic and idempotent, so it is safe to run
 * on both the client (live UI) and the server (validation).
 *
 * @param {string[]} keys
 * @returns {string[]} the closed, valid set
 */
const resolvePermissionDependencies = (keys = []) => {
  const result = new Set(keys);
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of [...result]) {
      for (const dep of directDependencies(key)) {
        if (!result.has(dep)) {
          result.add(dep);
          changed = true;
        }
      }
    }
  }
  if (result.size > 0) result.add(DASHBOARD_READ);
  return [...result];
};

/**
 * Prerequisite keys missing from a submitted set. Empty ⇒ the set is valid.
 * The backend uses this to reject invalid permission combinations.
 *
 * @param {string[]} keys
 * @returns {string[]} missing prerequisite keys
 */
const findMissingDependencies = (keys = []) => {
  const provided = new Set(keys);
  return resolvePermissionDependencies(keys).filter((k) => !provided.has(k));
};

module.exports = {
  DASHBOARD_READ,
  MODULE_DEPENDENCIES,
  PERMISSION_DEPENDENCIES,
  directDependencies,
  resolvePermissionDependencies,
  findMissingDependencies,
};
