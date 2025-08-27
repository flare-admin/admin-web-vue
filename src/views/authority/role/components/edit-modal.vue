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
      <!-- 基本信息 -->
      <a-form-item field="name" :label="t('authority.role.searchTable.columns.name')">
        <a-input
          v-model="form.name"
          :placeholder="t('authority.role.searchTable.form.name.placeholder')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="code" :label="t('authority.role.searchTable.columns.code')">
        <a-input
          v-model="form.code"
          :placeholder="t('authority.role.searchTable.form.code.placeholder')"
          allow-clear
        />
      </a-form-item>

      <!-- 角色类型 -->
      <a-form-item field="type" :label="t('authority.role.form.type')">
        <a-radio-group v-model="form.type">
          <a-radio :value="1">{{ t('authority.role.type.resource') }}</a-radio>
          <a-radio :value="2">{{ t('authority.role.type.data') }}</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 数据权限范围,仅当角色类型为数据权限时显示 -->
      <template v-if="form.type === 2">
        <a-form-item
          field="dataScope"
          :label="t('authority.role.form.dataScope')"
          :rules="[{ required: true, message: t('authority.role.form.dataScope.required') }]"
        >
          <a-select
            v-model="form.dataScope"
            :options="dataScopeOptions"
            :placeholder="t('authority.role.form.dataScope.placeholder')"
          />
        </a-form-item>

        <!-- 当选择自定义部门时显示部门选择 -->
        <a-form-item
          v-if="form.dataScope === 5"
          field="deptIds"
          :label="t('authority.role.form.deptIds')"
          :rules="[{ required: true, message: t('authority.role.form.deptIds.required') }]"
        >
          <a-tree-select
            v-model="form.deptIds"
            :data="deptTree"
            :field-names="{
              key: 'id',
              title: 'name',
              children: 'children'
            }"
            multiple
            :placeholder="t('authority.role.form.deptIds.placeholder')"
          />
        </a-form-item>
      </template>

      <a-form-item field="description" :label="t('authority.role.searchTable.columns.description')">
        <a-textarea
          v-model="form.description"
          :placeholder="t('authority.role.searchTable.form.description.placeholder')"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="status" :label="t('authority.role.searchTable.columns.status')">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">{{ t('authority.status.enabled') }}</a-radio>
          <a-radio :value="0">{{ t('authority.status.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FormInstance } from '@arco-design/web-vue';
import type { RoleModel } from '@/types/api/framework/authority';
import { departmentApi } from '@/api/framework/department';
import type { DepartmentDto } from '@/types/api/framework/department';
import { Modal, Message } from '@arco-design/web-vue';
import { roleApi } from '@/api/framework/authority';

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
  data: {
    type: Object as PropType<Partial<RoleModel>>,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref<FormInstance>();
const deptTree = ref<DepartmentDto[]>([]);

// 数据权限范围选项
const dataScopeOptions = [
  { label: t('authority.role.dataScope.all'), value: 1 },
  { label: t('authority.role.dataScope.dept'), value: 2 },
  { label: t('authority.role.dataScope.deptTree'), value: 3 },
  { label: t('authority.role.dataScope.self'), value: 4 },
  { label: t('authority.role.dataScope.custom'), value: 5 }
];

// 表单数据
const form = reactive<Partial<RoleModel>>({
  name: '',
  code: '',
  type: 1,
  dataScope: 1,
  deptIds: [],
  description: '',
  status: 1
});

// 监听表单数据变化
watch(
  () => props.data,
  async (val) => {
    Object.assign(form, val);

    // 如果是编辑模式且是数据权限角色，获取数据权限配置
    if (val.id && val.type === 2) {
      try {
        const dataPermission = await roleApi.getDataPermission(val.id);
        form.dataScope = dataPermission.scope;
        form.deptIds = dataPermission.deptIds || [];
      } catch (err) {
        Message.error(t('authority.role.dataPermission.get.error'));
      }
    }
  },
  { deep: true, immediate: true }
);

// 加载部门树
const loadDeptTree = async () => {
  try {
    const data = await departmentApi.getDepartmentTree();
    console.log(data);
    deptTree.value = data;
  } catch (err) {
    // handle error
  }
};

// 表单验证规则
const rules = {
  name: [{ required: true, message: t('authority.role.searchTable.form.name.placeholder') }],
  code: [{ required: true, message: t('authority.role.searchTable.form.code.placeholder') }],
  // 当角色类型为数据权限时，dataScope必填
  dataScope: [
    {
      required: true,
      message: t('authority.role.form.dataScope.required'),
      // 仅当type为2时验证
      // eslint-disable-next-line @typescript-eslint/ban-types
      validator: (value: any, callback: Function) => {
        if (form.type === 2 && !value) {
          callback(t('authority.role.form.dataScope.required'));
        }
        callback();
      }
    }
  ]
};

// 监听角色类型变化
watch(
  () => form.type,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      Modal.confirm({
        title: t('authority.role.type.change.title'),
        content: t('authority.role.type.change.confirm'),
        onOk: () => {
          if (newVal === 1) {
            form.dataScope = undefined;
            form.deptIds = [];
          } else {
            form.dataScope = 1;
          }
        },
        onCancel: () => {
          form.type = oldVal;
        }
      });
    }
  }
);

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
  } catch (err) {
    // 验证失败
  }
};

// 初始化加载部门树
loadDeptTree();
</script>
