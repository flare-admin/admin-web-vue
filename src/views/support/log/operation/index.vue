<template>
  <div class="container">
    <Breadcrumb :items="['menu.log', 'menu.log.operation']" />
    <a-card class="general-card" :title="t('log.operation.title')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="username" :label="t('log.form.username')">
                  <a-input
                    v-model="searchForm.username"
                    :placeholder="t('log.form.username.placeholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="module" :label="t('log.operation.form.module')">
                  <a-input
                    v-model="searchForm.module"
                    :placeholder="t('log.operation.form.module.placeholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="action" :label="t('log.operation.form.action')">
                  <a-input
                    v-model="searchForm.action"
                    :placeholder="t('log.operation.form.action.placeholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="status" :label="t('log.form.status')">
                  <a-select
                    v-model="searchForm.status"
                    :options="[
                      { label: t('log.status.success'), value: 200 },
                      { label: t('log.status.fail'), value: 500 }
                    ]"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="time" :label="t('log.form.time')">
                  <a-range-picker v-model="timeRange" style="width: 100%" @change="onTimeChange" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 32px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space>
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('log.form.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('log.form.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column :title="t('log.columns.username')" data-index="username" />
          <a-table-column :title="t('log.operation.columns.module')" data-index="module" />
          <a-table-column :title="t('log.operation.columns.action')" data-index="action" />
          <a-table-column :title="t('log.operation.columns.method')" data-index="method" />
          <a-table-column :title="t('log.operation.columns.path')" data-index="path" />
          <a-table-column :title="t('log.columns.ip')" data-index="ip" />
          <a-table-column :title="t('log.operation.columns.duration')" data-index="duration">
            <template #cell="{ record }"> {{ record.duration }}ms </template>
          </a-table-column>
          <a-table-column :title="t('log.columns.status')" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="record.status === 200 ? 'green' : 'red'">
                {{ record.status === 200 ? t('log.status.success') : t('log.status.fail') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('log.operation.columns.createdAt')" data-index="createdAt">
            <template #cell="{ record }">
              {{ formatTimestamp(record.createdAt) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openDetail(record)">
                <template #icon>
                  <icon-eye />
                </template>
                {{ t('log.operation.detail.view') }}
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>

  <detail-modal v-if="currentRecord" v-model:visible="detailVisible" :data="currentRecord!" />
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye } from '@arco-design/web-vue/es/icon';
import { OperationLogQueryParams, OperationLogRecord } from '@/types/api/support/log';
import logApi from '@/api/support/log';
import useLoading from '@/hooks/loading';
import { formatTimestamp } from '@/filters/date';
import DetailModal from './components/detail-modal.vue';

const { t } = useI18n();
const { loading, setLoading } = useLoading();
const renderData = ref<OperationLogRecord[]>([]);
const timeRange = ref();

const searchForm = reactive<OperationLogQueryParams>({
  current: 1,
  pageSize: 10
});

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

const detailVisible = ref(false);
const currentRecord = ref<OperationLogRecord>();

const fetchData = async () => {
  setLoading(true);
  try {
    const { list, total } = await logApi.getOperationLogList(searchForm);
    renderData.value = list;
    pagination.total = total;
  } catch (err) {
    Message.error(t('log.fetch.error'));
  } finally {
    setLoading(false);
  }
};

const onTimeChange = (_, dateStrings: string[]) => {
  const [start, end] = dateStrings;
  searchForm.startTime = start;
  searchForm.endTime = end;
};

const search = () => {
  pagination.current = 1;
  fetchData();
};

const reset = () => {
  searchForm.username = '';
  searchForm.module = '';
  searchForm.action = '';
  searchForm.status = undefined;
  searchForm.startTime = undefined;
  searchForm.endTime = undefined;
  timeRange.value = null;
  search();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  searchForm.current = current;
  fetchData();
};

const openDetail = (record: OperationLogRecord) => {
  currentRecord.value = { ...record };
  detailVisible.value = true;
};

fetchData();
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px;
}

:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}
</style>
