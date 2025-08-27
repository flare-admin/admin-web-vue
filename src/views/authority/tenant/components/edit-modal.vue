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
        field="name"
        :label="t('authority.tenant.searchTable.columns.name')"
        :rules="[
          {
            required: true,
            message: t('authority.tenant.searchTable.form.name.placeholder')
          }
        ]"
      >
        <a-input
          v-model="form.name"
          :placeholder="t('authority.tenant.searchTable.form.name.placeholder')"
        />
      </a-form-item>
      <a-form-item
        field="code"
        :label="t('authority.tenant.searchTable.columns.code')"
        :rules="[
          {
            required: true,
            message: t('authority.tenant.searchTable.form.code.placeholder')
          }
        ]"
      >
        <a-input
          v-model="form.code"
          :placeholder="t('authority.tenant.searchTable.form.code.placeholder')"
        />
      </a-form-item>
      <a-form-item
        field="description"
        :label="t('authority.tenant.searchTable.columns.description')"
      >
        <a-textarea
          v-model="form.description"
          :placeholder="t('authority.tenant.searchTable.form.description.placeholder')"
        />
      </a-form-item>
      <a-form-item field="isDefault" :label="t('authority.tenant.searchTable.columns.isDefault')">
        <a-switch v-model="form.isDefault" :checked-value="1" :unchecked-value="2" />
      </a-form-item>
      <a-form-item
        field="expireTime"
        :label="t('authority.tenant.searchTable.columns.expireTime')"
        :rules="[
          {
            required: true,
            message: t('authority.common.expireTime.placeholder')
          }
        ]"
      >
        <timestamp-picker v-model="form.expireTime" />
      </a-form-item>
      <a-form-item field="status" :label="t('authority.tenant.searchTable.columns.status')">
        <a-switch v-model="form.status" :checked-value="1" :unchecked-value="2" />
      </a-form-item>
      <template v-if="!form.id">
        <a-divider>{{ t('authority.tenant.detail.admin.title') }}</a-divider>
        <a-form-item
          field="adminUser.username"
          :label="t('authority.tenant.searchTable.form.adminUser.username')"
          :rules="rules['adminUser.username']"
        >
          <a-input
            v-model="form.adminUser.username"
            :placeholder="t('authority.tenant.searchTable.form.adminUser.username.placeholder')"
          />
        </a-form-item>
        <a-form-item
          field="adminUser.password"
          :label="t('authority.tenant.searchTable.form.adminUser.password')"
          :rules="rules['adminUser.password']"
        >
          <a-input-password
            v-model="form.adminUser.password"
            :placeholder="t('authority.tenant.searchTable.form.adminUser.password.placeholder')"
          />
        </a-form-item>
        <a-form-item
          field="adminUser.email"
          :label="t('authority.tenant.searchTable.form.adminUser.email')"
          :rules="rules['adminUser.email']"
        >
          <a-input
            v-model="form.adminUser.email"
            :placeholder="t('authority.tenant.searchTable.form.adminUser.email.placeholder')"
          />
        </a-form-item>
        <a-form-item
          field="adminUser.phone"
          :label="t('authority.tenant.searchTable.form.adminUser.phone')"
          :rules="rules['adminUser.phone']"
        >
          <a-input
            v-model="form.adminUser.phone"
            :placeholder="t('authority.tenant.searchTable.form.adminUser.phone.placeholder')"
          />
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import type { TenantModel } from '@/types/api/authority';
import { tenantApi } from '@/api/framework/authority';
import TimestampPicker from '@/components/timestamp-picker/index.vue';

const props = defineProps<{
  visible: boolean;
  data: TenantModel;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const formRef = ref();
const form = reactive<TenantModel>({ ...props.data });

const title = computed(() =>
  form.id ? t('authority.tenant.modal.title.edit') : t('authority.tenant.modal.title.create')
);

const rules = {
  name: [
    {
      required: true,
      message: t('authority.tenant.searchTable.form.name.placeholder')
    }
  ],
  code: [
    {
      required: true,
      message: t('authority.tenant.searchTable.form.code.placeholder')
    }
  ],
  expireTime: [{ required: true, message: t('authority.common.expireTime.placeholder') }],
  'adminUser.username': [
    {
      required: true,
      message: t('authority.tenant.searchTable.form.adminUser.username.placeholder')
    }
  ],
  'adminUser.password': [
    {
      required: true,
      message: t('authority.tenant.searchTable.form.adminUser.password.placeholder')
    }
  ],
  'adminUser.email': [
    {
      required: true,
      message: t('authority.tenant.searchTable.form.adminUser.email.placeholder')
    }
  ],
  'adminUser.phone': [
    {
      required: true,
      message: t('authority.tenant.searchTable.form.adminUser.phone.placeholder')
    }
  ]
};

watch(
  () => props.data,
  (val) => {
    Object.assign(form, val);
  },
  { deep: true }
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
        await tenantApi.update(submitData);
      } else {
        await tenantApi.create(submitData);
      }
      emit('update:visible', false);
      Message.success(t('common.success.operation'));
      emit('success', true);
    } catch (err) {
      Message.error(t('authority.common.operation.failed'));
    }
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};
</script>
