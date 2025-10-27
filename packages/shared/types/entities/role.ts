export type RolePayload = {
  id: number;
  name: string;
}

export type RolesRolePermissionListPayload = {
    role_id: number;
    permissions: {
      id: number;
      name: string;
    }[];
  }