import NProgress from 'nprogress'; // progress bar

import usePermission from '@/hooks/permission';
import { useUserStore, useAppStore } from '@/store';
import { appRoutes } from '../routes';
import { WHITE_LIST, NOT_FOUND } from '../constants';

export default function setupPermissionGuard(router: any) {
  // 添加标记，确保菜单配置只加载一次
  let menuConfigLoaded = false;

  router.beforeEach(async (to: any, from: any, next: any) => {
    const appStore = useAppStore();
    const userStore = useUserStore();
    const Permission = usePermission();
    const permissionsAllow = Permission.accessRouter(to);

    console.log('权限守卫 - 目标路由:', to.path, to.name);
    console.log('权限守卫 - 权限检查结果:', permissionsAllow);

    if (appStore.menuFromServer) {
      // 针对来自服务端的菜单配置进行处理
      // Handle routing configuration from the server

      // 如果没有服务端菜单配置且未加载过，先获取菜单配置
      if (!menuConfigLoaded && !WHITE_LIST.find((el) => el.path === to.path)) {
        // eslint-disable-next-line no-console
        console.log('权限守卫 - 首次加载菜单配置');
        const data = await appStore.fetchServerMenuConfig(router);
        menuConfigLoaded = true; // 标记已加载
      }

      // 检查路由是否存在于路由器中
      const currentRoutes = router.getRoutes();
      console.log(
        '权限守卫 - 当前所有路由:',
        currentRoutes.map((r: any) => ({ path: r.path, name: r.name }))
      );

      let matchingRoute = currentRoutes.find((route: any) => route.path === to.path);
      console.log('权限守卫 - 路径匹配结果:', matchingRoute);

      // 如果按路径没找到，再按名称匹配
      if (!matchingRoute) {
        matchingRoute = currentRoutes.find((route: any) => route.name === to.name);
        console.log('权限守卫 - 名称匹配结果:', matchingRoute);
      }

      // 如果还是没找到，尝试模糊匹配（处理动态路由的情况）
      if (!matchingRoute) {
        matchingRoute = currentRoutes.find((route: any) => {
          // 检查是否是动态路由，路径可能不完全匹配
          const match =
            route.path &&
            to.path &&
            (route.path === to.path ||
              route.path.replace(/\/$/, '') === to.path.replace(/\/$/, '') ||
              (route.children &&
                route.children.some(
                  (child: any) =>
                    child.path === to.path ||
                    child.path.replace(/\/$/, '') === to.path.replace(/\/$/, '')
                )));
          if (match) {
            console.log('权限守卫 - 模糊匹配成功:', route.path);
          }
          return match;
        });
        console.log('权限守卫 - 模糊匹配结果:', matchingRoute);
      }

      let routeExists = !!matchingRoute;
      console.log('权限守卫 - 路由存在检查结果:', routeExists);

      // 如果路由不存在且不是白名单路由，且菜单配置已加载，则跳转404
      if (!routeExists && !WHITE_LIST.find((el) => el.name === to.name)) {
        if (menuConfigLoaded) {
          // eslint-disable-next-line no-console
          console.log('权限守卫 - 菜单配置已加载，但路由仍不存在，跳转404');
          next(NOT_FOUND);
          return;
        }
        // eslint-disable-next-line no-console
        console.log('权限守卫 - 菜单配置未加载，尝试加载');
        await appStore.fetchServerMenuConfig(router);
        menuConfigLoaded = true; // 标记已加载

        // 重新检查路由是否存在
        const updatedRoutes = router.getRoutes();
        console.log(
          '权限守卫 - 更新后的路由:',
          updatedRoutes.map((r: any) => ({ path: r.path, name: r.name }))
        );

        const updatedMatchingRoute = updatedRoutes.find(
          (route: any) => route.path === to.path || route.name === to.name
        );

        if (updatedMatchingRoute) {
          // eslint-disable-next-line no-console
          console.log('权限守卫 - 动态路由添加成功，路由已存在');
          matchingRoute = updatedMatchingRoute;
          routeExists = true;
        } else {
          // eslint-disable-next-line no-console
          console.log('权限守卫 - 动态路由添加失败，路由仍不存在');
        }
      }

      // 检查权限并决定是否允许访问
      if (routeExists && permissionsAllow) {
        console.log('权限守卫 - 路由存在且权限允许，允许访问');
        if (matchingRoute.name !== to.name) {
          console.log('权限守卫 - 路由名称不匹配，跳转:', matchingRoute.name);
          next({ name: matchingRoute.name });
          return;
        }
        next();
      } else if (WHITE_LIST.find((el) => el.name === to.name)) {
        // 白名单路由直接通过
        console.log('权限守卫 - 白名单路由，允许访问');
        next();
      } else {
        // eslint-disable-next-line no-console
        console.log('权限守卫 - 路由不存在或无权限，跳转404');
        console.log('权限守卫 - 路由存在状态:', routeExists);
        console.log('权限守卫 - 权限允许状态:', permissionsAllow);
        next(NOT_FOUND);
      }
    } else if (permissionsAllow) {
      // 使用客户端菜单配置且权限允许
      console.log('权限守卫 - 客户端菜单配置且权限允许，允许访问');
      next();
    } else {
      // 使用客户端菜单配置但权限不允许
      const destination =
        Permission.findFirstPermissionRoute(appRoutes, userStore.role) || NOT_FOUND;
      console.log('权限守卫 - 权限不允许，跳转到:', destination);
      next(destination);
    }

    NProgress.done();
  });
}
