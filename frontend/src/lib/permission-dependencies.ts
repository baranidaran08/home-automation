import { MODULES, ACTIONS, permissionKey } from '@/constants/permissions';

/**
 * Frontend mirror of the backend permission dependency engine
 * (backend/src/utils/permission-dependencies.js). Same rules, same closure — so
 * the Role form auto-selects exactly what the server will require, and the two
 * never disagree. Keep the CONFIG blocks in sync across both files.
 */

const READ = ACTIONS.READ;
export const DASHBOARD_READ = permissionKey(MODULES.DASHBOARD, READ);

// ============================================================================
// CENTRALIZED DEPENDENCY CONFIGURATION (mirror of the backend)
// ============================================================================

/** Cross-module READ dependencies, at module granularity. */
export const MODULE_DEPENDENCIES: Record<string, string[]> = {
  [MODULES.QUOTATIONS]: [MODULES.PRODUCTS, MODULES.CATEGORIES, MODULES.TEMPLATES],
};

/** Explicit per-permission prerequisites for special cases. */
export const PERMISSION_DEPENDENCIES: Record<string, string[]> = {
  // "Generate Quotation" creates the quotation AND generates its PDF (an update).
  [permissionKey(MODULES.QUOTATIONS, ACTIONS.CREATE)]: [
    permissionKey(MODULES.QUOTATIONS, ACTIONS.UPDATE),
  ],
};

// ============================================================================
// DEPENDENCY ENGINE
// ============================================================================

/** Direct prerequisites of one permission key (read-parent + cross-module + explicit). */
export function directDependencies(key: string): string[] {
  const parts = key.split(':');
  const mod = parts[0] ?? '';
  const action = parts[1] ?? '';
  const deps: string[] = [];

  if (action !== READ) deps.push(permissionKey(mod, READ));
  for (const depModule of MODULE_DEPENDENCIES[mod] ?? []) {
    deps.push(permissionKey(depModule, READ));
  }
  for (const depKey of PERMISSION_DEPENDENCIES[key] ?? []) deps.push(depKey);
  return deps;
}

/** Full required closure of a set: every prerequisite + the Dashboard baseline. */
export function resolvePermissionDependencies(keys: string[]): string[] {
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
}

/** Enabling a permission pulls in everything it (transitively) requires. */
export function enableWithDependencies(keys: string[], key: string): string[] {
  return resolvePermissionDependencies([...new Set([...keys, key])]);
}

/**
 * Disabling a permission removes it and cascades to anything that can no longer
 * satisfy its dependencies (e.g. disabling `products:read` disables the product
 * write actions and the quotation feature that reads products). The Dashboard
 * baseline is preserved while any access remains.
 */
export function disableWithDependents(keys: string[], key: string): string[] {
  const set = new Set(keys);
  set.delete(key);

  let changed = true;
  while (changed) {
    changed = false;
    for (const k of [...set]) {
      for (const dep of directDependencies(k)) {
        if (!set.has(dep)) {
          set.delete(k);
          changed = true;
          break;
        }
      }
    }
  }

  if (set.size > 0) set.add(DASHBOARD_READ);
  else set.delete(DASHBOARD_READ);
  return [...set];
}

/** Prerequisite keys missing from a set (empty ⇒ valid). */
export function findMissingDependencies(keys: string[]): string[] {
  const provided = new Set(keys);
  return resolvePermissionDependencies(keys).filter((k) => !provided.has(k));
}
