<template>
  <a-modal
    :visible="visible"
    :title="t('log.operation.detail.title')"
    :width="800"
    :footer="false"
    :body-style="{ maxHeight: '80vh', overflow: 'auto' }"
    @cancel="$emit('update:visible', false)"
  >
    <a-descriptions :data="detailData" :column="1" layout="vertical" bordered />
  </a-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from '@/locale/useI18n';
import { OperationLogRecord } from '@/types/api/support/log';
import { formatTimestamp } from '@/filters/date';

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  data: OperationLogRecord;
}>();

defineEmits(['update:visible']);

const detailData = computed(() => [
  {
    label: t('log.columns.username'),
    value: props.data?.username || '-'
  },
  {
    label: t('log.operation.columns.module'),
    value: props.data?.module || '-'
  },
  {
    label: t('log.operation.columns.action'),
    value: props.data?.action || '-'
  },
  {
    label: t('log.operation.columns.method'),
    value: props.data?.method || '-'
  },
  {
    label: t('log.operation.columns.path'),
    value: props.data?.path || '-'
  },
  {
    label: t('log.operation.detail.query'),
    value: props.data?.query || '-'
  },
  {
    label: t('log.operation.detail.body'),
    value: props.data?.body || '-'
  },
  {
    label: t('log.columns.ip'),
    value: props.data?.ip || '-'
  },
  {
    label: t('log.operation.detail.userAgent'),
    value: props.data?.userAgent || '-'
  },
  {
    label: t('log.columns.status'),
    value: props.data?.status === 200 ? t('log.status.success') : t('log.status.fail')
  },
  {
    label: t('log.operation.detail.error'),
    value: props.data?.error || '-'
  },
  {
    label: t('log.operation.columns.duration'),
    value: props.data?.duration ? `${props.data.duration}ms` : '-'
  },
  {
    label: t('log.operation.columns.createdAt'),
    value: props.data?.createdAt ? formatTimestamp(props.data.createdAt) : '-'
  }
]);
</script>

<style scoped lang="less">
:deep(.arco-descriptions-item-label) {
  font-weight: 500;
}

:deep(.arco-descriptions-item-value) {
  word-break: break-all;
  white-space: pre-wrap;
}

:deep(.arco-descriptions-item) {
  max-width: 100%;
}
</style>
