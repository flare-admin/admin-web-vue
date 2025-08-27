import { defineStore } from 'pinia';
import userApi from '@/api/framework/user';
import authApi from '@/api/framework/auth';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { LoginData } from '@/types/api/auth';
import { UserState } from './types';
import useAppStore from '../app';

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    name: undefined,
    avatar: undefined,
    job: undefined,
    organization: undefined,
    location: undefined,
    email: undefined,
    introduction: undefined,
    personalWebsite: undefined,
    jobName: undefined,
    organizationName: undefined,
    locationName: undefined,
    phone: undefined,
    registrationDate: undefined,
    accountId: undefined,
    certification: undefined,
    role: '',
    id: '',
    username: '',
    roles: [],
    permissions: [],
    homePage: ''
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
    isSuperAdmin(): boolean {
      return this.roles.includes('superAdmin');
    }
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user';
        resolve(this.role);
      });
    },
    // Set user's information
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },

    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    // Get user's information
    async info() {
      const res = await userApi.getUserInfo();

      this.setInfo(res);
    },

    // Login
    async login(loginForm: LoginData) {
      try {
        const res = await authApi.login(loginForm);
        setToken(res.access_token, res.access_token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    logoutCallBack() {
      const appStore = useAppStore();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
    },
    // Logout
    async logout() {
      try {
        // todo 退出登录
        // await authApi.loginOut();
      } finally {
        this.logoutCallBack();
      }
    }
  }
});

export default useUserStore;
