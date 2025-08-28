<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? '编辑配置' : '新增配置'"
    :width="600"
    @ok="handleSubmit"
    @cancel="handleCancel"
    @update:visible="handleVisibleChange"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
      label-align="right"
    >
      <a-form-item field="groupId" label="配置分组" required>
        <a-select v-model="formData.groupId" placeholder="请选择配置分组" allow-clear>
          <a-option v-for="group in groups" :key="group.id" :value="group.id" :label="group.name" />
        </a-select>
      </a-form-item>

      <a-form-item field="key" label="配置键" required>
        <a-input v-model="formData.key" placeholder="请输入配置键" :disabled="isEdit" />
      </a-form-item>

      <a-form-item field="name" label="配置名称" required>
        <a-input v-model="formData.name" placeholder="请输入配置名称" />
      </a-form-item>

      <a-form-item field="type" label="数据类型" required>
        <DataTypeSelector
          v-model="formData.type"
          placeholder="请选择数据类型"
          @on-change="handleDataTypeChange"
        />
      </a-form-item>

      <a-form-item field="value" label="配置值" required>
        <DynamicInput
          v-model="formData.value"
          :data-type="formData.type"
          :placeholder="getValuePlaceholder()"
          @on-change="handleValueChange"
        />
      </a-form-item>

      <!-- 配置属性 -->
      <a-form-item field="attributes" label="配置属性">
        <a-textarea
          v-model="formData.attributes"
          placeholder="请输入配置属性（JSON格式）"
          :rows="3"
          allow-clear
        />
        <div class="form-tip">
          <a-typography-text type="secondary" size="small">
            配置属性用于存储输入框的配置信息，如最小值、最大值、步长、精度等，JSON格式
          </a-typography-text>
        </div>
      </a-form-item>

      <!-- 选项配置（当类型支持选项时显示） -->
      <template v-if="['json', 'array', 'object'].includes(formData.type)">
        <a-form-item field="options" label="选项配置">
          <div class="options-list">
            <div v-for="(option, index) in formData.options" :key="index" class="option-item">
              <a-input v-model="option.label" placeholder="选项标签" style="width: 45%" />
              <a-input v-model="option.value" placeholder="选项值" style="width: 45%" />
              <a-button type="text" status="danger" size="small" @click="removeOption(index)">
                删除
              </a-button>
            </div>
            <a-button type="dashed" size="small" @click="addOption"> 添加选项 </a-button>
          </div>
          <div class="form-tip">
            <a-typography-text type="secondary" size="small">
              选项配置用于JSON、数组、对象等类型的选项值设置
            </a-typography-text>
          </div>
        </a-form-item>
      </template>

      <a-form-item field="description" label="配置描述">
        <a-textarea v-model="formData.description" placeholder="请输入配置描述" :rows="2" />
      </a-form-item>

      <a-form-item field="sort" label="排序">
        <a-input-number
          v-model="formData.sort"
          placeholder="请输入排序值"
          :min="0"
          :max="9999"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import type { FormInstance } from '@arco-design/web-vue';
import configApi from '@/api/support/config';
import { DataTypeSelector, DynamicInput } from '@/components/selector';
import type {
  Config,
  ConfigGroup,
  CreateConfigRequest,
  UpdateConfigRequest
} from '@/types/api/support/config';

interface Props {
  visible: boolean;
  config: Config | null;
  groups: ConfigGroup[];
  defaultGroupId?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref<FormInstance>();
const formData = reactive<
  CreateConfigRequest & {
    type: string;
    attributes?: string;
    options?: Array<{ label: string; value: string }>;
  }
>({
  groupId: '',
  key: '',
  value: '',
  name: '',
  description: '',
  sort: 0,
  type: 'string',
  attributes: '',
  options: []
});

// 计算属性
const isEdit = computed(() => !!props.config);

// 表单验证规则
const rules = {
  groupId: [{ required: true, message: '请选择配置分组' }],
  key: [
    { required: true, message: '请输入配置键' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '配置键只能包含字母、数字和下划线，且必须以字母开头'
    }
  ],
  name: [{ required: true, message: '请输入配置名称' }],
  value: [{ required: true, message: '请输入配置值' }]
};

// 方法
const initFormData = () => {
  if (props.config) {
    // 编辑模式
    Object.assign(formData, {
      groupId: props.config.groupId,
      key: props.config.key,
      value: props.config.value,
      name: props.config.name,
      description: props.config.description,
      sort: props.config.sort,
      type: props.config.type || 'string',
      attributes: props.config.attributes || '',
      options: props.config.options || []
    });
  } else {
    // 新增模式
    Object.assign(formData, {
      groupId: props.defaultGroupId || '',
      key: '',
      value: '',
      name: '',
      description: '',
      sort: 0,
      type: 'string',
      attributes: '',
      options: []
    });
  }
};

// 数据类型变化处理
const handleDataTypeChange = (dataType: string) => {
  // 根据数据类型设置默认值
  switch (dataType) {
    case 'int':
    case 'float':
      formData.value = 0;
      // 设置默认的配置属性
      formData.attributes = JSON.stringify(
        {
          min: 0,
          max: 100,
          step: 1,
          precision: dataType === 'int' ? 0 : 2
        },
        null,
        2
      );
      break;
    case 'bool':
      formData.value = false;
      break;
    case 'json':
    case 'array':
    case 'object':
      formData.value = '{}';
      if (formData.options?.length === 0) {
        formData.options = [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' }
        ];
      }
      break;
    case 'time':
    case 'date':
    case 'datetime':
    case 'regex':
    default:
      formData.value = '';
      break;
  }
};

// 根据数据类型获取值的占位符
const getValuePlaceholder = () => {
  switch (formData.type) {
    case 'string':
      return '请输入字符串';
    case 'int':
      return '请输入整数';
    case 'float':
      return '请输入浮点数';
    case 'bool':
      return '请选择是/否';
    case 'json':
      return '请输入JSON格式数据';
    case 'array':
      return '请输入数组格式数据';
    case 'object':
      return '请输入对象格式数据';
    case 'time':
      return '请选择时间';
    case 'date':
      return '请选择日期';
    case 'datetime':
      return '请选择日期时间';
    case 'regex':
      return '请输入正则表达式';
    default:
      return '请输入值';
  }
};

// 添加选项
const addOption = () => {
  if (!formData.options) {
    formData.options = [];
  }
  formData.options.push({
    label: `选项${formData.options.length + 1}`,
    value: `option${formData.options.length + 1}`
  });
};

// 删除选项
const removeOption = (index: number) => {
  if (formData.options) {
    formData.options.splice(index, 1);
  }
};

// 值变化处理
const handleValueChange = (value: any) => {
  formData.value = value;
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      initFormData();
    }
  }
);

// 监听配置数据变化
watch(
  () => props.config,
  (config) => {
    if (config) {
      initFormData();
    }
  }
);

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    // 构建保存数据，将配置属性统一处理
    const saveData = {
      groupId: formData.groupId,
      key: formData.key,
      value: formData.value,
      name: formData.name,
      description: formData.description,
      sort: formData.sort,
      type: formData.type,
      attributes: formData.attributes || '',
      options: formData.options || []
    };

    if (isEdit.value && props.config) {
      // 编辑配置
      const updateData: UpdateConfigRequest = {
        id: props.config.id,
        ...saveData
      };
      await configApi.updateConfig(updateData);
      Message.success('更新配置成功');
      emit('success');
    } else {
      // 新增配置
      await configApi.createConfig(saveData);
      Message.success('创建配置成功');
      emit('success');
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      Message.error(error.message as string);
    } else {
      Message.error('操作失败');
    }
    // 提交失败时不关闭表单
  }
};

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible);
};

const handleCancel = () => {
  emit('update:visible', false);
  formRef.value?.resetFields();
};
</script>

<style scoped>
.options-list {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-item .arco-input {
  flex: 1;
}

.form-tip {
  margin-top: 4px;
}
</style>
