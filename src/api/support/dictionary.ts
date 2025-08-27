import request from '@/utils/request';
import {
  DictionaryCategory,
  DictionaryOption,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  QueryCategoryRequest,
  CreateOptionRequest,
  UpdateOptionRequest,
  QueryOptionRequest,
  PageResponse
} from '@/types/api/support/dictionary';

const BASE_URL = '/dictionary';

export default {
  // 分类相关接口
  // 创建分类
  createCategory: (data: CreateCategoryRequest): Promise<void> =>
    request(`${BASE_URL}/category`, {
      method: 'POST',
      body: data
    }),

  // 更新分类
  updateCategory: (data: UpdateCategoryRequest): Promise<void> =>
    request(`${BASE_URL}/category`, {
      method: 'PUT',
      body: data
    }),

  // 获取分类详情
  getCategory: (id: string): Promise<DictionaryCategory> =>
    request(`${BASE_URL}/category/${id}`, {
      method: 'GET'
    }),

  // 删除分类
  deleteCategory: (id: string): Promise<void> =>
    request(`${BASE_URL}/category/${id}`, {
      method: 'DELETE'
    }),

  // 获取分类列表
  getCategoryList: (params: QueryCategoryRequest): Promise<PageResponse<DictionaryCategory>> =>
    request(`${BASE_URL}/categories`, {
      method: 'GET',
      params
    }),

  // 选项相关接口
  // 创建选项
  createOption: (data: CreateOptionRequest): Promise<void> =>
    request(`${BASE_URL}/option`, {
      method: 'POST',
      body: data
    }),

  // 更新选项
  updateOption: (id: string, data: UpdateOptionRequest): Promise<void> =>
    request(`${BASE_URL}/option/${id}`, {
      method: 'PUT',
      body: data
    }),

  // 删除选项
  deleteOption: (id: string): Promise<void> =>
    request(`${BASE_URL}/option/${id}`, {
      method: 'DELETE'
    }),

  // 获取选项列表
  getOptionList: (params: QueryOptionRequest): Promise<DictionaryOption[]> =>
    request(`${BASE_URL}/options`, {
      method: 'GET',
      params
    })
};
