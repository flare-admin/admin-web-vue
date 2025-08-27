// eslint-disable-next-line import/no-named-as-default
import request from '@/utils/request';
import type { PermissionTreeNode } from '@/types/api/authority';
import { UserInfo } from '@/types/api/user';

const BASE_URL = '/sys/user';

export default {
  // 获取用户信息
  getUserInfo: (): Promise<UserInfo> =>
    request(`${BASE_URL}/info`, {
      method: 'GET'
    }),

  // 获取用户菜单树
  getUserMenus: (): Promise<PermissionTreeNode[]> =>
    request(`${BASE_URL}/menus`, {
      method: 'GET'
    })
};
