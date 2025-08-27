<template>
  <a-form-item field="resources" :label="t('authority.permission.searchTable.columns.resources')">
    <div class="resource-list">
      <div v-for="(resource, index) in modelValue" :key="index" class="resource-item">
        <a-select
          v-model="resource.method"
          style="width: 120px"
          :placeholder="t('authority.permission.form.method.placeholder')"
        >
          <a-option value="GET">GET</a-option>
          <a-option value="POST">POST</a-option>
          <a-option value="PUT">PUT</a-option>
          <a-option value="DELETE">DELETE</a-option>
        </a-select>
        <a-input
          v-model="resource.path"
          :placeholder="t('authority.permission.form.path.placeholder')"
          style="width: calc(100% - 160px); margin: 0 8px"
        />
        <a-button type="text" status="danger" @click="handleRemove(index)">
          <icon-delete />
        </a-button>
      </div>
      <div class="resource-add">
        <a-button type="outline" @click="handleAdd">
          <template #icon>
            <icon-plus />
          </template>
          {{ t('authority.permission.form.resource.add') }}
        </a-button>
      </div>
    </div>
  </a-form-item>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon';
import type { ResourceModel } from '@/types/api/authority';

const props = defineProps<{
  modelValue: ResourceModel[];
}>();

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const handleAdd = () => {
  const resources = [...props.modelValue];
  resources.push({
    method: 'GET',
    path: ''
  });
  emit('update:modelValue', resources);
};

const handleRemove = (index: number) => {
  const resources = [...props.modelValue];
  resources.splice(index, 1);
  emit('update:modelValue', resources);
};
</script>

<style scoped lang="less">
.resource-list {
  .resource-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  //
  //.resource-add {
  //  margin-top: 8px;
  //}
}
</style>
