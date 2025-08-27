<template>
  <template v-if="hasPermission">
    <slot></slot>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useAuth from '@/hooks/auth';

export default defineComponent({
  name: 'Permission',
  props: {
    requiredPermissions: {
      type: Array as () => string[],
      required: true
    }
  },
  setup(props) {
    // 调用 useAuth 在 setup 内
    const { checkPermission } = useAuth();

    // 计算是否拥有权限
    const hasPermission = computed(() => checkPermission(props.requiredPermissions));

    return { hasPermission };
  }
});
</script>
