<template>
  <div class="json-editor">
    <a-textarea
      v-model="jsonString"
      :rows="10"
      :style="{ width: '100%' }"
      @blur="handleBlur"
      @input="handleInput"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const jsonString = ref('');

watch(
  () => props.modelValue,
  (val) => {
    try {
      jsonString.value = JSON.stringify(val, null, 2);
    } catch (err) {
      console.error('Failed to stringify JSON:', err);
    }
  },
  { immediate: true }
);

const handleInput = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    emit('update:modelValue', parsed);
  } catch (err) {
    // 解析错误时不更新值
  }
};

const handleBlur = () => {
  try {
    const parsed = JSON.parse(jsonString.value);
    emit('update:modelValue', parsed);
  } catch (err) {
    Message.error('JSON格式错误');
    // 恢复为有效的JSON字符串
    jsonString.value = JSON.stringify(props.modelValue, null, 2);
  }
};
</script>

<style scoped>
.json-editor {
  width: 100%;
}
</style>
