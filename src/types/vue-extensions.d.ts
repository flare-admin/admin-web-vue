/// <reference types="vite/client" />

// Vue 3 扩展类型声明
declare module 'vue' {
  export * from '@vue/runtime-dom';
}

// Vue Router 扩展类型声明
declare module 'vue-router' {
  export * from '@vue/router';
}

// Vue I18n 扩展类型声明
declare module 'vue-i18n' {
  export * from '@vue/runtime-core';
}

// JSX 类型声明
declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: any;
  }
}

// 全局类型声明
declare global {
  interface Window {
    routeMonitor?: any;
    routeRecovery?: any;
    NProgress?: {
      start: () => void;
      done: () => void;
    };
  }
}
