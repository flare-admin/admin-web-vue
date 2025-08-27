import { DirectiveBinding } from 'vue';
import { useUserStore } from '@/store';
import { includes } from 'lodash';

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding;
  const userStore = useUserStore();
  const { permissions } = userStore;

  if (Array.isArray(value)) {
    if (value.length > 0) {
      const hasPermission = value.some((item) => permissions.includes(item));
      if (!hasPermission && el.parentNode && !userStore.isSuperAdmin) {
        el.parentNode.removeChild(el);
      }
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','user']"`);
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  }
};
