import localeSettings from './en-US/settings';
import { loadAllLocales } from './utils/locale-loader';

// 使用通用加载器加载所有国际化文件
const allLocales = loadAllLocales('en-US');

export default {
  ...localeSettings,
  ...allLocales,
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

  'menu.datav': 'Visual Editor',
  'menu.datav.editor': 'Editor',
  'menu.system': 'System Management'
};
