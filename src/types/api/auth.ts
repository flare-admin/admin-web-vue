export interface LoginData {
  username: string;
  password: string;
  captchaKey: string;
  captchaCode: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
}
export interface CaptchaReq {
  width: number;
  height: number;
}

export interface CaptchaResult {
  key: string;
  image: string;
}
