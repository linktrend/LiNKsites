export enum PermissionFlag {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  APPROVE = 'approve',
  SUBMIT_FOR_REVIEW = 'submit_for_review',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_SITES = 'manage_sites',
}

export interface RolePermissions {
  [PermissionFlag.READ]: boolean
  [PermissionFlag.CREATE]: boolean
  [PermissionFlag.UPDATE]: boolean
  [PermissionFlag.DELETE]: boolean
  [PermissionFlag.PUBLISH]: boolean
  [PermissionFlag.APPROVE]: boolean
  [PermissionFlag.SUBMIT_FOR_REVIEW]: boolean
  [PermissionFlag.MANAGE_USERS]: boolean
  [PermissionFlag.MANAGE_ROLES]: boolean
  [PermissionFlag.MANAGE_SITES]: boolean
}

export const defaultRolePermissions: Record<string, RolePermissions> = {
  'super-admin': {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: true,
    [PermissionFlag.PUBLISH]: true,
    [PermissionFlag.APPROVE]: true,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: true,
    [PermissionFlag.MANAGE_ROLES]: true,
    [PermissionFlag.MANAGE_SITES]: true,
  },
  admin: {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: true,
    [PermissionFlag.PUBLISH]: true,
    [PermissionFlag.APPROVE]: true,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: true,
    [PermissionFlag.MANAGE_ROLES]: true,
    [PermissionFlag.MANAGE_SITES]: true,
  },
  manager: {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: true,
    [PermissionFlag.PUBLISH]: true,
    [PermissionFlag.APPROVE]: true,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  },
  editor: {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: false,
    [PermissionFlag.PUBLISH]: false,
    [PermissionFlag.APPROVE]: false,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  },
  'client-admin': {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: true,
    [PermissionFlag.PUBLISH]: true,
    [PermissionFlag.APPROVE]: true,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  },
  'client-editor': {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: false,
    [PermissionFlag.PUBLISH]: false,
    [PermissionFlag.APPROVE]: false,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  },
  contributor: {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: true,
    [PermissionFlag.UPDATE]: true,
    [PermissionFlag.DELETE]: false,
    [PermissionFlag.PUBLISH]: false,
    [PermissionFlag.APPROVE]: false,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: true,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  },
  viewer: {
    [PermissionFlag.READ]: true,
    [PermissionFlag.CREATE]: false,
    [PermissionFlag.UPDATE]: false,
    [PermissionFlag.DELETE]: false,
    [PermissionFlag.PUBLISH]: false,
    [PermissionFlag.APPROVE]: false,
    [PermissionFlag.SUBMIT_FOR_REVIEW]: false,
    [PermissionFlag.MANAGE_USERS]: false,
    [PermissionFlag.MANAGE_ROLES]: false,
    [PermissionFlag.MANAGE_SITES]: false,
  },
}
