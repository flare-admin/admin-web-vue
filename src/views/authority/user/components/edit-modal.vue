<template>
  <a-modal :visible="visible" :title="title" @ok="handleOk" @cancel="handleCancel">
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-align="right"
      :label-col-props="{ span: 6 }"
      :wrapper-col-props="{ span: 18 }"
    >
      <a-form-item
        field="username"
        :label="t('authority.user.searchTable.columns.userName')"
        :rules="[
          {
            required: true,
            message: t('authority.user.searchTable.form.userName.placeholder')
          }
        ]"
      >
        <a-input
          v-model="form.username"
          :placeholder="t('authority.user.searchTable.form.userName.placeholder')"
        />
      </a-form-item>
      <a-form-item
        v-if="!form.id"
        field="password"
        :label="t('authority.user.searchTable.columns.password')"
        :rules="[
          {
            required: true,
            message: t('authority.user.searchTable.form.password.placeholder')
          }
        ]"
      >
        <a-input-password
          v-model="form.password"
          :placeholder="t('authority.user.searchTable.form.password.placeholder')"
        />
      </a-form-item>
      <a-form-item field="name" :label="t('authority.user.searchTable.columns.name')">
        <a-input
          v-model="form.name"
          :placeholder="t('authority.user.searchTable.form.name.placeholder')"
        />
      </a-form-item>
      <a-form-item
        field="email"
        :label="t('authority.user.searchTable.columns.email')"
        :rules="[
          {
            required: true,
            message: t('authority.user.searchTable.form.email.placeholder')
          }
        ]"
      >
        <a-input
          v-model="form.email"
          :placeholder="t('authority.user.searchTable.form.email.placeholder')"
        />
      </a-form-item>
      <a-form-item field="phone" :label="t('authority.user.searchTable.columns.phone')">
        <a-input
          v-model="form.phone"
          :placeholder="t('authority.user.searchTable.form.phone.placeholder')"
        />
      </a-form-item>
      <!--      <a-form-item-->
      <!--        field="roleIds"-->
      <!--        :label="t('authority.user.searchTable.columns.role')"-->
      <!--        :rules="[-->
      <!--          {-->
      <!--            required: true,-->
      <!--            message: t('authority.user.searchTable.form.role.placeholder'),-->
      <!--          },-->
      <!--        ]"-->
      <!--      >-->
      <!--        <a-select-->
      <!--          v-model="form.roleIds"-->
      <!--          multiple-->
      <!--          :placeholder="t('authority.user.searchTable.form.role.placeholder')"-->
      <!--        >-->
      <!--          &lt;!&ndash; <a-option v-for="role in roles" :key="role.id" :value="role.id">-->
      <!--            {{ role.name }}-->
      <!--          </a-option> &ndash;&gt;-->
      <!--        </a-select>-->
      <!--      </a-form-item>-->
      <a-form-item field="status" :label="t('authority.user.searchTable.columns.status')">
        <a-switch v-model="form.status" :checked-value="1" :unchecked-value="2" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import type { UserModel } from '@/types/api/framework/authority';
import { userApi } from '@/api/framework/authority';

const props = defineProps<{
  visible: boolean;
  data: UserModel;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const formRef = ref();
const form = reactive<UserModel>({
  ...props.data,
  createdAt: 0,
  updatedAt: 0
});
const rules = {
  username: [
    {
      required: true,
      message: t('authority.user.searchTable.form.userName.placeholder')
    }
  ],
  password: [{ required: true, message: '请输入密码' }],
  email: [
    {
      required: true,
      message: t('authority.user.searchTable.form.email.placeholder')
    }
  ],
  roleId: [
    {
      required: true,
      message: t('authority.user.searchTable.form.role.placeholder')
    }
  ]
};

const title = computed(() =>
  form.id ? t('authority.user.modal.title.edit') : t('authority.user.modal.title.create')
);

const handleOk = async () => {
  const result = await formRef.value?.validate();
  if (!result) {
    try {
      const submitData = {
        ...form,
        status: form.status ? 1 : 0
      };
      if (form.id) {
        await userApi.update(submitData);
      } else {
        await userApi.create(submitData);
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

watch(
  () => props.data,
  (val) => {
    Object.assign(form, val);
  },
  { deep: true }
);
</script>
