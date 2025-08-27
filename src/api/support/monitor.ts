// eslint-disable-next-line import/no-named-as-default
import request from '@/utils/request';
import type { SystemMetrics, RuntimeMetrics } from '@/types/api/monitor';

export const monitorApi = {
  // 获取系统指标
  getSystemMetrics(): Promise<SystemMetrics> {
    return request('/metrics/system', {
      method: 'GET'
    });
  },

  // 获取运行时指标
  getRuntimeMetrics(): Promise<RuntimeMetrics> {
    return request('/metrics/runtime', {
      method: 'GET'
    });
  }
};

export default monitorApi;
