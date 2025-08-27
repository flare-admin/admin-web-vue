// 基础响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页请求参数
export interface PageRequest {
  current: number;
  size: number;
}

// 分页响应数据
export interface PageResult<T> {
  list: T[];
  total: number;
}
