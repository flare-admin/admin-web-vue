// 配置相关类型定义

// 配置实体
export interface Config {
  id: string;
  groupId: string;
  key: string;
  value: string | number | boolean;
  name: string;
  description: string;
  is_enabled: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
  // 扩展字段，用于表单显示
  type?: string;
  required?: boolean;
  placeholder?: string;
  // 配置属性，存储JSON字符串，包含选项和输入框配置
  attributes?: string;
  options?: Array<{ label: string; value: string }>;
}

// 配置分组实体
export interface ConfigGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  is_enabled: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

// 创建配置请求
export interface CreateConfigRequest {
  groupId: string;
  key: string;
  value: string | number | boolean;
  name: string;
  description: string;
  sort: number;
  type?: string;
  attributes?: string;
  options?: Array<{ label: string; value: string }>;
}

// 更新配置请求
export interface UpdateConfigRequest {
  id: string;
  groupId: string;
  key: string;
  value: string | number | boolean;
  name: string;
  description: string;
  sort: number;
  type?: string;
  attributes?: string;
  options?: Array<{ label: string; value: string }>;
}

// 查询配置请求
export interface QueryConfigRequest {
  pageNum: number;
  pageSize: number;
  groupId?: string;
  key?: string;
  name?: string;
  is_enabled?: boolean;
}

// 创建分组请求
export interface CreateGroupRequest {
  name: string;
  code: string;
  description: string;
  sort: number;
}

// 更新分组请求
export interface UpdateGroupRequest {
  id: string;
  name: string;
  code: string;
  description: string;
  sort: number;
}

// 查询分组请求
export interface QueryGroupRequest {
  pageNum: number;
  pageSize: number;
  name?: string;
  code?: string;
  is_enabled?: boolean;
}

// 更新状态请求
export interface UpdateStatusRequest {
  id: string;
  is_enabled: boolean;
}

// 批量更新请求
export interface BatchUpdateRequest {
  configs: Array<{
    id: string;
    value: string;
  }>;
}

// 分页响应
export interface PageResponse<T> {
  total: number;
  list: T[];
}

// 配置表单数据
export interface ConfigFormData {
  [key: string]: string | number | boolean;
}

// 配置表单字段
export interface ConfigFormField {
  key: string;
  name: string;
  type: string;
  value: string | number | boolean;
  required: boolean;
  placeholder?: string;
  attributes?: string;
  options?: Array<{ label: string; value: string }>;
}
