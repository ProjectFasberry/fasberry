export type RolePayload = {
  id: number;
  name: string;
}

export type RolePermission = {
  id: number;
  name: string;
}

export type RolesRolePermissionListPayload = {
  role_id: number;
  permissions: RolePermission[];
}