// 部门DTO
export interface DepartmentDto {
  id: string;
  parentId: string;
  name: string;
  code: string;
  sort: number;
  leader: string;
  phone: string;
  email: string;
  status: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  children?: DepartmentDto[];
}
export interface DepartmentListRes {
  total: number;
  list: DepartmentDto[];
}
// 创建部门命令
export interface CreateDepartmentCommand {
  parentId: string;
  name: string;
  code: string;
  sort: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: number;
  description?: string;
}

// 更新部门命令
export interface UpdateDepartmentCommand extends CreateDepartmentCommand {
  id: string;
}

// 移动部门命令
export interface MoveDepartmentCommand {
  id: string;
  targetParent: string;
}

// 查询参数
export interface DepartmentQueryParams {
  name?: string;
  code?: string;
  status?: number;
  parentId?: string;
  current?: number;
  size?: number;
}

// 添加人员调动命令类型
export interface TransferUserCommand {
  userId: string;
  fromDeptId: string;
  toDeptId: string;
  description?: string;
}
