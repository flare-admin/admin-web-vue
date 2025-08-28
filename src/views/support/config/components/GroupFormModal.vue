<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? '编辑分组' : '新增分组'"
    :width="500"
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
      <a-form-item field="name" label="分组名称" required>
        <a-input v-model="formData.name" placeholder="请输入分组名称" />
      </a-form-item>

      <a-form-item field="code" label="分组编码" required>
        <a-input v-model="formData.code" placeholder="请输入分组编码" :disabled="isEdit" />
      </a-form-item>

      <a-form-item field="description" label="分组描述">
        <a-textarea v-model="formData.description" placeholder="请输入分组描述" :rows="3" />
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
import type {
  ConfigGroup,
  CreateGroupRequest,
  UpdateGroupRequest
} from '@/types/api/support/config';

interface Props {
  visible: boolean;
  group: ConfigGroup | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref<FormInstance>();
const formData = reactive<CreateGroupRequest>({
  name: '',
  code: '',
  description: '',
  sort: 0
});

// 计算属性
const isEdit = computed(() => !!props.group);

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入分组名称' }],
  code: [
    { required: true, message: '请输入分组编码' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '分组编码只能包含字母、数字和下划线，且必须以字母开头'
    }
  ]
};

// 方法
const initFormData = () => {
  if (props.group) {
    // 编辑模式
    Object.assign(formData, {
      name: props.group.name,
      code: props.group.code,
      description: props.group.description,
      sort: props.group.sort
    });
  } else {
    // 新增模式
    Object.assign(formData, {
      name: '',
      code: '',
      description: '',
      sort: 0
    });
  }
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

// 监听分组数据变化
watch(
  () => props.group,
  (group) => {
    if (group) {
      initFormData();
    }
  }
);

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (isEdit.value && props.group) {
      // 编辑分组
      const updateData: UpdateGroupRequest = {
        id: props.group.id,
        ...formData
      };
      await configApi.updateGroup(updateData);
      Message.success('更新分组成功');
    } else {
      // 新增分组
      await configApi.createGroup(formData);
      Message.success('创建分组成功');
    }

    emit('success');
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      Message.error(error.message as string);
    } else {
      Message.error('操作失败');
    }
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
