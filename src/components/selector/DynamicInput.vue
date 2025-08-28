<template>
  <div class="dynamic-input">
    <!-- 字符串类型 -->
    <a-input
      v-if="dataType === 'string'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      allow-clear
      @input="handleInput"
      @change="handleChange"
    />

    <!-- 整数类型 -->
    <a-input-number
      v-else-if="dataType === 'int'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="1"
      :precision="0"
      style="width: 100%"
      @change="handleChange"
    />

    <!-- 浮点数类型 -->
    <a-input-number
      v-else-if="dataType === 'float'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :precision="precision"
      style="width: 100%"
      @change="handleChange"
    />

    <!-- 布尔类型 -->
    <a-select
      v-else-if="dataType === 'bool'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @change="handleChange"
    >
      <a-option :value="true" label="是" />
      <a-option :value="false" label="否" />
    </a-select>

    <!-- JSON类型 -->
    <a-textarea
      v-else-if="dataType === 'json'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="4"
      allow-clear
      @input="handleInput"
      @change="handleChange"
    />

    <!-- 数组类型 -->
    <a-textarea
      v-else-if="dataType === 'array'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="3"
      allow-clear
      @input="handleInput"
      @change="handleChange"
    />

    <!-- 对象类型 -->
    <a-textarea
      v-else-if="dataType === 'object'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="4"
      allow-clear
      @input="handleInput"
      @change="handleChange"
    />

    <!-- 时间类型 -->
    <a-time-picker
      v-else-if="dataType === 'time'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      style="width: 100%"
      @change="handleChange"
    />

    <!-- 日期类型 -->
    <a-date-picker
      v-else-if="dataType === 'date'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      style="width: 100%"
      @change="handleChange"
    />

    <!-- 日期时间类型 -->
    <a-date-picker
      v-else-if="dataType === 'datetime'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      show-time
      style="width: 100%"
      @change="handleChange"
    />

    <!-- 正则表达式类型 -->
    <a-input
      v-else-if="dataType === 'regex'"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      allow-clear
      @input="handleInput"
      @change="handleChange"
    />

    <!-- 默认字符串类型 -->
    <a-input
      v-else
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      allow-clear
      @input="handleInput"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

interface Option {
  label: string;
  value: string | number | boolean;
}

interface Props {
  dataType: string;
  modelValue?: any;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  options?: Option[];
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入',
  disabled: false,
  min: undefined,
  max: undefined,
  step: 1,
  precision: 2,
  options: () => [],
  rows: 3
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'onChange', value: any): void;
}>();

// 根据数据类型转换初始值
const getInitialValue = (value: any, type: string) => {
  if (value === undefined || value === null) {
    switch (type) {
      case 'int':
      case 'float':
        return 0;
      case 'bool':
        return false;
      case 'json':
      case 'array':
      case 'object':
        return '{}';
      case 'time':
      case 'date':
      case 'datetime':
        return '';
      case 'regex':
        return '';
      default:
        return '';
    }
  }
  return value;
};

const inputValue = ref(getInitialValue(props.modelValue, props.dataType));

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = getInitialValue(newValue, props.dataType);
  }
);

// 监听数据类型变化
watch(
  () => props.dataType,
  (newType) => {
    // 数据类型改变时，重置值为该类型的默认值
    inputValue.value = getInitialValue(undefined, newType);
    emit('update:modelValue', inputValue.value);
  }
);

// 处理输入事件
const handleInput = (value: any) => {
  inputValue.value = value;
  emit('update:modelValue', value);
};

// 处理值变化事件
const handleChange = (value: any) => {
  inputValue.value = value;
  emit('update:modelValue', value);
  emit('onChange', value);
};
</script>

<style scoped>
.dynamic-input {
  width: 100%;
}
</style>
