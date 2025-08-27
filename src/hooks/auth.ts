import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import authApi from '@/api/framework/auth';
import { useAuthStore } from '@/hooks/store';
import { getToken, setToken, clearToken } from '@/utils/auth';
import emitter from '@/events/event-bus';
import { LoginData } from '@/types/api/auth';
import { useAppStore } from '@/store';
import path from 'path';

export default function useAuth() {
  const router = useRouter();
  const appStore = useAppStore();
  const { userStore, resetUserStore } = useAuthStore();
  const loading = ref(false);
  const { t } = useI18n();

  // 处理令牌刷新
  const handleRefreshToken = async (refreshToken: string) => {
    try {
      const res = await authApi.refreshToken(refreshToken);
      setToken(res.access_token, res.refresh_token);
      return true;
    } catch (err) {
      return false;
    }
  };
  // 处理登录
  const login = async (data: LoginData) => {
    await userStore.login(data);
    // 登录后立马获取用户信息
    await userStore.info();
    Message.success(t('login.form.login.success'));
    // 重新加载菜单
    await appStore.fetchServerMenuConfig();

    const { redirect, ...othersQuery } = router.currentRoute.value.query;
    await router.push({
      path: (redirect as string) || '/authority/user',
      query: {
        ...othersQuery
      }
    });
  };

  // 处理登出
  const logout = async () => {
    resetUserStore();
    clearToken();
    await router.push({ name: 'login' });
  };

  // 处理令牌过期
  const handleTokenExpired = async () => {
    const tokenInfo = getToken();
    if (!tokenInfo) {
      await logout();
      return;
    }

    const success = await handleRefreshToken(tokenInfo.refresh_token);
    if (!success) {
      Message.error(t('login.error.expired'));
      await logout();
    }
  };

  const checkPermission = (requiredPermissions: string[]): boolean => {
    if (userStore.isSuperAdmin) {
      return true;
    }
    return requiredPermissions.some((permission) => userStore.permissions.includes(permission));
  };
  onMounted(() => {
    emitter.on('auth:token-expired', handleTokenExpired);
  });

  onUnmounted(() => {
    emitter.off('auth:token-expired', handleTokenExpired);
  });

  return {
    loading,
    login,
    logout,
    checkPermission
  };
}
