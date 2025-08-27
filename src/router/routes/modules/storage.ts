import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const STORAGE: AppRouteRecordRaw = {
  path: '/storage',
  name: 'Storage',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.storage',
    requiresAuth: true,
    icon: 'icon-folder',
    order: 4
  },
  children: [
    {
      path: 'storageFiles',
      name: 'StorageFiles',
      component: () => import('@/views/storage/index.vue'),
      meta: {
        locale: 'menu.storage.files',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'storageRecycle',
      name: 'StorageRecycle',
      component: () => import('@/views/storage/recycle.vue'),
      meta: {
        locale: 'menu.storage.recycle',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
};

export default STORAGE;
