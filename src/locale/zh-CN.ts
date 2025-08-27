import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';
import localeLog from '@/views/support/log/locale/zh-CN';
import localeMatcher from '@/views/dashboard/monitor/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';

// 自定义页面
import localeAuthority from '@/views/authority/locale/zh-CN';
import localeStorage from '@/views/support/storage/locale/zh-CN';

import localeSettings from './zh-CN/settings';

export default {
  'menu.dashboard': '仪表盘',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  'menu.list': '列表页',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': '常见问题',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
  ...localeMatcher,
  ...localeAuthority,
  ...localeLog,
  ...localeStorage,
  // 通用操作按钮
  'common.operations': '操作',
  'common.search': '搜索',
  'common.reset': '重置',
  'common.success.operation': '操作成功',
  'common.error.operation': '操作失败',
  'common.confirm': '确认',
  'common.cancel': '取消',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.create': '新建',
  'common.yes': '是',
  'common.no': '否',
  'common.table.columns.createdAt': '创建时间',
  'common.table.columns.updatedAt': '更新时间',
  // 状态相关
  'common.status.enabled': '启用',
  'common.status.disabled': '禁用',
  'common.status.normal': '正常',
  'common.status.abnormal': '异常',
  'common.status.locked': '锁定',
  'common.status.deleted': '已删除',
  'common.selectAll': '全选',
  'menu.monitor.system': '系统监控',
  'menu.datav': '可视化编辑器',
  'menu.datav.editor': '编辑器'
};
