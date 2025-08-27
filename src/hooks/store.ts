import { useUserStore } from '@/store';

// eslint-disable-next-line import/prefer-default-export
export function useAuthStore() {
  const userStore = useUserStore();

  const resetUserStore = () => {
    userStore.$reset();
  };

  return {
    resetUserStore,
    userStore
  };
}
