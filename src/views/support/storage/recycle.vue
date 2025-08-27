<template>
  <div class="container">
    <Breadcrumb :items="['menu.storage', 'menu.storage.recycle']" />
    <a-card class="general-card" :title="t('storage.recycle.title')">
      <template #extra>
        <a-space>
          <a-button
            type="primary"
            status="success"
            :disabled="!selectedFiles.length"
            @click="handleBatchRestore"
          >
            <template #icon>
              <icon-undo />
            </template>
            {{ t('storage.recycle.batchRestore') }}
          </a-button>
          <a-button
            type="primary"
            status="danger"
            :disabled="!selectedFiles.length"
            @click="handleBatchDelete"
          >
            <template #icon>
              <icon-delete />
            </template>
            {{ t('storage.recycle.batchDelete') }}
          </a-button>
        </a-space>
      </template>

      <!-- 搜索表单 -->
      <a-row class="mb-4">
        <a-col :flex="1">
          <a-form
            :model="searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="name" :label="t('storage.file.name')">
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="t('storage.file.namePlaceholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="type" :label="t('storage.file.type')">
                  <a-input
                    v-model="searchForm.type"
                    :placeholder="t('storage.file.typePlaceholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="time" :label="t('storage.file.deletedAt')">
                  <a-range-picker v-model="timeRange" @change="onTimeChange" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider direction="vertical" />
        <a-col>
          <a-space>
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('storage.file.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('storage.file.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 文件列表 -->
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="fileList"
        :row-selection="rowSelection"
        @page-change="onPageChange"
      >
        <template #name="{ record }">
          <a-space>
            <icon-file />
            {{ record.name }}
          </a-space>
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button type="text" status="success" @click="handleRestore(record)">
              <template #icon>
                <icon-undo />
              </template>
              {{ t('storage.recycle.restore') }}
            </a-button>
            <a-button type="text" status="danger" @click="handleDelete(record)">
              <template #icon>
                <icon-delete />
              </template>
              {{ t('storage.recycle.delete') }}
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import { FileDto } from '@/types/api/storage';
import storageApi from '@/api/support/storage';
import useLoading from '@/hooks/loading';
import formatBytes from '@/utils/format';
import { formatTimestamp } from '@/filters/date';

const { t } = useI18n();
const { loading, setLoading } = useLoading();

// 文件列表相关
const fileList = ref<FileDto[]>([]);
const selectedFiles = ref<FileDto[]>([]);
const timeRange = ref();

const searchForm = reactive({
  current: 1,
  pageSize: 10,
  name: '',
  type: '',
  startTime: '',
  endTime: ''
});

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 表格列定义
const columns: TableColumnData[] = [
  {
    title: t('storage.file.name'),
    dataIndex: 'name',
    slotName: 'name'
  },
  {
    title: t('storage.file.size'),
    dataIndex: 'size',
    render: ({ record }) => formatBytes(record.size)
  },
  {
    title: t('storage.file.type'),
    dataIndex: 'type'
  },
  {
    title: t('storage.file.deletedAt'),
    dataIndex: 'deletedAt',
    render: ({ record }) => formatTimestamp(record.deletedAt)
  },
  {
    title: t('storage.file.operations'),
    slotName: 'operations',
    width: 160,
    fixed: 'right'
  }
];

// 表格选择配置
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onSelect: (selectedRowKeys: string[], record: FileDto) => {
    selectedFiles.value = selectedRowKeys.map((key) =>
      fileList.value.find((item) => item.id === parseInt(key, 10))
    );
  }
};

// 加载回收站文件列表
const loadFileList = async () => {
  setLoading(true);
  try {
    const res = await storageApi.getRecycleList({
      current: searchForm.current,
      size: searchForm.pageSize,
      name: searchForm.name,
      type: searchForm.type,
      startTime: searchForm.startTime,
      endTime: searchForm.endTime
    });
    fileList.value = res.list;
    pagination.total = res.total;
  } catch (err) {
    Message.error(t('storage.recycle.loadError'));
  } finally {
    setLoading(false);
  }
};

// 时间范围变化
const onTimeChange = (_, dateStrings: string[]) => {
  const [start, end] = dateStrings;
  searchForm.startTime = start;
  searchForm.endTime = end;
};

// 搜索和重置
const search = () => {
  pagination.current = 1;
  loadFileList();
};

const reset = () => {
  searchForm.name = '';
  searchForm.type = '';
  searchForm.startTime = '';
  searchForm.endTime = '';
  timeRange.value = null;
  search();
};

// 分页变化
const onPageChange = (current: number) => {
  pagination.current = current;
  searchForm.current = current;
  loadFileList();
};

// 恢复文件
const handleRestore = async (record: FileDto) => {
  try {
    await storageApi.restoreFile(record.id);
    Message.success(t('storage.recycle.restoreSuccess'));
    loadFileList();
  } catch (err) {
    Message.error(t('storage.recycle.restoreError'));
  }
};

// 批量恢复
const handleBatchRestore = async () => {
  if (!selectedFiles.value.length) return;

  try {
    await Promise.all(selectedFiles.value.map((file) => storageApi.restoreFile(file.id)));
    Message.success(t('storage.recycle.batchRestoreSuccess'));
    loadFileList();
  } catch (err) {
    Message.error(t('storage.recycle.batchRestoreError'));
  }
};

// 删除文件
const handleDelete = async (record: FileDto) => {
  Modal.confirm({
    title: t('storage.recycle.deleteConfirmTitle'),
    content: t('storage.recycle.deleteConfirmContent'),
    onOk: async () => {
      try {
        await storageApi.deleteFile(record.id);
        Message.success(t('storage.recycle.deleteSuccess'));
        loadFileList();
      } catch (err) {
        Message.error(t('storage.recycle.deleteError'));
      }
    }
  });
};

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedFiles.value.length) return;

  Modal.confirm({
    title: t('storage.recycle.batchDeleteConfirmTitle'),
    content: t('storage.recycle.batchDeleteConfirmContent'),
    onOk: async () => {
      try {
        await storageApi.batchDeleteFiles({
          ids: selectedFiles.value.map((file) => file.id)
        });
        Message.success(t('storage.recycle.batchDeleteSuccess'));
        loadFileList();
      } catch (err) {
        Message.error(t('storage.recycle.batchDeleteError'));
      }
    }
  });
};

// 初始化
loadFileList();
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px;
}

.general-card {
  min-height: calc(100vh - 160px);
}

.mb-4 {
  margin-bottom: 24px;
}
</style>
