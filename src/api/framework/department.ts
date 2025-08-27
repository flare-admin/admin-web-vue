import request from '@/utils/request';
import {
  CreateDepartmentCommand,
  DepartmentDto,
  DepartmentListRes,
  DepartmentQueryParams,
  MoveDepartmentCommand,
  UpdateDepartmentCommand,
  TransferUserCommand
} from '@/types/api/department';
import { GetUsersListRes, GetUsersQuery } from '@/types/api/authority';

const BASE_URL = '/sys/dept';

export const departmentApi = {
  // 获取部门列表
  getDepartmentList: (params: DepartmentQueryParams): Promise<DepartmentListRes> =>
    request(`${BASE_URL}`, {
      method: 'GET',
      params
    }),

  // 获取部门树
  getDepartmentTree: (parentId?: string): Promise<DepartmentDto[]> =>
    request(`${BASE_URL}/tree`, {
      method: 'GET',
      params: { parent_id: parentId }
    }),

  // 获取部门详情
  getDepartment: (id: string): Promise<DepartmentDto> =>
    request(`${BASE_URL}/${id}`, {
      method: 'GET'
    }),

  // 创建部门
  createDepartment: (body: CreateDepartmentCommand): Promise<void> =>
    request(BASE_URL, {
      method: 'POST',
      body
    }),

  // 更新部门
  updateDepartment: (body: UpdateDepartmentCommand): Promise<void> =>
    request(BASE_URL, {
      method: 'PUT',
      body
    }),

  // 删除部门
  deleteDepartment: (id: string): Promise<void> =>
    request(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    }),

  // 移动部门
  moveDepartment: (body: MoveDepartmentCommand): Promise<void> =>
    request(`${BASE_URL}/move`, {
      method: 'POST',
      body
    }),

  // 设置部门管理员
  setAdmin(body: { deptId: string; adminId: string }) {
    return request(`${BASE_URL}/admin`, {
      method: 'POST',
      body
    });
  },

  // 获取部门用户列表
  getDepartmentUsers(deptId: string, params: GetUsersQuery): Promise<GetUsersListRes> {
    return request(`${BASE_URL}/${deptId}/users`, {
      method: 'GET',
      params
    });
  },

  // 获取未分配部门的用户列表
  getUnassignedUsers(params: GetUsersQuery): Promise<GetUsersListRes> {
    return request(`${BASE_URL}/unassigned-users`, {
      method: 'GET',
      params
    });
  },

  // 分配用户到部门
  assignUsers(body: { deptId: string; userIds: string[] }): Promise<void> {
    return request(`${BASE_URL}/users`, {
      method: 'POST',
      body
    });
  },

  // 从部门移除用户
  removeUsers(body: { deptId: string; userIds: string[] }): Promise<void> {
    return request(`${BASE_URL}/users`, {
      method: 'PUT',
      body
    });
  },

  // 移动用户到其他部门
  moveUsers(body: {
    sourceDeptId: string;
    targetDeptId: string;
    userIds: string[];
  }): Promise<void> {
    return request(`${BASE_URL}/users/move`, {
      method: 'POST',
      body
    });
  },

  // 添加人员调动接口
  transferUser(body: TransferUserCommand): Promise<void> {
    return request(`${BASE_URL}/transfer`, {
      method: 'POST',
      body
    });
  }
};

export default departmentApi;
