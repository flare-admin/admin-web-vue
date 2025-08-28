<template>
  <a-select
    v-model="inputValue"
    :options="dataTypeOptions"
    :placeholder="placeholder"
    :disabled="disabled"
    allow-clear
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  disabled?: boolean;
  placeholder?: string;
  modelValue?: string;
}

const props = defineProps<Props>();
const inputValue = ref(props.modelValue || '');
const { t } = useI18n();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'onChange', value: string): void;
}>();

const dataTypeOptions = ref([
  { label: t('config.dataType.string'), value: 'string' },
  { label: t('config.dataType.int'), value: 'int' },
  { label: t('config.dataType.float'), value: 'float' },
  { label: t('config.dataType.bool'), value: 'bool' },
  { label: t('config.dataType.json'), value: 'json' },
  { label: t('config.dataType.array'), value: 'array' },
  { label: t('config.dataType.object'), value: 'object' },
  { label: t('config.dataType.time'), value: 'time' },
  { label: t('config.dataType.date'), value: 'date' },
  { label: t('config.dataType.datetime'), value: 'datetime' },
  { label: t('config.dataType.regex'), value: 'regex' }
]);

/**
 * 监听变化
 */
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue.toString());
});

/**
 * 值改变
 * @param value
 */
const onChange = (value: string) => {
  emit('onChange', value);
};
</script>
