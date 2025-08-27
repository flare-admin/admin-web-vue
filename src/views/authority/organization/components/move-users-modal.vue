<template>
  <a-modal
    :visible="visible"
    :title="t('organization.users.move.title')"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="right"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <a-form-item
        field="targetDeptId"
        :label="t('organization.users.move.targetDept')"
        :rules="[{ required: true, message: t('organization.users.move.targetDept.required') }]"
      >
        <a-tree-select
          v-model="form.targetDeptId"
          :data="departmentTree"
          :field-names="{
            key: 'id',
            title: 'name',
            children: 'children'
          }"
          :placeholder="t('organization.users.move.targetDept.placeholder')"
        />
      </a-form-item>

      <a-form-item field="description" :label="t('organization.users.move.description')">
        <a-textarea
          v-model="form.description"
          :placeholder="t('organization.users.move.description.placeholder')"
          :max-length="200"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import type { FormInstance } from '@arco-design/web-vue';
import type { DepartmentDto } from '@/types/api/framework/department';
import { departmentApi } from '@/api/framework/department';

const props = defineProps<{
  visible: boolean;
  deptId: string;
  userIds: string[];
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const formRef = ref<FormInstance>();
const departmentTree = ref<DepartmentDto[]>([]);

const form = ref({
  targetDeptId: '',
  description: ''
});

const rules = {
  targetDeptId: [{ required: true, message: t('organization.users.move.targetDept.required') }]
};

const handleCancel = () => {
  emit('update:visible', false);
};

const handleOk = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();

    // 遍历选中的用户ID，逐个调用调动接口
    const promises = props.userIds.map((userId) =>
      departmentApi.transferUser({
        userId,
        fromDeptId: props.deptId,
        toDeptId: form.value.targetDeptId,
        description: form.value.description
      })
    );

    await Promise.all(promises);

    Message.success(t('organization.users.move.success'));
    emit('success');
    emit('update:visible', false);
  } catch (err) {
    Message.error(t('organization.users.move.failed'));
  }
};

// 加载部门树
onMounted(async () => {
  try {
    departmentTree.value = await departmentApi.getDepartmentTree();
  } catch (err) {
    Message.error(t('organization.tree.load.failed'));
  }
});
</script>
