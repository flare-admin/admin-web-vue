// 用户相关类型
export interface UserModel {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  status: number;
  roleIds: number[];
  invitationCode: string;
  password: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface UserCreateRequest {
  username: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  roleIds: number[];
  invitationCode: string;
}

export interface UserUpdateRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  localize?: string;
  roleIds?: number[];
  status?: number;
}

export interface AssignUserRoleRequest {
  userId?: string;
  roleIds: number[];
}

export interface GetUsersQuery {
  current?: number;
  size?: number;
  username?: string;
  name?: string;
}

export interface GetUsersListRes {
  total: number;
  list: UserModel[];
}
// 角色相关类型
export interface RoleModel {
  id: number;
  name: string;
  code: string;
  description: string;
  localize: string;
  status: number;
  permIds: number[];
  createdAt?: number;
  updatedAt?: number;
  type: number;
  dataScope?: number;
  deptIds?: string[];
}

export interface RoleCreateRequest {
  name: string;
  code: string;
  description?: string;
  localize?: string;
}

export interface RoleUpdateRequest extends Partial<RoleCreateRequest> {
  id: number;
  status?: number;
  permIds: number[];
}

export interface AssignRolePermissionsCommand {
  role_id?: number;
  permission_ids: number[];
}
// 权限相关类型
export interface ResourceModel {
  method: string | undefined;
  path: string | undefined;
}

export interface PermissionModel {
  id: number;
  name: string;
  code: string;
  type: number;
  icon?: string;
  path?: string;
  parentId?: number;
  sequence?: number;
  description?: string;
  localize?: string;
  component?: string;
  properties?: string;
  resources: ResourceModel[];
  status: number;
  createdAt?: number;
  updatedAt?: number;
  children?: PermissionModel[];
}

export interface PermissionCreateRequest {
  name: string;
  code: string;
  type: number;
  icon?: string;
  path?: string;
  component?: string;
  parentId?: number;
  sequence?: number;
  description?: string;
  localize?: string;
  properties?: string;
  resources?: ResourceModel[];
}

export interface PermissionUpdateRequest {
  id: number;
  name: string;
  code: string;
  type: number;
  icon?: string;
  path?: string;
  component?: string;
  parentId?: number;
  sequence?: number;
  description?: string;
  localize?: string;
  properties?: string;
  resources?: ResourceModel[];
  status: number;
}

// 租户相关类型
export interface TenantAdminUser {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export interface TenantModel {
  id: string;
  name: string;
  code: string;
  status: number;
  expireTime: number;
  description?: string;
  isDefault: number;
  createdAt?: number;
  updatedAt?: number;
  adminUser: TenantAdminUser;
  adminUsername: string;
}

export interface TenantCreateRequest {
  name: string;
  code: string;
  expireTime: number;
  description?: string;
  isDefault?: number;
  adminUser: TenantAdminUser;
}

export interface TenantUpdateRequest {
  id: string;
  name: string;
  code: string;
  expireTime: number;
  description?: string;
  isDefault?: number;
  status: number;
}

// 权限树节点模型
export interface PermissionTreeNode {
  id: number;
  name: string;
  code: string;
  path: string;
  component: string; // 组件路径，如: 'dashboard/workplace'
  icon?: string;
  localize?: string;
  roles?: string[];
  permissions?: string[];
  parentId?: number;
  sequence?: number;
  hideInMenu?: boolean;
  children?: PermissionTreeNode[];
}

// 添加简化版权限树节点类型
export interface SimplePermissionTreeNode {
  id: number;
  name: string;
  code: string;
  icon?: string;
  localize?: string;
  parentId?: number;
  children?: SimplePermissionTreeNode[];
}

// 添加简化版权树响应类型
export interface SimplePermissionTreeResponse {
  ids: number[];
  tree: SimplePermissionTreeNode[];
}
