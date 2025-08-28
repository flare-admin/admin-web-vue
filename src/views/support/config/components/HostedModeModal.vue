<template>
  <a-modal
    :visible="visible"
    title="托管模式 - 高级配置编辑"
    :width="1000"
    :footer="false"
    @cancel="handleCancel"
    @update:visible="handleVisibleChange"
  >
    <div class="hosted-mode-content">
      <a-alert
        type="warning"
        :content="'托管模式：在此模式下，您可以进行高级配置编辑，所有更改将在保存后生效。请注意备份重要配置。'"
        style="margin-bottom: 16px"
      />

      <!-- 配置分组 -->
      <a-tabs v-model:active-key="activeTab" type="card">
        <a-tab-pane v-for="group in configGroups" :key="group.key" :title="group.name">
          <div class="config-group-content">
            <div class="group-header">
              <h4>{{ group.name }}</h4>
              <p class="group-description">{{ group.description }}</p>
            </div>

            <a-form
              :model="group.formData"
              :label-col-props="{ span: 8 }"
              :wrapper-col-props="{ span: 16 }"
              label-align="right"
            >
              <a-row :gutter="16">
                <a-col
                  v-for="config in group.configs"
                  :key="config.id"
                  :span="24"
                  style="margin-bottom: 16px"
                >
                  <a-form-item :field="config.key" :label="config.name" :required="config.required">
                    <template #help>
                      <div class="config-help">
                        <span class="config-description">{{ config.description }}</span>
                        <span class="config-key">({{ config.key }})</span>
                      </div>
                    </template>

                    <!-- 字符串类型 -->
                    <a-input
                      v-if="config.type === 'string'"
                      v-model="group.formData[config.key]"
                      :placeholder="config.placeholder || config.value"
                      allow-clear
                    />

                    <!-- 数字类型 -->
                    <a-input-number
                      v-else-if="config.type === 'number'"
                      v-model="group.formData[config.key]"
                      :placeholder="config.placeholder || config.value"
                      :min="config.min"
                      :max="config.max"
                      :step="config.step"
                      style="width: 100%"
                    />

                    <!-- 布尔类型 -->
                    <a-switch
                      v-else-if="config.type === 'boolean'"
                      v-model="group.formData[config.key]"
                      :checked-value="true"
                      :unchecked-value="false"
                    />

                    <!-- 选择类型 -->
                    <a-select
                      v-else-if="config.type === 'select'"
                      v-model="group.formData[config.key]"
                      :placeholder="config.placeholder || config.value"
                      allow-clear
                    >
                      <a-option
                        v-for="option in config.options"
                        :key="option.value"
                        :value="option.value"
                        :label="option.label"
                      />
                    </a-select>

                    <!-- 默认文本类型 -->
                    <a-textarea
                      v-else
                      v-model="group.formData[config.key]"
                      :placeholder="config.placeholder || config.value"
                      :rows="3"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>

      <!-- 操作按钮 -->
      <div class="hosted-mode-actions">
        <a-space>
          <a-button @click="handleCancel">
            {{ t('config.hosted.cancel') }}
          </a-button>
          <a-button @click="handleReset">
            {{ t('config.hosted.reset') }}
          </a-button>
          <a-button type="primary" :loading="saving" @click="handleSave">
            {{ t('config.hosted.save') }}
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import configApi from '@/api/support/config';
import type { Config, ConfigFormData } from '@/types/api/support/config';

const { t } = useI18n();

interface Props {
  visible: boolean;
  configs: Config[];
  formData: ConfigFormData;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
  (e: 'reset', data: ConfigFormData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const activeTab = ref<string>('');
const saving = ref(false);
const originalFormData = reactive<ConfigFormData>({});

// 计算属性
const configGroups = computed(() => {
  const groups: Array<{
    key: string;
    name: string;
    description: string;
    configs: Config[];
    formData: ConfigFormData;
  }> = [];

  // 按分组组织配置
  const groupMap = new Map<string, Config[]>();
  props.configs.forEach((config) => {
    if (!groupMap.has(config.groupId)) {
      groupMap.set(config.groupId, []);
    }
    groupMap.get(config.groupId)!.push(config);
  });

  // 转换为数组格式
  groupMap.forEach((configs, groupId) => {
    const group = {
      key: groupId,
      name: configs[0]?.groupId || groupId,
      description: `配置分组：${groupId}`,
      configs: configs.sort((a, b) => a.sort - b.sort),
      formData: {} as ConfigFormData
    };

    // 初始化表单数据
    configs.forEach((config) => {
      group.formData[config.key] = props.formData[config.key] || config.value;
    });

    groups.push(group);
  });

  return groups;
});

// 设置默认激活的标签页
watch(
  () => props.visible,
  (visible) => {
    if (visible && configGroups.value.length > 0 && !activeTab.value) {
      activeTab.value = configGroups.value[0].key;
    }
  }
);

const hasChanges = computed(() => {
  return Object.keys(props.formData).some((key) => {
    const original = originalFormData[key];
    const current = props.formData[key];
    return original !== current;
  });
});

// 方法
const initOriginalData = () => {
  Object.keys(props.formData).forEach((key) => {
    originalFormData[key] = props.formData[key];
  });
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      initOriginalData();
    }
  }
);

// 监听配置数据变化
watch(
  () => props.configs,
  () => {
    if (props.visible) {
      initOriginalData();
    }
  }
);

const handleSave = async () => {
  if (!hasChanges.value) {
    Message.warning('没有检测到任何更改');
    return;
  }

  saving.value = true;
  try {
    const updateData = {
      configs: Object.keys(props.formData)
        .filter((key) => props.formData[key] !== originalFormData[key])
        .map((key) => ({
          id: props.configs.find((config) => config.key === key)?.id || '',
          value: String(props.formData[key])
        }))
        .filter((item) => item.id)
    };

    if (updateData.configs.length === 0) {
      Message.warning('没有检测到任何更改');
      return;
    }

    await configApi.batchUpdateConfig(updateData);
    Message.success('保存成功');

    // 更新原始数据
    Object.keys(props.formData).forEach((key) => {
      originalFormData[key] = props.formData[key];
    });

    emit('success');
  } catch (error) {
    Message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const handleReset = () => {
  Modal.confirm({
    title: '确认重置',
    content: '确定要重置所有更改吗？',
    onOk: () => {
      // 通过emit通知父组件更新formData
      emit('reset', originalFormData);
      Message.success('重置成功');
    }
  });
};

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible);
};

const handleCancel = () => {
  if (hasChanges.value) {
    Modal.confirm({
      title: '确认关闭',
      content: '当前有未保存的更改，确定要关闭吗？',
      onOk: () => {
        emit('update:visible', false);
      }
    });
  } else {
    emit('update:visible', false);
  }
};
</script>

<style scoped>
.hosted-mode-content {
  max-height: 600px;
  overflow-y: auto;
}

.config-group-content {
  padding: 16px 0;
}

.group-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.group-header h4 {
  margin: 0 0 8px 0;
  color: #1d2129;
}

.group-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.config-help {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.config-description {
  flex: 1;
}

.config-key {
  color: #999;
  font-family: monospace;
}

.hosted-mode-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}
</style>
