import type { UserRole } from '@app-init/store/auth-store';

/**
 * Single source of truth for who can see/do what. Both global sidebar
 * and ObjectSidebar consult this map to filter their items, and any
 * sensitive action can call `can(role, perm)` to gate UI.
 *
 * Mirror this matrix on the backend with `@Roles(...)` decorators on
 * the corresponding endpoints — both sides must agree or the UI hides
 * something that the API still allows (or vice versa).
 */
export const PERMISSIONS = {
  // Global modules
  'company:view':        ['SUPER_ADMIN', 'OWNER', 'DIRECTOR'],
  'finance:view':        ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'ACCOUNTANT'],
  'analytics:view':      ['SUPER_ADMIN', 'OWNER', 'DIRECTOR'],
  'settings:view':       ['SUPER_ADMIN', 'OWNER'],

  // Object workspace
  'object:view':         ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'FOREMAN', 'ACCOUNTANT', 'WAREHOUSE'],
  'object:finance:view': ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'ACCOUNTANT'],
  'object:team:edit':    ['SUPER_ADMIN', 'OWNER', 'DIRECTOR'],
  'object:tasks:edit':   ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'FOREMAN'],
  'object:report:create':['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'FOREMAN'],

  // Warehouse
  'warehouse:write':     ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'WAREHOUSE'],
  'warehouse:reserve':   ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'WAREHOUSE', 'FOREMAN'],
  'warehouse:approve':   ['SUPER_ADMIN', 'OWNER', 'DIRECTOR'],

  // Purchase orders
  'po:create':           ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'WAREHOUSE'],
  'po:approve':          ['SUPER_ADMIN', 'OWNER', 'DIRECTOR'],
  'po:receive':          ['SUPER_ADMIN', 'OWNER', 'DIRECTOR', 'WAREHOUSE'],
} as const satisfies Record<string, ReadonlyArray<UserRole>>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: UserRole | undefined, perm: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[perm] as ReadonlyArray<UserRole>).includes(role);
}
