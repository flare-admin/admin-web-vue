<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.user']" />
    <a-card class="general-card" :title="t('menu.authority.user')">
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
                <a-form-item
                  field="userName"
                  :label="t('authority.user.searchTable.form.userName')"
                >
                  <a-input
                    v-model="formModel.username"
                    :placeholder="t('authority.user.searchTable.form.userName.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="email" :label="t('authority.user.searchTable.form.email')">
                  <a-input
                    v-model="formModel.email"
                    :placeholder="t('authority.user.searchTable.form.email.placeholder')"
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
            <a-button v-permission="['010101']" type="primary" @click="openCreateModal">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('authority.user.searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="renderData"
        @page-change="onPageChange"
      />
    </a-card>
    <!-- 创建/编辑用户的弹窗 -->
    <edit-modal v-model:visible="editVisible" :data="currentData" @success="handleSuccess" />
    <!-- 角色分配弹窗 -->
    <assign-role-modal
      v-model:visible="assignRoleVisible"
      :user-id="currentUserId"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, h, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-vue/es/icon';
import { userApi } from '@/api/framework/authority';
import type { UserModel } from '@/types/api/authority';
import Permission from '@/components/check-permission/index.vue';
import { formatTimestamp } from '@/filters/date';
import EditModal from './components/edit-modal.vue';
import AssignRoleModal from './components/assign-role-modal.vue';

const { t } = useI18n();
const instance = getCurrentInstance();
const proxy = instance?.proxy;
const formModel = ref({
  username: '',
  email: '',
  roleId: undefined as string | undefined
});

const loading = ref(false);
const renderData = ref<UserModel[]>([]);
const editVisible = ref(false);
const currentData = ref<UserModel>({} as UserModel);
const loadingId = ref('');
const defaultFormData = {
  id: '',
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  roleIds: [] as number[],
  invitationCode: '',
  status: 1
};

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

const search = async () => {
  loading.value = true;
  try {
    const data = await userApi.getList({
      current: pagination.current,
      size: pagination.pageSize,
      ...formModel.value
    });
    renderData.value = data.list;
    pagination.total = data.total;
  } catch (err) {
    Message.error('查询失败');
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  formModel.value = {
    username: '',
    email: '',
    roleId: undefined
  };
  search();
};

const openEditModal = (record: UserModel) => {
  currentData.value = { ...record };
  editVisible.value = true;
};

const handleDelete = async (record: UserModel) => {
  Modal.confirm({
    title: t('authority.user.delete.confirm.title'),
    content: t('authority.user.delete.confirm.content', {
      name: record.username
    }),
    onOk: async () => {
      try {
        await userApi.delete(record.id);
        Message.success(t('common.success.operation'));
        search();
      } catch (err) {
        Message.error('删除失败');
      }
    }
  });
};

const assignRoleVisible = ref(false);
const currentUserId = ref('');

// 打开角色分配弹窗
const openAssignRoleModal = (record: UserModel) => {
  currentUserId.value = record.id;
  assignRoleVisible.value = true;
};

// 处理角色分配成功
const handleAssignSuccess = () => {
  assignRoleVisible.value = false;
  Message.success(t('authority.user.role.assign.success'));
  search();
};

// 处理状态变更
const handleStatusChange = async (record: UserModel, checked: boolean) => {
  loadingId.value = record.id;
  try {
    await userApi.updateStatus(record.id, checked ? 2 : 1);
    Message.success(t('common.success.operation'));
    await search();
  } catch (err) {
    Message.error(t('common.error.operation'));
  } finally {
    loadingId.value = '';
  }
};
const columns: TableColumnData[] = [
  {
    title: t('authority.user.searchTable.columns.userName'),
    dataIndex: 'username'
  },
  {
    title: t('authority.user.searchTable.columns.name'),
    dataIndex: 'name'
  },
  {
    title: t('authority.user.searchTable.columns.email'),
    dataIndex: 'email'
  },
  {
    title: t('authority.user.searchTable.columns.phone'),
    dataIndex: 'phone'
  },
  {
    title: t('authority.user.searchTable.columns.role'),
    dataIndex: 'roleIds',
    render: ({ record }) => {
      return h('span', {}, record.roleIds.join(', '));
    }
  },
  {
    title: t('authority.user.searchTable.columns.status'),
    dataIndex: 'status',
    render: ({ record }) => {
      return h(
        'span',
        {},
        record.status === 1 ? t('common.status.enabled') : t('common.status.disabled')
      );
    }
  },
  {
    title: t('common.table.columns.createdAt'),
    dataIndex: 'createdAt',
    render: ({ record }) => {
      return h('span', {}, formatTimestamp(record.createdAt));
    }
  },
  {
    title: t('common.table.columns.updatedAt'),
    dataIndex: 'updatedAt',
    render: ({ record }) => {
      return h('span', {}, formatTimestamp(record.updatedAt));
    }
  },
  {
    title: t('common.operations'),
    dataIndex: 'operations',
    render: ({ record }) => {
      return h('div', [
        h(
          Permission,
          { requiredPermissions: ['010102'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { marginRight: '15px' },
                  onClick: () => openEditModal(record as UserModel)
                },
                t('authority.button.edit')
              )
          }
        ),
        h(
          Permission,
          { requiredPermissions: ['010106'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { marginRight: '15px' },
                  onClick: () => openAssignRoleModal(record as UserModel)
                },
                t('authority.button.assign')
              )
          }
        ),
        h(
          Permission,
          { requiredPermissions: ['010105'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: {
                    marginRight: '15px',
                    color: record.status === 1 ? '#FF4D4F' : '#00B42A'
                  },
                  onClick: () => handleStatusChange(record as UserModel, record.status === 1)
                },
                record.status === 1 ? t('authority.button.disable') : t('authority.button.enable')
              )
          }
        ),
        h(
          Permission,
          { requiredPermissions: ['010103'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { color: '#FF7D00' },
                  onClick: () => handleDelete(record as UserModel),
                  directives: [{ name: 'permission', value: ['010103'] }] // 添加权限指令
                },
                t('authority.button.delete')
              )
          }
        )
      ]);
    }
  }
];

const onPageChange = (current: number) => {
  pagination.current = current;
  search();
};

const openCreateModal = () => {
  currentData.value = defaultFormData;
  editVisible.value = true;
};

const handleSuccess = (needReset?: boolean) => {
  if (needReset) {
    reset();
  } else {
    search();
  }
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
