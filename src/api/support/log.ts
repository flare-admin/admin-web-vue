import type {
  LogQueryParams,
  LogQueryResult,
  OperationLogQueryParams,
  OperationLogQueryResult
} from '@/types/api/log';
// eslint-disable-next-line import/no-named-as-default
import request from '@/utils/request';

export const logApi = {
  // 获取管理端日志列表
  getAdminLogList: (params: LogQueryParams): Promise<LogQueryResult> =>
    request(`sys/login-log/admin`, {
      method: 'GET',
      params
    }),

  // 获取用户端日志列表
  getAppLogList: (params: LogQueryParams): Promise<LogQueryResult> =>
    request(`sys/login-log/app`, {
      method: 'GET',
      params
    }),

  // 获取操作日志列表
  getOperationLogList: (params: OperationLogQueryParams): Promise<OperationLogQueryResult> =>
    request(`/oplog/list`, {
      method: 'GET',
      params
    })
};

export default logApi;
