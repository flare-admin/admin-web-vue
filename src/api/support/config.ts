import request from '@/utils/request';
import {
  Config,
  ConfigGroup,
  CreateConfigRequest,
  UpdateConfigRequest,
  QueryConfigRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  QueryGroupRequest,
  UpdateStatusRequest,
  BatchUpdateRequest,
  PageResponse
} from '@/types/api/support/config';

const BASE_URL = 'config';

export default {
  // 配置相关接口
  // 创建配置
  createConfig: (data: CreateConfigRequest): Promise<void> =>
    request(`${BASE_URL}`, {
      method: 'POST',
      body: data
    }),

  // 更新配置
  updateConfig: (data: UpdateConfigRequest): Promise<void> =>
    request(`${BASE_URL}`, {
      method: 'PUT',
      body: data
    }),

  // 获取配置详情
  getConfig: (id: string): Promise<Config> =>
    request(`${BASE_URL}/${id}`, {
      method: 'GET'
    }),

  // 删除配置
  deleteConfig: (id: string): Promise<void> =>
    request(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    }),

  // 获取配置列表
  getConfigList: (params: QueryConfigRequest): Promise<PageResponse<Config>> =>
    request(`${BASE_URL}`, {
      method: 'GET',
      params
    }),

  // 更新配置状态
  updateConfigStatus: (data: UpdateStatusRequest): Promise<void> =>
    request(`${BASE_URL}/status`, {
      method: 'PUT',
      body: data
    }),

  // 批量更新配置
  batchUpdateConfig: (data: BatchUpdateRequest): Promise<void> =>
    request(`${BASE_URL}/batch`, {
      method: 'PUT',
      body: data
    }),

  // 根据分组ID获取配置列表
  getConfigsByGroupId: (groupId: string): Promise<Config[]> =>
    request(`${BASE_URL}/group/${groupId}/configs`, {
      method: 'GET'
    }),

  // 配置分组相关接口
  // 创建分组
  createGroup: (data: CreateGroupRequest): Promise<void> =>
    request(`${BASE_URL}/group`, {
      method: 'POST',
      body: data
    }),

  // 更新分组
  updateGroup: (data: UpdateGroupRequest): Promise<void> =>
    request(`${BASE_URL}/group`, {
      method: 'PUT',
      body: data
    }),

  // 获取分组详情
  getGroup: (id: string): Promise<ConfigGroup> =>
    request(`${BASE_URL}/group/${id}`, {
      method: 'GET'
    }),

  // 删除分组
  deleteGroup: (id: string): Promise<void> =>
    request(`${BASE_URL}/group/${id}`, {
      method: 'DELETE'
    }),

  // 获取分组列表
  getGroupList: (params: QueryGroupRequest): Promise<PageResponse<ConfigGroup>> =>
    request(`${BASE_URL}/group`, {
      method: 'GET',
      params
    }),

  // 更新分组状态
  updateGroupStatus: (data: UpdateStatusRequest): Promise<void> =>
    request(`${BASE_URL}/group/status`, {
      method: 'PUT',
      body: data
    })
};
