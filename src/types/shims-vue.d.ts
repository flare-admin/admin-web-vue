declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vue-router' {
  export * from '@types/vue-router';
}

declare module 'vue-i18n' {
  export * from '@types/vue-i18n';
}
