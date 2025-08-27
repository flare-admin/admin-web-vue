<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.tenant']" />
    <a-card :title="t('menu.authority.tenant')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="name" :label="t('authority.tenant.searchTable.form.name')">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="t('authority.tenant.searchTable.form.name.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="code" :label="t('authority.tenant.searchTable.form.code')">
                  <a-input
                    v-model="formModel.code"
                    :placeholder="t('authority.tenant.searchTable.form.code.placeholder')"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('common.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('common.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button v-permission="['010201']" type="primary" @click="openCreateModal">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('authority.tenant.searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="storeLoading"
        :pagination="pagination"
        :data="renderData"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.name')"
            data-index="name"
          />
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.code')"
            data-index="code"
          />
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.description')"
            data-index="description"
          />
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.expireTime')"
            data-index="expireTime"
          >
            <template #cell="{ record }">
              {{ formatTimestamp(record.expireTime) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.isDefault')"
            data-index="isDefault"
          >
            <template #cell="{ record }">
              {{ record.isDefault === 1 ? t('common.yes') : t('common.no') }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.status')"
            data-index="status"
          >
            <template #cell="{ record }">
              {{
                record.status === 1 ? t('authority.status.enabled') : t('authority.status.disabled')
              }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('authority.tenant.searchTable.columns.adminUsername')"
            data-index="adminUsername"
          >
            <template #cell="{ record }">
              {{ record?.adminUser?.username }}
            </template>
          </a-table-column>
          <a-table-column :title="t('common.table.columns.createdAt')" data-index="createdAt">
            <template #cell="{ record }">
              {{ formatTimestamp(record.createdAt) }}
            </template>
          </a-table-column>
          <a-table-column :title="t('common.table.columns.updatedAt')" data-index="updatedAt">
            <template #cell="{ record }">
              {{ formatTimestamp(record.updatedAt) }}
            </template>
          </a-table-column>
          <a-table-column :title="t('common.operations')" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button v-permission="['010206']" type="text" @click="openDetailModal(record)">
                  {{ t('authority.button.view') }}
                </a-button>
                <a-button v-permission="['010202']" type="text" @click="openEditModal(record)">
                  {{ t('authority.button.edit') }}
                </a-button>
                <a-button
                  v-permission="['010204']"
                  type="text"
                  @click="openAssignPermissionModal(record)"
                >
                  {{ t('authority.button.assign') }}
                </a-button>
                <a-button
                  v-permission="['010203']"
                  type="text"
                  status="danger"
                  @click="handleDelete(record)"
                >
                  {{ t('authority.button.delete') }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑租户的弹窗 -->
    <edit-modal v-model:visible="modalVisible" :data="modalForm" @success="handleSuccess" />

    <!-- 详情弹窗 -->
    <detail-modal v-model:visible="detailVisible" :data="detailData" />

    <!-- 添加权限分配弹窗 -->
    <assign-permission-modal
      v-model:visible="assignPermissionVisible"
      :tenant-id="currentTenantId"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal } from '@arco-design/web-vue';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-vue/es/icon';
import { tenantApi } from '@/api/framework/authority';
import type { TenantModel } from '@/types/api/authority';
import { useAppStore } from '@/store';
import { formatTimestamp } from '@/filters/date';
import EditModal from './components/edit-modal.vue';
import DetailModal from './components/detail-modal.vue';

import AssignPermissionModal from './components/assign-permission-modal.vue';

const instance = getCurrentInstance();
const proxy = instance?.proxy;

const { t } = useI18n();
const appStore = useAppStore();
const storeLoading = computed(() => appStore.loading);
const detailData = ref<TenantModel>({} as TenantModel);
const formModel = ref({
  name: '',
  code: ''
});

const renderData = ref<TenantModel[]>([]);
const modalVisible = ref(false);
const detailVisible = ref(false);
const modalTitle = ref('');

const defaultFormData = {
  id: '',
  name: '',
  code: '',
  expireTime: 0,
  status: 1,
  description: '',
  isDefault: 0,
  adminUsername: '',
  adminUser: {
    username: '',
    password: '',
    name: '',
    email: '',
    phone: ''
  }
};
const modalForm = reactive<TenantModel>({ ...defaultFormData });

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

const search = async () => {
  try {
    const data = await tenantApi.getList({
      current: pagination.current,
      size: pagination.pageSize,
      ...formModel.value
    });
    renderData.value = data.list;
    pagination.total = data.total;
  } catch (err) {
    Message.error(t('authority.common.search.failed'));
  }
};

const reset = () => {
  formModel.value = {
    name: '',
    code: ''
  };
  search();
};

const openEditModal = (record: TenantModel) => {
  modalTitle.value = t('authority.tenant.modal.title.edit');
  modalForm.id = record.id;
  modalForm.name = record.name;
  modalForm.code = record.code;
  modalForm.expireTime = record.expireTime;
  modalForm.status = record.status;
  modalForm.description = record.description;
  modalForm.isDefault = record.isDefault;
  modalForm.adminUser.username = record.adminUsername;
  modalForm.adminUser.password = record.adminUser?.password;
  modalVisible.value = true;
};

const handleDelete = async (record: TenantModel) => {
  Modal.confirm({
    title: t('authority.tenant.delete.confirm.title'),
    content: t('authority.tenant.delete.confirm.content', {
      name: record.name
    }),
    onOk: async () => {
      try {
        await tenantApi.delete(record.id);
        Message.success(t('common.success.operation'));
        search();
      } catch (err) {
        Message.error(t('authority.common.operation.failed'));
      }
    }
  });
};

const onPageChange = (current: number) => {
  pagination.current = current;
  search();
};

const openCreateModal = () => {
  modalTitle.value = t('authority.tenant.modal.title.create');
  Object.assign(modalForm, defaultFormData);
  modalVisible.value = true;
};

const openDetailModal = (record: TenantModel) => {
  detailData.value = { ...record };
  detailVisible.value = true;
};

const handleSuccess = (needReset?: boolean) => {
  if (needReset) {
    reset();
  } else {
    search();
  }
};

const assignPermissionVisible = ref(false);
const currentTenantId = ref('');

const openAssignPermissionModal = (record: TenantModel) => {
  currentTenantId.value = record.id;
  assignPermissionVisible.value = true;
};

const handleAssignSuccess = () => {
  assignPermissionVisible.value = false;
  Message.success(t('authority.tenant.permission.assign.success'));
};

// 初始加载
search();
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
