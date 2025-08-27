import NProgress from 'nprogress';
import $http from '@/utils/http';
import type { HttpOption } from '@/types/http';
import { Modal } from '@arco-design/web-vue';

export const request = async (url: string, option?: HttpOption) => {
  try {
    NProgress.start();

    const { method = 'GET', params, body, file } = option || {};

    // 设置请求体的负载
    const payload = body || params;

    // 创建 FormData 实例，适用于上传文件
    const formData = new FormData();

    if (params) {
      // 如果有参数，加入到 FormData 中（普通参数）
      Object.keys(params).forEach((key) => {
        formData.append(key, params[key]);
      });
    }

    if (file) {
      // 如果有文件，加入到 FormData 中
      formData.append('file', file);
    }

    let result: any;

    // 请求方式判断
    switch (method) {
      case 'GET':
        result = await $http.get(url, { params: payload });
        break;

      case 'DELETE':
        result = await $http.delete(url, { params: payload });
        break;

      case 'POST':
        result = await $http.post(url, file ? formData : payload, {
          headers: file
            ? { 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'application/json' }
        });
        break;

      case 'PUT':
        result = await $http.put(url, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        break;

      default:
        // 如果是默认的情况（例如不支持的请求方法），抛出错误并返回 null
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    // 处理返回结果
    if (result?.code === 200) {
      NProgress.done();
      return result.data;
    }

    throw new Error(result?.msg || 'Unknown error occurred');
  } catch (error: any) {
    NProgress.done();
    Modal.message({ message: error.message, status: 'error' });

    // 确保函数始终返回一个值，避免 ESLint 错误
    return null; // 或者可以返回其他合适的默认值
  }
};

export default request;
