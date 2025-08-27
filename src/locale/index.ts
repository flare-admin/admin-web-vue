import { createI18n } from 'vue-i18n';
import en from './en-US';
import cn from './zh-CN';

export const LOCALE_OPTIONS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
];

const i18n = createI18n({
  locale: localStorage.getItem('arco-locale') || 'zh-CN',
  fallbackLocale: 'en-US',
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  messages: {
    'en-US': en,
    'zh-CN': cn
  },
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false
});

// 添加类型检查
if (!i18n.global) {
  throw new Error('i18n instance is not properly initialized');
}

export default i18n;
