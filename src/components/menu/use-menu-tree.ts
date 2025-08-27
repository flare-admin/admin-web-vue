import { computed } from 'vue';
import usePermission from '@/hooks/permission';
import { useAppStore } from '@/store';
import appClientMenus from '@/router/app-menus';
import { cloneDeep } from 'lodash';

export default function useMenuTree() {
  const permission = usePermission();
  const appStore = useAppStore();

  const appRoute = computed(() => {
    if (appStore.menuFromServer) {
      // 如果使用服务端菜单，返回服务端菜单树
      return appStore.serverMenuTree;
    }
    return appClientMenus;
  });

  const menuTree = computed(() => {
    const copyRouter = cloneDeep(appRoute.value) as any[];
    // 按顺序排序
    copyRouter.sort((a: any, b: any) => {
      return (a.meta?.order || 0) - (b.meta?.order || 0);
    });

    function travel(_routes: any[], layer: number) {
      if (!_routes) return null;

      const collector: any = _routes.map((element) => {
        // 检查路由访问权限
        if (!permission.accessRouter(element)) {
          return null;
        }

        // 叶子节点
        if (element.meta?.hideChildrenInMenu || !element.children) {
          element.children = [];
          return element;
        }

        // 过滤隐藏菜单项
        element.children = element.children.filter((x: any) => x.meta?.hideInMenu !== true);

        // 递归处理子节点
        const subItem = travel(element.children, layer + 1);

        if (subItem.length) {
          element.children = subItem;
          return element;
        }

        // 处理层级逻辑
        if (layer > 1) {
          element.children = subItem;
          return element;
        }

        if (element.meta?.hideInMenu === false) {
          return element;
        }

        return null;
      });
      return collector.filter(Boolean);
    }

    return travel(copyRouter, 0);
  });

  return {
    menuTree
  };
}
