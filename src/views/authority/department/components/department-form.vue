<template>
  <a-modal
    :visible="visible"
    :title="title"
    @cancel="handleCancel"
    @ok="handleOk"
    @update:visible="(val) => $emit('update:visible', val)"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="right"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <a-form-item field="parentId" :label="t('department.form.label.parentId')">
        <a-tree-select
          v-model="form.parentId"
          :data="departmentTree"
          :field-names="{
            key: 'id',
            title: 'name',
            children: 'children'
          }"
          :placeholder="t('department.form.placeholder.parentId')"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="name"
        :label="t('department.form.label.name')"
        :rules="[{ required: true, message: t('department.form.placeholder.name') }]"
      >
        <a-input
          v-model="form.name"
          :placeholder="t('department.form.placeholder.name')"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        field="code"
        :label="t('department.form.label.code')"
        :rules="[{ required: true, message: t('department.form.placeholder.code') }]"
      >
        <a-input
          v-model="form.code"
          :placeholder="t('department.form.placeholder.code')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="sort" :label="t('department.form.label.sort')">
        <a-input-number
          v-model="form.sort"
          :placeholder="t('department.form.placeholder.sort')"
          :min="0"
          :max="999"
        />
      </a-form-item>

      <a-form-item field="leader" :label="t('department.form.label.leader')">
        <a-input
          v-model="form.leader"
          :placeholder="t('department.form.placeholder.leader')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="phone" :label="t('department.form.label.phone')">
        <a-input
          v-model="form.phone"
          :placeholder="t('department.form.placeholder.phone')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="email" :label="t('department.form.label.email')">
        <a-input
          v-model="form.email"
          :placeholder="t('department.form.placeholder.email')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="status" :label="t('department.form.label.status')">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">{{ t('authority.status.enabled') }}</a-radio>
          <a-radio :value="0">{{ t('authority.status.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item field="description" :label="t('department.form.label.description')">
        <a-textarea
          v-model="form.description"
          :placeholder="t('department.form.placeholder.description')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="adminId" :label="t('department.form.label.adminId')">
        <a-select
          v-model="form.adminId"
          :loading="loadingUsers"
          :placeholder="t('department.form.placeholder.adminId')"
          allow-clear
          @change="handleAdminChange"
        >
          <a-option
            v-for="user in departmentUsers"
            :key="user.id"
            :value="user.id"
            :label="user.name || user.username"
          />
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import type { FormInstance } from '@arco-design/web-vue';
import type { DepartmentDto } from '@/types/api/department';
import type { UserModel } from '@/types/api/authority';
import { departmentApi } from '@/api/framework/department';

const { t } = useI18n();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref<FormInstance>();
const departmentTree = ref<DepartmentDto[]>([]);
const loadingUsers = ref(false);
const departmentUsers = ref<UserModel[]>([]);

// 表单数据
const form = reactive<Partial<DepartmentDto>>({
  parentId: '',
  name: '',
  code: '',
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
  description: ''
});

// 加载部门树
const loadDepartmentTree = async () => {
  try {
    departmentTree.value = await departmentApi.getDepartmentTree();
  } catch (err) {
    // handle error
  }
};

// 表单验证规则
const rules = {
  name: [{ required: true, message: t('department.form.placeholder.name') }],
  code: [{ required: true, message: t('department.form.placeholder.code') }]
};

// 处理取消
const handleCancel = () => {
  emit('update:visible', false);
};

// 处理确认
const handleOk = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    emit('submit', { ...form });

    // 如果设置了管理员，调用设置管理员接口
    if (form.id && form.adminId) {
      try {
        await departmentApi.setAdmin({
          deptId: form.id,
          adminId: form.adminId
        });
        Message.success(t('department.admin.set.success'));
      } catch (err) {
        Message.error(t('department.admin.set.failed'));
      }
    }
  } catch (err) {
    // 验证失败
  }
};

// 加载部门用户
const loadDepartmentUsers = async (deptId: string) => {
  if (!deptId) return;
  loadingUsers.value = true;
  try {
    const users = await departmentApi.getDepartmentUsers(deptId);
    departmentUsers.value = users;
  } catch (err) {
    Message.error(t('department.users.load.failed'));
  } finally {
    loadingUsers.value = false;
  }
};

// 监听表单数据变化
watch(
  () => props.formData,
  (val) => {
    Object.assign(form, val);
    if (val.id) {
      loadDepartmentUsers(val.id);
    }
  },
  { deep: true, immediate: true }
);

// 处理管理员变更
const handleAdminChange = async (value: string) => {
  if (!value) return;
  const admin = departmentUsers.value.find((user) => user.id === value);
  if (admin) {
    form.leader = admin.name || admin.username;
    form.phone = admin.phone || '';
    form.email = admin.email || '';
  }
};

// 初始化加载部门树
loadDepartmentTree();
</script>
