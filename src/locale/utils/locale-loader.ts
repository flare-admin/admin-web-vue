/**
 * 通用国际化文件加载器
 * 自动扫描 @/views 和 @/components 目录下的所有国际化文件
 */

// 国际化文件类型
export interface LocaleModule {
  [key: string]: any;
}

// 预定义的国际化文件模式（Vite 要求使用字面量）
const VIEW_LOCALE_PATTERN = '@/views/**/locale/*.ts';
const COMPONENT_LOCALE_PATTERN = '@/components/**/locale/*.ts';

// 使用 Vite 的 glob 导入功能扫描国际化文件
function scanLocaleFiles(pattern: string, locale: string): LocaleModule[] {
  const modules: LocaleModule[] = [];

  try {
    let localeFiles: Record<string, any> = {};

    // 根据模式选择对应的 glob 导入
    if (pattern === VIEW_LOCALE_PATTERN) {
      localeFiles = import.meta.glob('@/views/**/locale/*.ts', { eager: true });
    } else if (pattern === COMPONENT_LOCALE_PATTERN) {
      localeFiles = import.meta.glob('@/components/**/locale/*.ts', { eager: true });
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unsupported pattern:', pattern);
      return modules;
    }

    // 使用 Object.entries 替代 for...in 循环
    Object.entries(localeFiles).forEach(([path, module]) => {
      // 检查是否是目标语言的国际化文件
      if (path.includes(`/locale/${locale}.ts`)) {
        const localeModule = module as LocaleModule;
        if (localeModule.default) {
          modules.push(localeModule.default);
        }
      }
    });
  } catch (error) {
    // 使用 console.warn 替代 console.log，或者可以移除这个 console 语句
    // eslint-disable-next-line no-console
    console.warn('Failed to scan locale files:', error);
  }

  return modules;
}

// 合并多个国际化模块
function mergeLocaleModules(modules: LocaleModule[]): LocaleModule {
  const merged: LocaleModule = {};

  modules.forEach((module) => {
    if (module && typeof module === 'object') {
      Object.assign(merged, module);
    }
  });

  return merged;
}

// 加载 views 目录下的国际化文件
export function loadViewLocales(locale: string): LocaleModule {
  const modules = scanLocaleFiles(VIEW_LOCALE_PATTERN, locale);
  return mergeLocaleModules(modules);
}

// 加载 components 目录下的国际化文件
export function loadComponentLocales(locale: string): LocaleModule {
  const modules = scanLocaleFiles(COMPONENT_LOCALE_PATTERN, locale);
  return mergeLocaleModules(modules);
}

// 加载所有国际化文件
export function loadAllLocales(locale: string): LocaleModule {
  const viewLocales = loadViewLocales(locale);
  const componentLocales = loadComponentLocales(locale);

  // 合并所有国际化文件，views 的优先级高于 components
  const allLocales = {
    ...componentLocales,
    ...viewLocales
  };

  return allLocales;
}

// 获取可用的语言列表
export function getAvailableLocales(): string[] {
  try {
    const viewLocaleFiles = import.meta.glob('@/views/**/locale/*.ts', { eager: true });
    const componentLocaleFiles = import.meta.glob('@/components/**/locale/*.ts', { eager: true });
    const locales = new Set<string>();

    // 扫描 views 目录
    Object.entries(viewLocaleFiles).forEach(([path]) => {
      const match = path.match(/\/locale\/([^/]+)\.ts$/);
      if (match) {
        locales.add(match[1]);
      }
    });

    // 扫描 components 目录
    Object.entries(componentLocaleFiles).forEach(([path]) => {
      const match = path.match(/\/locale\/([^/]+)\.ts$/);
      if (match) {
        locales.add(match[1]);
      }
    });

    return Array.from(locales);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to get available locales:', error);
    return ['zh-CN', 'en-US']; // 默认语言
  }
}

// 检查特定语言是否可用
export function isLocaleAvailable(locale: string): boolean {
  const availableLocales = getAvailableLocales();
  return availableLocales.includes(locale);
}
