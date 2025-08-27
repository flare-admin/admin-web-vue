# 动态路由系统使用说明

## 概述

本项目实现了基于服务端的动态路由系统，可以通过 `getUserMenus` 方法获取用户菜单信息，动态构建路由和菜单。

## 核心特性

- 🚀 **动态路由生成**: 根据服务端返回的菜单配置自动生成Vue Router路由
- 🎯 **权限控制**: 支持基于角色和权限的路由访问控制
- 🔄 **实时更新**: 支持动态添加、移除和更新路由
- 📱 **响应式菜单**: 菜单根据路由配置自动更新
- 🎨 **灵活配置**: 支持图标、国际化、排序等配置

## 系统架构

```
用户登录 → 获取用户信息 → 获取用户菜单 → 动态生成路由 → 更新菜单显示
    ↓
权限验证 → 路由守卫 → 动态路由管理 → 组件懒加载
```

## 配置说明

### 1. 启用服务端菜单

在应用配置中设置 `menuFromServer: true`：

```typescript
// 在应用商店中设置
const appStore = useAppStore();
appStore.updateSettings({ menuFromServer: true });
```

### 2. 服务端菜单数据结构

服务端需要返回以下格式的菜单数据：

```typescript
interface PermissionTreeNode {
  id: number;
  name: string;           // 菜单名称
  code: string;           // 菜单编码（用作路由名称）
  path: string;           // 路由路径
  component: string;      // 组件路径
  icon?: string;          // 图标
  localize?: string;      // 国际化键
  roles?: string[];       // 角色权限
  permissions?: string[]; // 权限标识
  parentId?: number;      // 父级ID
  children?: PermissionTreeNode[]; // 子菜单
}
```

### 3. 组件路径配置

组件路径支持以下格式：

```typescript
// 绝对路径（推荐）
component: '@/views/dashboard/workplace'

// 相对路径（相对于views目录）
component: 'dashboard/workplace'
component: '/dashboard/workplace'

// 自动添加.vue扩展名
component: 'dashboard/workplace' // 实际加载: @/views/dashboard/workplace.vue
```

## 使用示例

### 1. 基本使用

```typescript
// 在用户登录成功后，系统会自动获取菜单配置
// 无需手动调用，系统会自动处理

// 如果需要手动刷新菜单
const appStore = useAppStore();
await appStore.fetchServerMenuConfig();
```

### 2. 动态路由管理

```typescript
import { createDynamicRouteManager } from '@/router/dynamic-routes';

// 创建动态路由管理器
const dynamicRouteManager = createDynamicRouteManager(router);

// 添加动态路由
await dynamicRouteManager.addDynamicRoutes();

// 移除动态路由
dynamicRouteManager.removeDynamicRoutes();

// 重置动态路由
await dynamicRouteManager.resetDynamicRoutes();
```

### 3. 权限控制

```typescript
// 在路由meta中配置权限
{
  path: '/admin',
  name: 'admin',
  component: 'admin/index',
  meta: {
    roles: ['admin', 'super_admin'],     // 角色权限
    permissions: ['admin:read'],         // 权限标识
    requiresAuth: true                   // 需要认证
  }
}
```

## 路由守卫

系统包含以下路由守卫：

### 1. 用户登录信息守卫 (`userLoginInfo.ts`)
- 检查用户登录状态
- 获取用户信息
- 自动获取菜单配置

### 2. 权限守卫 (`permission.ts`)
- 检查路由访问权限
- 动态路由匹配
- 权限验证

### 3. 页面守卫 (`index.ts`)
- 路由变化监听
- 页面事件发射

## 菜单组件

### 1. 菜单树钩子 (`use-menu-tree.ts`)
- 构建菜单树结构
- 权限过滤
- 排序处理

### 2. 菜单组件 (`menu/index.vue`)
- 渲染菜单树
- 处理菜单点击
- 支持折叠展开

## 配置选项

### 应用配置

```typescript
interface AppState {
  menuFromServer: boolean;        // 是否使用服务端菜单
  serverMenu: RouteRecordRaw[];   // 服务端路由配置
  serverMenuTree: any[];          // 服务端菜单树
  // ... 其他配置
}
```

### 路由元信息

```typescript
interface RouteMeta {
  title?: string;           // 页面标题
  icon?: string;            // 图标
  locale?: string;          // 国际化键
  requiresAuth: boolean;    // 需要认证
  roles?: string[];         // 角色权限
  permissions?: string[];   // 权限标识
  hideInMenu?: boolean;     // 隐藏菜单
  order?: number;           // 排序
}
```

## 最佳实践

### 1. 菜单配置

- 使用有意义的路径和名称
- 合理配置图标和国际化
- 设置适当的权限控制

### 2. 组件开发

- 组件路径要与菜单配置一致
- 实现适当的错误边界
- 使用懒加载优化性能

### 3. 权限控制

- 前后端权限保持一致
- 实现细粒度的权限控制
- 记录权限验证日志

### 4. 性能优化

- 合理使用路由懒加载
- 避免不必要的路由重建
- 实现菜单缓存策略

## 故障排除

### 1. 常见问题

**Q: 菜单不显示**
A: 检查 `menuFromServer` 配置，确保服务端返回正确的菜单数据

**Q: 路由跳转失败**
A: 检查组件路径配置，确保组件文件存在

**Q: 权限验证失败**
A: 检查用户角色和权限配置，确保权限数据正确

### 2. 调试方法

```typescript
// 查看当前菜单配置
console.log('服务端菜单:', appStore.serverMenu);
console.log('菜单树:', appStore.serverMenuTree);

// 查看动态路由
console.log('已添加路由:', dynamicRouteManager.getAddedRoutes());
```

### 3. 日志记录

系统会自动记录以下日志：
- 菜单配置加载状态
- 路由添加/移除操作
- 权限验证结果
- 错误信息

## 扩展功能

### 1. 自定义路由转换

```typescript
// 自定义路由转换逻辑
function customRouteConverter(menu: PermissionTreeNode): RouteRecordRaw {
  // 自定义转换逻辑
  return {
    // ... 路由配置
  };
}
```

### 2. 菜单缓存

```typescript
// 实现菜单缓存
const menuCache = new Map();
// ... 缓存逻辑
```

### 3. 权限策略

```typescript
// 自定义权限策略
class CustomPermissionStrategy {
  // ... 权限策略实现
}
```

## 总结

动态路由系统提供了灵活、可扩展的路由管理方案，通过合理的配置和使用，可以实现：

- 基于用户权限的动态菜单
- 灵活的路由配置管理
- 良好的用户体验
- 可维护的代码结构

如有问题，请参考代码注释或联系开发团队。
