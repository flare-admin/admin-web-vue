// 路由配置示例
// 这个文件展示了如何配置服务端菜单的路由信息

export interface ServerRouteConfig {
  // 路由路径
  path: string;
  // 路由名称（用于路由跳转）
  name: string;
  // 组件路径（相对于views目录）
  component: string;
  // 菜单名称
  title: string;
  // 菜单图标
  icon?: string;
  // 国际化键
  locale?: string;
  // 子路由
  children?: ServerRouteConfig[];
  // 是否隐藏菜单
  hideInMenu?: boolean;
  // 权限角色
  roles?: string[];
  // 权限标识
  permissions?: string[];
  // 排序
  order?: number;
}

// 示例路由配置
export const exampleRoutes: ServerRouteConfig[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: 'dashboard/index',
    title: '仪表盘',
    locale: 'menu.dashboard',
    icon: 'icon-dashboard',
    order: 0,
    children: [
      {
        path: '/dashboard/workplace',
        name: 'workplace',
        component: 'dashboard/workplace/index',
        title: '工作台',
        locale: 'menu.dashboard.workplace',
        icon: 'icon-workplace'
      },
      {
        path: '/dashboard/monitor',
        name: 'monitor',
        component: 'dashboard/monitor/index',
        title: '系统监控',
        locale: 'menu.dashboard.monitor',
        icon: 'icon-monitor'
      }
    ]
  },
  {
    path: '/authority',
    name: 'authority',
    component: 'authority/index',
    title: '权限管理',
    locale: 'menu.authority',
    icon: 'icon-authority',
    order: 1,
    children: [
      {
        path: '/authority/user',
        name: 'user',
        component: 'authority/user/index',
        title: '用户管理',
        locale: 'menu.authority.user',
        icon: 'icon-user'
      },
      {
        path: '/authority/role',
        name: 'role',
        component: 'authority/role/index',
        title: '角色管理',
        locale: 'menu.authority.role',
        icon: 'icon-role'
      },
      {
        path: '/authority/permission',
        name: 'permission',
        component: 'authority/permission/index',
        title: '权限管理',
        locale: 'menu.authority.permission',
        icon: 'icon-permission'
      }
    ]
  }
];

// 路由配置验证函数
export function validateRouteConfig(config: ServerRouteConfig): boolean {
  if (!config.path || !config.name || !config.component) {
    // 验证失败，但不输出到控制台
    return false;
  }

  if (config.children) {
    let isValid = true;
    config.children.forEach((child) => {
      if (!validateRouteConfig(child)) {
        isValid = false;
      }
    });
    return isValid;
  }

  return true;
}

// 路由配置转换函数
export function convertToVueRoute(config: ServerRouteConfig): any {
  return {
    path: config.path,
    name: config.name,
    component: () => import(`@/views/${config.component}.vue`),
    meta: {
      title: config.title,
      icon: config.icon,
      locale: config.locale,
      requiresAuth: true,
      roles: config.roles || ['*'],
      permissions: config.permissions || [],
      hideInMenu: config.hideInMenu || false,
      order: config.order || 0
    },
    children: config.children?.map((child) => convertToVueRoute(child)) || []
  };
}
