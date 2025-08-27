<template>
  <a-modal :visible="visible" :title="title" :width="800" @ok="handleOk" @cancel="handleCancel">
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="right"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <!-- 基本信息 -->
      <a-divider>{{ t('authority.permission.form.basic') }}</a-divider>
      <a-row :gutter="16">
        <!-- 左列 -->
        <a-col :span="12">
          <a-form-item
            field="name"
            :label="t('authority.permission.searchTable.columns.name')"
            :rules="[{ required: true }]"
          >
            <a-input
              v-model="form.name"
              :placeholder="t('authority.permission.searchTable.form.name.placeholder')"
            />
          </a-form-item>
          <a-form-item
            field="code"
            :label="t('authority.permission.searchTable.columns.code')"
            :rules="[{ required: true }]"
          >
            <a-input
              v-model="form.code"
              :placeholder="t('authority.permission.searchTable.form.code.placeholder')"
            />
          </a-form-item>
          <a-form-item
            field="type"
            :label="t('authority.permission.searchTable.columns.type')"
            :rules="[{ required: true }]"
          >
            <a-select v-model="form.type">
              <a-option :value="1">{{ t('authority.permission.type.menu') }}</a-option>
              <a-option :value="2">{{ t('authority.permission.type.button') }}</a-option>
              <a-option :value="3">{{ t('authority.permission.type.api') }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="icon" :label="t('authority.permission.searchTable.columns.icon')">
            <a-input
              v-model="form.icon"
              :placeholder="t('authority.permission.searchTable.form.icon.placeholder')"
            />
          </a-form-item>
          <a-form-item field="path" :label="t('authority.permission.searchTable.columns.path')">
            <a-input
              v-model="form.path"
              :placeholder="t('authority.permission.searchTable.form.path.placeholder')"
            />
          </a-form-item>
        </a-col>
        <!-- 右列 -->
        <a-col :span="12">
          <a-form-item
            field="parentId"
            :label="t('authority.permission.searchTable.columns.parentId')"
          >
            <permission-tree-select
              v-model="form.parentId"
              :placeholder="t('authority.permission.searchTable.form.parentId.placeholder')"
              :check-strictly="true"
            />
          </a-form-item>
          <a-form-item
            field="sequence"
            :label="t('authority.permission.searchTable.columns.sequence')"
          >
            <a-input-number
              v-model="form.sequence"
              :placeholder="t('authority.permission.searchTable.form.sequence.placeholder')"
            />
          </a-form-item>
          <a-form-item field="status" :label="t('authority.permission.searchTable.columns.status')">
            <a-switch v-model="form.status" :checked-value="1" :unchecked-value="2" />
          </a-form-item>
          <a-form-item
            field="localize"
            :label="t('authority.permission.searchTable.columns.localize')"
          >
            <a-input
              v-model="form.localize"
              :placeholder="t('authority.permission.searchTable.form.localize.placeholder')"
            />
          </a-form-item>
          <a-form-item
            field="component"
            :label="t('authority.permission.searchTable.columns.component')"
          >
            <a-input
              v-model="form.component"
              :placeholder="t('authority.permission.searchTable.form.component.placeholder')"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="12">
          <!-- 描述信息 -->
          <a-form-item
            field="description"
            :label="t('authority.permission.searchTable.columns.description')"
          >
            <a-textarea
              v-model="form.description"
              :placeholder="t('authority.permission.searchTable.form.description.placeholder')"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 资源列表 -->
    <a-divider>{{ t('authority.permission.form.resources') }}</a-divider>
    <div class="resource-wrapper">
      <resource-list v-model="form.resources" />
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import type { PermissionModel } from '@/types/api/framework/authority';
import { permissionsApi } from '@/api/framework/authority';
import PermissionTreeSelect from '@/components/permission-tree-select/index.vue';
import ResourceList from './resource-list.vue';

const props = defineProps<{
  visible: boolean;
  data: PermissionModel;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const formRef = ref();
const form = reactive<PermissionModel>({
  ...props.data,
  createdAt: 0,
  updatedAt: 0
});

const title = computed(() =>
  form.id
    ? t('authority.permission.modal.title.edit')
    : t('authority.permission.modal.title.create')
);

const rules = {
  name: [
    {
      required: true,
      message: t('authority.permission.searchTable.form.name.placeholder')
    }
  ],
  code: [
    {
      required: true,
      message: t('authority.permission.searchTable.form.code.placeholder')
    }
  ],
  type: [
    {
      required: true,
      message: t('authority.permission.modal.type.placeholder')
    }
  ]
};

const handleOk = async () => {
  const result = await formRef.value?.validate();
  if (!result) {
    try {
      const submitData = {
        ...form,
        status: form.status ? 1 : 0
      };
      if (form.id) {
        await permissionsApi.update(submitData);
      } else {
        await permissionsApi.create(submitData);
      }
      emit('update:visible', false);
      Message.success(t('common.success.operation'));
      emit('success', !form.id);
    } catch (err) {
      Message.error(t('authority.common.operation.failed'));
    }
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};
/**
 * 获取数据
 * @param id
 */
const loadData = async (id?: number) => {
  console.log(id);
  if (id && id !== 0 && props.visible) {
    const md = await permissionsApi.getById(id);
    Object.assign(form, md);
  } else {
    console.log('设为默认');
    Object.assign(form, props.data);
  }
};
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadData(props.data.id);
    }
  },
  { deep: true }
);
</script>

<style scoped lang="less">
.resource-wrapper {
  padding-left: 24px; // 向左对齐，与表单项对齐
}
</style>
