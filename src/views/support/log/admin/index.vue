<template>
  <div class="container">
    <Breadcrumb :items="['menu.log', 'menu.log.admin']" />
    <a-card class="general-card" :title="t('log.admin.title')">
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
                <a-form-item field="status" :label="t('log.form.status')">
                  <a-select
                    v-model="searchForm.status"
                    :options="[
                      { label: t('log.status.success'), value: 1 },
                      { label: t('log.status.fail'), value: 0 }
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
          <a-table-column :title="t('log.columns.ip')" data-index="ip" />
          <a-table-column :title="t('log.columns.location')" data-index="location" />
          <a-table-column :title="t('log.columns.device')" data-index="device" />
          <a-table-column :title="t('log.columns.os')" data-index="os" />
          <a-table-column :title="t('log.columns.status')" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? t('log.status.success') : t('log.status.fail') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('log.columns.message')" data-index="message" />
          <a-table-column :title="t('log.columns.loginTime')" data-index="loginTime">
            <template #cell="{ record }">
              {{ formatTimestamp(record.loginTime) }}
            </template>
          </a-table-column>
          <a-table-column :title="t('log.columns.browser')" data-index="browser" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
import { LogQueryParams, LoginLogRecord } from '@/types/api/support/log';
import logApi from '@/api/support/log';
import useLoading from '@/hooks/loading';
import { formatTimestamp } from '@/filters/date';

const { t } = useI18n();
const { loading, setLoading } = useLoading();
const renderData = ref<LoginLogRecord[]>([]);
const timeRange = ref();

const searchForm = reactive<LogQueryParams>({
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

const fetchData = async () => {
  setLoading(true);
  try {
    const { list, total } = await logApi.getAdminLogList(searchForm);
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
