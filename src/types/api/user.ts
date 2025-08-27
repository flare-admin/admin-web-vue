export interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  homePage: string;
}
