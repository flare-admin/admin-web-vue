import { Router } from 'vue-router';
import { Message } from '@arco-design/web-vue';

/**
 * 路由错误处理中间件
 * 用于捕获和处理路由导航过程中的错误
 */
export default function setupErrorHandler(router: Router) {
  // 全局路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error);

    // 根据错误类型显示不同的提示信息
    if (error.name === 'NavigationDuplicated') {
      // 重复导航错误，通常不需要显示给用户
      console.warn('重复导航:', error.message);
    } else if (error.name === 'NavigationAborted') {
      // 导航被中止
      console.warn('导航被中止:', error.message);
    } else if (error.name === 'NavigationCancelled') {
      // 导航被取消
      console.warn('导航被取消:', error.message);
    } else {
      // 其他未知错误
      Message.error('页面加载失败，请刷新重试');
    }
  });

  // 全局后置钩子，用于处理导航完成后的状态
  router.afterEach((to, from) => {
    // 清除加载状态
    if (window.NProgress) {
      window.NProgress.done();
    }

    // 记录导航日志
    console.log('路由导航完成:', {
      from: from.path,
      to: to.path,
      timestamp: new Date().toISOString()
    });
  });

  // 全局前置钩子，用于处理导航开始前的状态
  router.beforeResolve((to, from, next) => {
    // 设置加载状态
    if (window.NProgress) {
      window.NProgress.start();
    }

    // 检查路由是否存在
    const route = router.resolve(to);
    if (!route.matched.length) {
      console.warn('路由未找到:', to.path);
      Message.error('页面不存在');
      next(false);
      return;
    }

    next();
  });
}

// 扩展 Window 接口
declare global {
  interface Window {
    NProgress?: {
      start: () => void;
      done: () => void;
    };
  }
}
