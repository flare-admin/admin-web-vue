import { PermissionTreeNode } from '@/types/api/framework/authority';

export interface AppState {
  theme: string;
  colorWeak: boolean;
  navbar: boolean;
  menu: boolean;
  topMenu: boolean;
  hideMenu: boolean;
  menuCollapse: boolean;
  footer: boolean;
  themeColor: string;
  menuWidth: number;
  globalSettings: boolean;
  device: string;
  tabBar: boolean;
  menuFromServer: boolean;
  serverMenu: PermissionTreeNode[]; // 服务端菜单原始数据
  serverMenuTree: PermissionTreeNode[]; // 服务端菜单树原始数据
  [key: string]: unknown;
  loading: boolean;
}
