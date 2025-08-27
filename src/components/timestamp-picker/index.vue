<template>
  <a-date-picker
    :model-value="innerValue?.toDate()"
    :show-time="showTime"
    :style="{ width: '100%' }"
    v-bind="$attrs"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { parseToTimestamp } from '@/utils/date';
import type { Dayjs } from 'dayjs';

interface Props {
  modelValue?: number;
  showTime?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTime: true
});

const emit = defineEmits(['update:modelValue']);

const innerValue = ref<Dayjs | undefined>();

// 监听外部值变化
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      innerValue.value = dayjs(val * 1000);
    } else {
      innerValue.value = undefined;
    }
  },
  { immediate: true }
);

// 处理值变化
const handleChange = (value: string | undefined) => {
  if (value) {
    emit('update:modelValue', parseToTimestamp(value));
  } else {
    emit('update:modelValue', undefined);
  }
};
</script>
