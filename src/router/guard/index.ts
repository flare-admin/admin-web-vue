import { setRouteEmitter } from '@/utils/route-listener';
import setupUserLoginInfoGuard from './userLoginInfo';
import setupPermissionGuard from './permission';

function setupPageGuard(router: any) {
  router.beforeEach(async (to: any) => {
    // emit route change
    setRouteEmitter(to);
  });
}

export default function createRouteGuard(router: any) {
  setupPageGuard(router);
  setupUserLoginInfoGuard(router);
  setupPermissionGuard(router);
}
