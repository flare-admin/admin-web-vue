/**
 * 国际化文件加载器演示文件
 * 展示如何使用通用国际化文件加载器
 */

import {
  loadViewLocales,
  loadComponentLocales,
  loadAllLocales,
  getAvailableLocales,
  isLocaleAvailable
} from './locale-loader';

// 演示：加载所有国际化文件
export function demoLoadAllLocales() {
  console.log('=== 演示：加载所有国际化文件 ===');

  try {
    const zhLocales = loadAllLocales('zh-CN');
    console.log('中文国际化文件数量:', Object.keys(zhLocales).length);
    console.log('中文国际化文件示例:', Object.keys(zhLocales).slice(0, 5));

    const enLocales = loadAllLocales('en-US');
    console.log('英文国际化文件数量:', Object.keys(enLocales).length);
    console.log('英文国际化文件示例:', Object.keys(enLocales).slice(0, 5));
  } catch (error) {
    console.error('加载国际化文件失败:', error);
  }
}

// 演示：分别加载不同类型的国际化文件
export function demoLoadSeparateLocales() {
  console.log('\n=== 演示：分别加载不同类型的国际化文件 ===');

  try {
    // 只加载页面级别的国际化文件
    const viewLocales = loadViewLocales('zh-CN');
    console.log('页面级别国际化文件数量:', Object.keys(viewLocales).length);

    // 只加载组件级别的国际化文件
    const componentLocales = loadComponentLocales('zh-CN');
    console.log('组件级别国际化文件数量:', Object.keys(componentLocales).length);
  } catch (error) {
    console.error('分别加载国际化文件失败:', error);
  }
}

// 演示：检查语言可用性
export function demoCheckLocaleAvailability() {
  console.log('\n=== 演示：检查语言可用性 ===');

  try {
    const availableLocales = getAvailableLocales();
    console.log('可用的语言列表:', availableLocales);

    // 检查特定语言是否可用
    console.log('中文是否可用:', isLocaleAvailable('zh-CN'));
    console.log('英文是否可用:', isLocaleAvailable('en-US'));
    console.log('法文是否可用:', isLocaleAvailable('fr-FR'));
  } catch (error) {
    console.error('检查语言可用性失败:', error);
  }
}

// 演示：获取特定模块的国际化内容
export function demoGetSpecificModuleLocales() {
  console.log('\n=== 演示：获取特定模块的国际化内容 ===');

  try {
    const allLocales = loadAllLocales('zh-CN');

    // 获取权限管理相关的国际化内容
    const authorityKeys = Object.keys(allLocales).filter((key) => key.startsWith('authority'));
    console.log('权限管理相关国际化键:', authorityKeys.slice(0, 5));

    // 获取存储管理相关的国际化内容
    const storageKeys = Object.keys(allLocales).filter((key) => key.startsWith('storage'));
    console.log('存储管理相关国际化键:', storageKeys.slice(0, 5));

    // 获取通用操作相关的国际化内容
    const commonKeys = Object.keys(allLocales).filter((key) => key.startsWith('common'));
    console.log('通用操作相关国际化键:', commonKeys.slice(0, 5));
  } catch (error) {
    console.error('获取特定模块国际化内容失败:', error);
  }
}

// 主演示函数
export function runAllDemos() {
  console.log('🚀 开始运行国际化文件加载器演示...\n');

  demoLoadAllLocales();
  demoLoadSeparateLocales();
  demoCheckLocaleAvailability();
  demoGetSpecificModuleLocales();

  console.log('\n✅ 所有演示完成！');
}

// 如果直接运行此文件，则执行所有演示
if (import.meta.env.DEV) {
  // 在开发环境下自动运行演示
  setTimeout(() => {
    runAllDemos();
  }, 1000);
}
