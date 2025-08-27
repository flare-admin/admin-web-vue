<template>
  <a-modal
    :visible="visible"
    :title="t('authority.tenant.modal.title.detail')"
    :width="600"
    @cancel="handleCancel"
  >
    <a-form :model="data" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" disabled>
      <!-- 租户信息 -->
      <a-divider>{{ t('authority.tenant.detail.tenant.title') }}</a-divider>
      <a-form-item :label="t('authority.tenant.searchTable.columns.name')">
        {{ data.name }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.columns.code')">
        {{ data.code }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.columns.description')">
        {{ data.description }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.columns.expireTime')">
        {{ proxy?.$filters.formatTimestamp(data.expireTime) }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.columns.isDefault')">
        {{ data.isDefault === 1 ? t('common.yes') : t('common.no') }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.columns.status')">
        {{ data.status === 1 ? t('authority.status.enabled') : t('authority.status.disabled') }}
      </a-form-item>

      <!-- 管理员信息 -->
      <a-divider>{{ t('authority.tenant.detail.admin.title') }}</a-divider>
      <a-form-item :label="t('authority.tenant.searchTable.columns.adminUsername')">
        {{ data?.adminUser?.username }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.form.adminUser.email')">
        {{ data?.adminUser?.email }}
      </a-form-item>
      <a-form-item :label="t('authority.tenant.searchTable.form.adminUser.phone')">
        {{ data?.adminUser?.phone }}
      </a-form-item>
      <a-form-item :label="t('common.table.columns.createdAt')">
        {{ proxy?.$filters.formatTimestamp(data.createdAt) }}
      </a-form-item>
      <a-form-item :label="t('common.table.columns.updatedAt')">
        {{ proxy?.$filters.formatTimestamp(data.updatedAt) }}
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TenantModel } from '@/types/api/authority';

defineProps<{
  visible: boolean;
  data: TenantModel;
}>();

const emit = defineEmits(['update:visible']);

const { t } = useI18n();
const instance = getCurrentInstance();
const proxy = instance?.proxy;

const handleCancel = () => {
  emit('update:visible', false);
};
</script>
