<template>
  <a-modal
    :visible="visible"
    title="批量更新配置"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleCancel"
    @update:visible="handleVisibleChange"
  >
    <div class="batch-update-content">
      <a-alert
        type="info"
        :content="`共选择 ${configs.length} 个配置项，请谨慎操作`"
        style="margin-bottom: 16px"
      />

      <a-table :data="configList" :pagination="false" :scroll="{ y: 400 }">
        <template #columns>
          <a-table-column :title="t('config.table.name')" data-index="name" :width="150" />
          <a-table-column :title="t('config.table.key')" data-index="key" :width="150" />
          <a-table-column :title="t('config.table.value')" data-index="value" :width="200" />
          <a-table-column :title="t('config.table.newValue')" :width="200">
            <template #cell="{ record }">
              <a-input v-model="record.newValue" :placeholder="record.value" allow-clear />
            </template>
          </a-table-column>
          <a-table-column :title="t('config.table.description')" data-index="description" :width="200" />
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import configApi from '@/api/support/config';
import type { Config, BatchUpdateRequest } from '@/types/api/support/config';

const { t } = useI18n();

interface Props {
  visible: boolean;
  configs: Config[];
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const configList = ref<Array<Config & { newValue: string }>>([]);

// 方法
const initConfigList = () => {
  configList.value = props.configs.map((config) => ({
    ...config,
    newValue: ''
  }));
};

// 计算属性
const hasChanges = computed(() => {
  return configList.value.some(
    (config) => config.newValue !== '' && config.newValue !== config.value
  );
});

// 监听弹窗显示状态
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      initConfigList();
    }
  }
);

// 监听配置数据变化
watch(
  () => props.configs,
  () => {
    if (props.visible) {
      initConfigList();
    }
  }
);

const handleSubmit = async () => {
  if (!hasChanges.value) {
    Message.warning('没有检测到任何更改');
    return;
  }

  try {
    const updateData: BatchUpdateRequest = {
      configs: configList.value
        .filter((config) => config.newValue !== '' && config.newValue !== config.value)
        .map((config) => ({
          id: config.id,
          value: config.newValue
        }))
    };

    if (updateData.configs.length === 0) {
      Message.warning('没有检测到任何更改');
      return;
    }

    await configApi.batchUpdateConfig(updateData);
    Message.success(`成功更新 ${updateData.configs.length} 个配置项`);
    emit('success');
  } catch (error) {
    Message.error('批量更新失败');
  }
};

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible);
};

const handleCancel = () => {
  emit('update:visible', false);
  configList.value = [];
};
</script>

<style scoped>
.batch-update-content {
  max-height: 600px;
  overflow-y: auto;
}
</style>
