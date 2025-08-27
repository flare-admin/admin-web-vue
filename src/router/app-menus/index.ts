// import { appRoutes, appExternalRoutes } from '../routes';

// const mixinRoutes = [...appRoutes, ...appExternalRoutes];

// const appClientMenus = mixinRoutes.map((el) => {
//   const { name, path, meta, redirect, children } = el;
//   return {
//     name,
//     path,
//     meta,
//     redirect,
//     children
//   };
// });

// 注释掉从modules加载路由，改为使用store中的serverMenu
// const appClientMenus: any[] = [];

import { useAppStore } from '@/store';

// 从store中获取菜单的函数
function getAppClientMenus() {
  const appStore = useAppStore();
  if (appStore.menuFromServer) {
    // 如果使用服务端菜单，返回服务端菜单
    return appStore.serverMenu || [];
  }
  // 如果不使用服务端菜单，返回空数组
  return [];
}

// 导出从store获取的菜单
export default getAppClientMenus();
