<script lang="tsx">
import { defineComponent, ref, h, compile, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/store';
import { listenerRouteChange } from '@/utils/route-listener';
import { openWindow, regexUrl } from '@/utils';
import { SubMenu as ASubMenu, MenuItem as AMenuItem, Menu as AMenu } from '@arco-design/web-vue';
import useMenuTree from './use-menu-tree';

export default defineComponent({
  emit: ['collapse'],
  setup() {
    const { t } = useI18n();
    const appStore = useAppStore();
    const router = useRouter();
    const route = useRoute();
    const { menuTree } = useMenuTree();
    const collapsed = computed({
      get() {
        if (appStore.device === 'desktop') return appStore.menuCollapse;
        return false;
      },
      set(value: boolean) {
        appStore.updateSettings({ menuCollapse: value });
      }
    });

    const topMenu = computed(() => appStore.topMenu);
    const openKeys = ref<string[]>([]);
    const selectedKey = ref<string[]>([]);

    const goto = async (item: any) => {
      // Open external link
      if (regexUrl.test(item.path)) {
        openWindow(item.path);
        selectedKey.value = [item.name as string];
        return;
      }
      // Eliminate external link side effects
      const { hideInMenu, activeMenu } = item.meta || {};
      if (route.name === item.name && !hideInMenu && !activeMenu) {
        selectedKey.value = [item.name as string];
        return;
      }
      // Trigger router change
      try {
        await router.push({
          name: item.name
        });
      } catch (err) {
        console.error('Navigation error:', err);
      }
    };
    
    const findMenuOpenKeys = (target: string) => {
      const result: string[] = [];
      let isFind = false;
      const backtrack = (item: any, keys: string[]) => {
        if (item.name === target) {
          isFind = true;
          result.push(...keys);
          return;
        }
        if (item.children?.length) {
          item.children.forEach((el: any) => {
            backtrack(el, [...keys, el.name as string]);
          });
        }
      };
      menuTree.value.forEach((el: any) => {
        if (isFind) return; // Performance optimization
        backtrack(el, [el.name as string]);
      });
      return result;
    };
    
    listenerRouteChange((newRoute) => {
      const { requiresAuth, activeMenu, hideInMenu } = newRoute.meta || {};
      if (requiresAuth && (!hideInMenu || activeMenu)) {
        const menuOpenKeys = findMenuOpenKeys((activeMenu || newRoute.name) as string);

        const keySet = new Set([...menuOpenKeys, ...openKeys.value]);
        openKeys.value = [...keySet];

        selectedKey.value = [activeMenu || menuOpenKeys[menuOpenKeys.length - 1]];
      }
    }, true);
    
    const setCollapse = (val: boolean) => {
      if (appStore.device === 'desktop') appStore.updateSettings({ menuCollapse: val });
    };

    const renderSubMenu = () => {
      function travel(_route: any[], nodes = []) {
        if (_route) {
          _route.forEach((element) => {
            // 处理图标 - 如果是字符串，使用图标名称；如果是组件，直接使用
            let icon = null;
            if (element?.meta?.icon) {
              if (typeof element.meta.icon === 'string') {
                // 字符串格式的图标，使用图标名称
                icon = () => h('i', { class: `icon-${element.meta.icon}` });
              } else {
                // 组件格式的图标，直接使用
                icon = () => h(element.meta.icon);
              }
            }

            const node =
              element?.children && element?.children.length !== 0 ? (
                <ASubMenu
                  key={element?.name}
                  v-slots={{
                    icon,
                    title: () => h(compile(t(element?.meta?.locale || '')))
                  }}
                >
                  {travel(element?.children)}
                </ASubMenu>
              ) : (
                <AMenuItem key={element?.name} v-slots={{ icon }} onClick={() => goto(element)}>
                  {t(element?.meta?.locale || '')}
                </AMenuItem>
              );
            nodes.push(node as never);
          });
        }
        return nodes;
      }
      return travel(menuTree.value);
    };

    return () => (
      <AMenu
        mode={topMenu.value ? 'horizontal' : 'vertical'}
        v-model:collapsed={collapsed.value}
        v-model:open-keys={openKeys.value}
        show-collapse-button={appStore.device !== 'mobile'}
        auto-open={false}
        selected-keys={selectedKey.value}
        auto-open-selected={true}
        level-indent={34}
        style="height: 100%;width:100%;"
        onCollapse={setCollapse}
      >
        {renderSubMenu()}
      </AMenu>
    );
  }
});
</script>

<style lang="less" scoped>
:deep(.arco-menu-inner) {
  .arco-menu-inline-header {
    display: flex;
    align-items: center;
  }

  .arco-icon {
    &:not(.arco-icon-down) {
      font-size: 18px;
    }
  }
}
</style>
