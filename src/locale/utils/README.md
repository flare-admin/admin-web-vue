# 通用国际化文件加载器

## 概述

这个通用国际化文件加载器可以自动扫描 `@/views` 和 `@/components` 目录下的所有国际化文件，无需手动一个个导入。

## 特性

- 🚀 自动扫描：自动发现所有国际化文件
- 🔄 动态加载：支持运行时动态加载
- 🎯 智能合并：自动合并多个国际化模块
- 🛡️ 错误处理：优雅处理加载失败的情况
- 📱 多语言支持：支持任意数量的语言

## 使用方法

### 基本用法

```typescript
import { loadAllLocales } from '@/locale/utils/locale-loader';

// 加载所有国际化文件
const allLocales = loadAllLocales('zh-CN');
```

### 分别加载

```typescript
import { 
  loadViewLocales, 
  loadComponentLocales 
} from '@/locale/utils/locale-loader';

// 只加载页面级别的国际化文件
const viewLocales = loadViewLocales('zh-CN');

// 只加载组件级别的国际化文件
const componentLocales = loadComponentLocales('zh-CN');
```

### 检查语言可用性

```typescript
import { 
  getAvailableLocales, 
  isLocaleAvailable 
} from '@/locale/utils/locale-loader';

// 获取所有可用的语言
const availableLocales = getAvailableLocales(); // ['zh-CN', 'en-US']

// 检查特定语言是否可用
const isAvailable = isLocaleAvailable('zh-CN'); // true
```

## 目录结构要求

为了确保国际化文件能被正确加载，请遵循以下目录结构：

```
src/
├── views/
│   ├── authority/
│   │   └── locale/
│   │       ├── zh-CN.ts
│   │       └── en-US.ts
│   ├── support/
│   │   ├── storage/
│   │   │   └── locale/
│   │   │       ├── zh-CN.ts
│   │   │       └── en-US.ts
│   │   └── log/
│   │       └── locale/
│   │           ├── zh-CN.ts
│   │           └── en-US.ts
│   └── dashboard/
│       └── locale/
│           ├── zh-CN.ts
│           └── en-US.ts
└── components/
    └── message-box/
        └── locale/
            ├── zh-CN.ts
            └── en-US.ts
```

## 国际化文件格式

每个国际化文件应该导出默认对象：

```typescript
// @/views/authority/locale/zh-CN.ts
export default {
  'authority.user.title': '用户管理',
  'authority.user.create': '创建用户',
  'authority.user.edit': '编辑用户',
  'authority.user.delete': '删除用户',
  // ... 更多国际化键值对
};
```

## 优先级规则

当存在重复的国际化键时，按以下优先级进行覆盖：

1. `@/components` 目录下的国际化文件（最低优先级）
2. `@/views` 目录下的国际化文件（最高优先级）

这意味着页面级别的国际化配置会覆盖组件级别的配置。

## 错误处理

加载器包含完善的错误处理机制：

- 如果某个国际化文件加载失败，会记录警告但不会中断整个加载过程
- 如果某个模块格式不正确，会被自动跳过
- 所有错误都会被记录到控制台，便于调试

## 性能优化

- 使用 Vite 的 `import.meta.glob` 进行静态分析
- 支持 `eager: true` 选项，在构建时预加载所有文件
- 智能合并算法，避免重复的键值对

## 迁移指南

### 从手动导入迁移

**之前的方式：**
```typescript
import localeAuthority from '@/views/authority/locale/zh-CN';
import localeStorage from '@/views/support/storage/locale/zh-CN';
import localeDictionary from '@/views/support/dictionary/locale/zh-CN';

export default {
  ...localeAuthority,
  ...localeStorage,
  ...localeDictionary,
  // ... 更多手动导入
};
```

**现在的方式：**
```typescript
import { loadAllLocales } from './utils/locale-loader';

const allLocales = loadAllLocales('zh-CN');

export default {
  ...allLocales,
  // ... 其他配置
};
```

## 注意事项

1. 确保所有国际化文件都遵循相同的目录结构
2. 国际化文件必须导出 `default` 对象
3. 键名应该具有唯一性，避免冲突
4. 建议使用命名空间前缀，如 `authority.user.title`

## 故障排除

### 国际化文件未被加载

1. 检查文件路径是否正确
2. 确认文件导出了 `default` 对象
3. 检查 Vite 配置是否正确

### 键值冲突

1. 使用命名空间前缀
2. 检查是否有重复的键名
3. 利用优先级规则进行覆盖

### 性能问题

1. 确保使用 `eager: true` 选项
2. 避免在运行时动态加载
3. 合理组织国际化文件结构
