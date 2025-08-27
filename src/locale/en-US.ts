import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';
import localeMatcher from '@/views/dashboard/monitor/locale/en-US';
import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

// 自定义页面
import localeAuthority from '@/views/authority/locale/en-US';
import localeLog from '@/views/support/log/locale/en-US';
import localeStorage from '@/views/support/storage/locale/en-US';

import localeSettings from './en-US/settings';

export default {
  'menu.dashboard': 'Dashboard',
  'menu.server.dashboard': 'Dashboard-Server',
  'menu.server.workplace': 'Workplace-Server',
  'menu.server.monitor': 'Monitor-Server',
  'menu.list': 'List',
  'menu.result': 'Result',
  'menu.exception': 'Exception',
  'menu.form': 'Form',
  'menu.profile': 'Profile',
  'menu.visualization': 'Data Visualization',
  'menu.user': 'User Center',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': 'FAQ',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
  ...localeMatcher,
  ...localeAuthority,
  ...localeLog,
  // Common operations
  'common.operations': 'Operations',
  'common.search': 'Search',
  'common.reset': 'Reset',
  'common.success.operation': 'Operation Successful',
  'common.error.operation': 'Operation Failed',
  'common.confirm': 'Confirm',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.table.columns.createdAt': 'Created Time',
  'common.table.columns.updatedAt': 'Updated Time',
  // Status Related
  'common.status.enabled': 'Enabled',
  'common.status.disabled': 'Disabled',
  'common.status.normal': 'Normal',
  'common.status.abnormal': 'Abnormal',
  'common.status.locked': 'Locked',
  'common.status.deleted': 'Deleted',
  'common.selectAll': 'Select All',
  'menu.monitor.system': 'System Monitor',
  ...localeStorage,
  'menu.datav': 'Visual Editor',
  'menu.datav.editor': 'Editor'
};
