import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import defaultSettings from '@/config/settings.json';
import userApi from '@/api/framework/user';
import {addDynamicRoutes} from "@/router/dynamic";
import {formatRoutes} from "@/router/formatRoutes";
import { AppState } from './types';


const useAppStore = defineStore('app', {
  state: (): AppState => ({
    ...defaultSettings,
    serverMenu: [],
    serverMenuTree: []
  }),

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state };
    },
    appDevice(state: AppState) {
      return state.device;
    },
    appAsyncMenus(state: AppState): any[] {
      return state.serverMenu;
    },
    // 获取服务端菜单树
    serverMenuTree(state: AppState): any[] {
      return state.serverMenuTree || [];
    }
  },

  actions: {
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      // @ts-ignore-next-line
      this.$patch(partial);
    },

    // Change theme color
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },

    // 获取服务端菜单配置
    async fetchServerMenuConfig(router?: any) {
      try {
        const data = await userApi.getUserMenus();
        const routes = formatRoutes(data);
        this.$patch({
          serverMenu: routes,
          serverMenuTree: routes
        });
        
        if (router) {
          addDynamicRoutes(router, routes);
        }
        return routes;
      } catch (error) {
        console.error(error);
        Notification.error({
          id: 'menuNotice',
          content: '菜单配置加载失败',
          closable: true
        });
        // 将错误向上抛出，以便调用方可以捕获
        throw error;
      }
    },

    // 清除服务端菜单
    clearServerMenu() {
      this.serverMenu = [];
      this.serverMenuTree = [];
    }
  }
});

export default useAppStore;
