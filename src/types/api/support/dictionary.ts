// 数据字典分类DTO
export interface DictionaryCategory {
  id: string;
  name: string;
  i18nKey: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 数据字典选项DTO
export interface DictionaryOption {
  id: string;
  categoryId: string;
  label: string;
  value: string;
  i18nKey: string;
  sort: number;
  status: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 创建分类请求
export interface CreateCategoryRequest {
  id: string;
  name: string;
  i18nKey: string;
  description: string;
}

// 更新分类请求
export interface UpdateCategoryRequest {
  id: string;
  name: string;
  i18nKey: string;
  description: string;
}

// 查询分类请求
export interface QueryCategoryRequest {
  current: number;
  size: number;
  id?: string;
  name?: string;
  i18nKey?: string;
}

// 创建选项请求
export interface CreateOptionRequest {
  categoryId: string;
  label: string;
  value: string;
  i18nKey: string;
  sort: number;
  status: number;
  remark: string;
}

// 更新选项请求
export interface UpdateOptionRequest {
  id: string;
  label: string;
  value: string;
  i18nKey: string;
  sort: number;
  status: number;
  remark: string;
}

// 查询选项请求
export interface QueryOptionRequest {
  categoryId?: string;
  keyword?: string;
  status?: number;
}

// 分页响应
export interface PageResponse<T> {
  total: number;
  list: T[];
}
