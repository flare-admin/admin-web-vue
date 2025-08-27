import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const DATAV: AppRouteRecordRaw = {
  path: '/datav',
  name: 'DataV',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.datav',
    requiresAuth: true,
    icon: 'icon-chart',
    order: 5
  },
  children: [
    {
      path: 'dataVEditor',
      name: 'DataVEditor',
      component: () => import('@/views/datav/index.vue'),
      meta: {
        locale: 'menu.datav.editor',
        requiresAuth: true,
        roles: ['*']
      }
    }
  ]
};

export default DATAV;
