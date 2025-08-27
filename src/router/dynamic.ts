// 扫描 src/views/ 下的所有 vue 文件
import { Router, RouteRecordRaw } from 'vue-router';

/**
 * 添加动态路由到 router
 */
export function addDynamicRoutes(router: Router, menus: any[]) {
  if (menus.length > 0) {
    menus.forEach((route) => {
      router.addRoute(route);
    });
  }
}

/**
 * 移除动态路由
 */
export function resetDynamicRoutes(router: Router) {
  router.getRoutes().forEach((route: RouteRecordRaw) => {
    if (route.meta && route.meta.localize) {
      // 这里假设动态路由都有 localize 元数据
      if (router.hasRoute(route.name!)) {
        router.removeRoute(route.name!);
      }
    }
  });
}
