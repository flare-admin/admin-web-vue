import { DEFAULT_LAYOUT } from "./routes/base";


export const modules = import.meta.glob('@/views/**/*.vue');

// src/router/formatRoutes.ts

// 将路径转换为驼峰命名
function pathToCamelCase(path: string): string {
  if (!path) return '';
  
  // 移除开头的斜杠，然后转换为驼峰命名
  return path
    .replace(/^\//, '') // 移除开头的斜杠
    .replace(/[-_]([a-z])/g, (match, letter) => letter.toUpperCase()) // 连字符和下划线转驼峰
    .replace(/\/([a-z])/g, (match, letter) => letter.toUpperCase()); // 斜杠后的字母转大写
}

export function formatRoutes(menus: any[]): any[] {
  return menus.map((menu) => {
    // 将路径转换为驼峰命名
    const name = menu.path ? pathToCamelCase(menu.path) : menu.code;
    // path 必须处理成 / 开头
    const path = menu.path.startsWith('/') ? menu.path : `/${menu.path}`;
    
    const route: any = {
      path,
      name,
      meta: {
        title: menu.name,
        icon: menu.icon,
        locale: menu.localize,
        hideInMenu: menu.hideInMenu || false,
        requiresAuth: true,
        roles: ['*']
      }
    };


    if (menu.parentId === 0) {
      route.component = DEFAULT_LAYOUT;
    }else if (menu.component) {
      const componentPath = `/src/views/${menu.component}.vue`;
      console.log(componentPath);
      if (modules[componentPath]) {
        route.component = modules[componentPath]; // 使用 import.meta.glob 的模块，支持懒加载
      } else {
        console.warn(`组件未找到: ${componentPath}`);
      }
    }

    // 如果有 children，递归处理
    if (menu.children && menu.children.length > 0) {
      route.children = formatRoutes(menu.children);
    }

    return route;
  });
}