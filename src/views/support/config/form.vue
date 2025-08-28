<template>
  <div class="container">
    <Breadcrumb :items="['menu.config', 'menu.configForm']" />

    <!-- 配置分组选择 -->
    <a-card class="group-select-card" :title="t('config.form.groupSelect')">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item :label="t('config.form.selectGroup')" required>
            <a-select
              v-model="selectedGroupId"
              :placeholder="t('config.form.selectGroupPlaceholder')"
              allow-clear
              @change="handleGroupChange"
            >
              <a-option
                v-for="group in enabledGroups"
                :key="group.id"
                :value="group.id"
                :label="group.name"
              />
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('config.form.operationMode')">
            <a-radio-group v-model="operationMode" @change="handleModeChange">
              <a-radio value="view">{{ t('config.form.viewMode') }}</a-radio>
              <a-radio value="edit">{{ t('config.form.editMode') }}</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-space>
            <a-button
              v-if="operationMode === 'edit' && hasChanges"
              type="primary"
              :loading="saving"
              @click="handleSave"
            >
              <template #icon>
                <icon-save />
              </template>
              {{ t('config.form.save') }}
            </a-button>
            <a-button v-if="operationMode === 'edit' && hasChanges" @click="handleReset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('config.form.reset') }}
            </a-button>
            <a-button v-if="operationMode === 'edit'" @click="handleEnterHostedMode">
              <template #icon>
                <icon-edit />
              </template>
              {{ t('config.form.enterHostedMode') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 配置表单 -->
    <a-card
      v-if="selectedGroupId && configList.length > 0"
      class="config-form-card"
      :title="t('config.form.configForm')"
    >
      <template #extra>
        <a-space>
          <a-tag v-if="operationMode === 'view'" color="blue">
            {{ t('config.form.readOnly') }}
          </a-tag>
          <a-tag v-else-if="operationMode === 'edit'" color="green">
            {{ t('config.form.editable') }}
          </a-tag>
          <a-tag v-if="hasChanges" color="orange">
            {{ t('config.form.hasChanges') }}
          </a-tag>
        </a-space>
      </template>

      <a-form
        :model="formData"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
        label-align="right"
      >
        <a-row :gutter="16">
          <a-col
            v-for="config in configList"
            :key="config.id"
            :span="12"
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
                v-model="formData[config.key]"
                :placeholder="config.placeholder || config.value"
                :disabled="operationMode === 'view'"
                allow-clear
              />

              <!-- 数字类型 -->
              <a-input-number
                v-else-if="config.type === 'number'"
                v-model="formData[config.key]"
                :placeholder="config.placeholder || config.value"
                :disabled="operationMode === 'view'"
                :min="config.min"
                :max="config.max"
                :step="config.step"
                style="width: 100%"
              />

              <!-- 布尔类型 -->
              <a-switch
                v-else-if="config.type === 'boolean'"
                v-model="formData[config.key]"
                :disabled="operationMode === 'view'"
                :checked-value="true"
                :unchecked-value="false"
              />

              <!-- 选择类型 -->
              <a-select
                v-else-if="config.type === 'select'"
                v-model="formData[config.key]"
                :placeholder="config.placeholder || config.value"
                :disabled="operationMode === 'view'"
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
                v-model="formData[config.key]"
                :placeholder="config.placeholder || config.value"
                :disabled="operationMode === 'view'"
                :rows="3"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 空状态 -->
    <a-card v-else-if="selectedGroupId" class="empty-card" :title="t('config.form.configForm')">
      <a-empty :description="t('config.form.noConfigs')" />
    </a-card>

    <!-- 托管模式弹窗 -->
    <HostedModeModal
      v-model:visible="hostedModeVisible"
      :configs="configList"
      :form-data="formData"
      @success="handleHostedModeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/breadcrumb/index.vue';
import configApi from '@/api/support/config';
import type { Config, ConfigGroup, ConfigFormData } from '@/types/api/support/config';
import HostedModeModal from './components/HostedModeModal.vue';

const { t } = useI18n();

// 响应式数据
const selectedGroupId = ref<string>('');
const operationMode = ref<'view' | 'edit'>('view');
const configList = ref<Config[]>([]);
const groupList = ref<ConfigGroup[]>([]);
const formData = reactive<ConfigFormData>({});
const originalFormData = reactive<ConfigFormData>({});
const saving = ref(false);
const hostedModeVisible = ref(false);

// 计算属性
const enabledGroups = computed(() => {
  return groupList.value.filter((group) => group.status === 1);
});

const hasChanges = computed(() => {
  return Object.keys(formData).some((key) => {
    const original = originalFormData[key];
    const current = formData[key];
    return original !== current;
  });
});

// 方法
const loadGroups = async () => {
  try {
    const response = await configApi.getGroupList({
      pageNum: 1,
      pageSize: 1000
    });
    groupList.value = response.list;
  } catch (error) {
    Message.error('加载分组列表失败');
  }
};

const initFormData = () => {
  const newFormData: ConfigFormData = {};
  const newOriginalData: ConfigFormData = {};

  configList.value.forEach((config) => {
    // 尝试解析配置值
    let parsedValue: string | number | boolean = config.value;

    // 尝试解析为数字
    if (!Number.isNaN(Number(config.value)) && config.value !== '') {
      parsedValue = Number(config.value);
    }
    // 尝试解析为布尔值
    else if (config.value === 'true' || config.value === 'false') {
      parsedValue = config.value === 'true';
    }

    newFormData[config.key] = parsedValue;
    newOriginalData[config.key] = parsedValue;
  });

  Object.assign(formData, newFormData);
  Object.assign(originalFormData, newOriginalData);
};

const loadConfigs = async (groupId: string) => {
  try {
    const configs = await configApi.getConfigsByGroupId(groupId);
    configList.value = configs.filter((config) => config.status === 1);
    initFormData();
  } catch (error) {
    Message.error('加载配置列表失败');
  }
};

const handleReset = () => {
  Modal.confirm({
    title: '确认重置',
    content: '确定要重置所有更改吗？',
    onOk: () => {
      Object.keys(originalFormData).forEach((key) => {
        formData[key] = originalFormData[key];
      });
      Message.success('重置成功');
    }
  });
};

const handleGroupChange = (groupId: string) => {
  if (groupId) {
    loadConfigs(groupId);
  } else {
    configList.value = [];
    Object.keys(formData).forEach((key) => {
      delete formData[key];
      delete originalFormData[key];
    });
  }
};

const handleModeChange = (mode: 'view' | 'edit') => {
  if (mode === 'view' && hasChanges.value) {
    Modal.confirm({
      title: '确认切换模式',
      content: '当前有未保存的更改，切换到查看模式将丢失更改，是否继续？',
      onOk: () => {
        operationMode.value = mode;
        handleReset();
      }
    });
  } else {
    operationMode.value = mode;
  }
};

const handleSave = async () => {
  if (!hasChanges.value) {
    Message.warning('没有检测到任何更改');
    return;
  }

  saving.value = true;
  try {
    const updateData = {
      configs: Object.keys(formData)
        .filter((key) => formData[key] !== originalFormData[key])
        .map((key) => ({
          id: configList.value.find((config) => config.key === key)?.id || '',
          value: String(formData[key])
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
    Object.keys(formData).forEach((key) => {
      originalFormData[key] = formData[key];
    });
  } catch (error) {
    Message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const handleEnterHostedMode = () => {
  hostedModeVisible.value = true;
};

const handleHostedModeSuccess = () => {
  hostedModeVisible.value = false;
  loadConfigs(selectedGroupId.value);
  Message.success('托管模式操作成功');
};

// 生命周期
onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.group-select-card {
  margin-bottom: 20px;
}

.config-form-card {
  margin-bottom: 20px;
}

.empty-card {
  margin-bottom: 20px;
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
</style>
