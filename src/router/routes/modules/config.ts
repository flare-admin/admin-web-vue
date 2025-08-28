import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const CONFIG: AppRouteRecordRaw = {
  path: '/config',
  name: 'Config',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.config',
    requiresAuth: true,
    icon: 'icon-settings',
    order: 5
  },
  children: [
    {
      path: 'management',
      name: 'ConfigManagement',
      component: () => import('@/views/support/config/index.vue'),
      meta: {
        locale: 'menu.config.management',
        requiresAuth: true,
        roles: ['admin', 'developer']
      }
    },
    {
      path: 'form',
      name: 'ConfigForm',
      component: () => import('@/views/support/config/form.vue'),
      meta: {
        locale: 'menu.config.form',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
};

export default CONFIG;
