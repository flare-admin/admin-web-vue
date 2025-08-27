import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const LOG: AppRouteRecordRaw = {
  path: '/log',
  name: 'Log',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.log',
    requiresAuth: true,
    icon: 'icon-file',
    order: 6
  },
  children: [
    {
      path: 'adminLogList',
      name: 'AdminLogList',
      component: () => import('@/views/log/admin/index.vue'),
      meta: {
        locale: 'menu.log.admin',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'appLogList',
      name: 'AppLogList',
      component: () => import('@/views/log/app/index.vue'),
      meta: {
        locale: 'menu.log.app',
        requiresAuth: true,
        roles: ['*']
      }
    },
    {
      path: 'operationLogList',
      name: 'OperationLogList',
      component: () => import('@/views/log/operation/index.vue'),
      meta: {
        locale: 'menu.log.operation',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
};

export default LOG;
