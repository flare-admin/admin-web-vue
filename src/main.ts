import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import globalComponents from '@/components';
import { formatTimestamp } from '@/filters/date';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';
import './mock';
import App from './App.vue';
// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '@/assets/style/global.less';

// 手动引入 ECharts 模块
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

// 添加全局错误监听器
window.onerror = function (msg, url, line, col, error) {
  console.error('Global error:', { msg, url, line, col, error });
  return false;
};

// 添加未处理的 Promise 错误监听器
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const app = createApp(App);

// 全局注册 VChart 组件
app.component('VChart', VChart);

// 添加调试信息
app.config.performance = true;
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('arco-');

// 配置全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err);
  console.error('Error Info:', info);
  console.error('Component:', vm);
};

// 配置全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue Warning:', msg, trace);
};

app.use(ArcoVue, {});
app.use(ArcoVueIcon);

app.use(router);
app.use(store);

// 确保 i18n 实例正确初始化
if (!i18n.global) {
  throw new Error('i18n instance is not properly initialized');
}
app.use(i18n);

app.use(globalComponents);
app.use(directive);

app.config.globalProperties.$filters = {
  formatTimestamp
};

app.mount('#app');
