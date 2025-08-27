import { CaptchaReq, CaptchaResult, LoginData, LoginResult } from '@/types/api/auth';
// eslint-disable-next-line import/no-named-as-default
import request from '@/utils/request';

const BASE_URL = '/auth';

export default {
  // 获取图形验证码
  getCaptcha: (params: CaptchaReq): Promise<CaptchaResult> =>
    request(`${BASE_URL}/captcha`, {
      method: 'GET',
      params
    }),

  // 用户登录
  login: (data: LoginData): Promise<LoginResult> =>
    request(`${BASE_URL}/login`, {
      method: 'POST',
      body: data
    }),

  // 刷新令牌
  refreshToken: (refreshToken: string): Promise<LoginResult> =>
    request(`${BASE_URL}/refresh`, {
      method: 'POST',
      body: { refreshToken }
    })
};
