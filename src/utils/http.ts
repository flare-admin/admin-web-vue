import type { AxiosResponse } from 'axios';
import axios, { AxiosRequestConfig } from 'axios';
import { Message } from '@arco-design/web-vue';
import { getToken } from '@/utils/auth';
import emitter from '@/events/event-bus';

const { VITE_API_BASE_URL, VITE_API_VERSION } = import.meta.env;

const http = axios.create({
  baseURL: `${VITE_API_BASE_URL}/${VITE_API_VERSION}`,
  timeout: 5000
});

http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    if (res.code !== 200) {
      Message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  async (error: any) => {
    if (error.response?.status === 401) {
      emitter.emit('auth:token-expired');
    } else {
      Message.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default http;
