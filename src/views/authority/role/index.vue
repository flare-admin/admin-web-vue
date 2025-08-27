<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.role']" />
    <a-card class="general-card" :title="t('menu.authority.role')">
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
                <a-form-item field="name" :label="t('authority.role.searchTable.form.name')">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="t('authority.role.searchTable.form.name.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="code" :label="t('authority.role.searchTable.form.code')">
                  <a-input
                    v-model="formModel.code"
                    :placeholder="t('authority.role.searchTable.form.code.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="type" :label="t('authority.role.form.type')">
                  <a-select
                    v-model="formModel.type"
                    :placeholder="t('authority.role.form.type.placeholder')"
                    allow-clear
                  >
                    <a-option :value="1">{{ t('authority.role.type.resource') }}</a-option>
                    <a-option :value="2">{{ t('authority.role.type.data') }}</a-option>
                  </a-select>
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
            <a-button v-permission="['010301']" type="primary" @click="openCreateModal">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('authority.role.searchTable.operation.create') }}
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

    <!-- 创建/编辑角色的弹窗 -->
    <edit-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :data="modalForm"
      @submit="handleSubmit"
    />

    <!-- 权限分配弹窗 -->
    <assign-permission-modal
      v-model:visible="assignPermissionVisible"
      :role-id="currentRoleId"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, h, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-vue/es/icon';
import { roleApi } from '@/api/framework/authority';
import type { RoleModel } from '@/types/api/authority';
import { formatTimestamp } from '@/filters/date';
import Permission from '@/components/check-permission/index.vue';
import EditModal from './components/edit-modal.vue';
import AssignPermissionModal from './components/assign-permission-modal.vue';

const { t } = useI18n();

const formModel = ref({
  name: '',
  code: '',
  type: undefined as number | undefined
});

const loading = ref(false);
const renderData = ref<RoleModel[]>([]);
const modalVisible = ref(false);
const defaultFormData = {
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 1,
  localize: '',
  permIds: [] as number[],
  type: 1
};

const modalForm = ref<RoleModel>({ ...defaultFormData });

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
    const data = await roleApi.getList({
      current: pagination.current,
      size: pagination.pageSize,
      ...formModel.value
    });
    renderData.value = data.list;
    pagination.total = data.total;
  } catch (err) {
    Message.error(t('authority.common.search.failed'));
  } finally {
    loading.value = false;
  }
};

// 处理移除数据权限
const handleRemoveDataPermission = (record: RoleModel) => {
  Modal.confirm({
    title: t('authority.role.dataScope.remove.title'),
    content: t('authority.role.dataScope.remove.confirm'),
    onOk: async () => {
      try {
        await roleApi.removeDataPermission({ roleId: record.id });
        Message.success(t('authority.role.dataScope.remove.success'));
        search(); // 刷新列表
      } catch (err) {
        Message.error(t('authority.role.dataScope.remove.error'));
      }
    }
  });
};

// 弹窗标题
const modalTitle = computed(() => {
  return modalForm.value.id
    ? t('authority.role.modal.title.edit')
    : t('authority.role.modal.title.create');
});

// 打开创建弹窗
const openCreateModal = () => {
  modalForm.value = { ...defaultFormData };
  modalVisible.value = true;
};

// 打开编辑弹窗
const openEditModal = (record: RoleModel) => {
  modalForm.value = { ...record };
  modalVisible.value = true;
};

// 处理表单提交
const handleSubmit = async (formData: RoleModel) => {
  try {
    if (formData.id) {
      // 编辑
      await roleApi.update(formData);
      Message.success(t('authority.common.operation.success'));
    } else {
      // 新增
      await roleApi.create(formData);
      Message.success(t('authority.common.operation.success'));
    }
    modalVisible.value = false;

    // 如果是数据权限角色，需要调用分配数据权限接口
    if (formData.type === 2) {
      await roleApi.assignDataPermission({
        roleId: formData.id,
        scope: formData.dataScope!,
        deptIds: formData.dataScope === 5 ? formData.deptIds : undefined
      });
    }

    search(); // 刷新列表
  } catch (err) {
    Message.error(t('authority.common.operation.failed'));
  }
};

const handleDelete = async (record: RoleModel) => {
  Modal.confirm({
    title: t('authority.role.delete.confirm.title'),
    content: t('authority.role.delete.confirm.content', {
      name: record.name
    }),
    onOk: async () => {
      try {
        await roleApi.delete(record.id);
        Message.success(t('common.success.operation'));
        search();
      } catch (err) {
        Message.error(t('authority.common.delete.failed'));
      }
    }
  });
};

const assignPermissionVisible = ref(false);
const currentRoleId = ref<number>(0);

// 打开权限分配弹窗
const openAssignPermissionModal = (record: RoleModel) => {
  currentRoleId.value = record.id;
  assignPermissionVisible.value = true;
};

// 处理权限分配成功
const handleAssignSuccess = () => {
  assignPermissionVisible.value = false;
  Message.success(t('authority.role.permission.assign.success'));
};

const columns = computed<TableColumnData[]>(() => [
  {
    title: t('authority.role.searchTable.columns.name'),
    dataIndex: 'name'
  },
  {
    title: t('authority.role.searchTable.columns.code'),
    dataIndex: 'code'
  },
  {
    title: t('authority.role.searchTable.columns.description'),
    dataIndex: 'description'
  },
  {
    title: t('authority.role.searchTable.columns.status'),
    dataIndex: 'status',
    render: ({ record }) => {
      return h(
        'span',
        {},
        record.status === 1 ? t('authority.status.enabled') : t('authority.status.disabled')
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
    width: 200,
    fixed: 'right',
    render: ({ record }) => {
      return h('div', [
        // 编辑按钮
        h(
          Permission,
          { requiredPermissions: ['010302'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { marginRight: '15px' },
                  onClick: () => openEditModal(record as RoleModel)
                },
                t('authority.button.edit')
              )
          }
        ),
        // 分配按钮 - 只对资源类型角色显示
        record.type === 1 &&
          h(
            Permission,
            { requiredPermissions: ['010305'] },
            {
              default: () =>
                h(
                  'a',
                  {
                    style: { marginRight: '15px' },
                    onClick: () => openAssignPermissionModal(record as RoleModel)
                  },
                  t('authority.button.assign')
                )
            }
          ),
        // 移除数据权限按钮 - 只对已配置数据权限的数据权限角色显示
        record.type === 2 &&
          record.dataScope &&
          h(
            Permission,
            { requiredPermissions: ['010306'] },
            {
              default: () =>
                h(
                  'a',
                  {
                    style: { marginRight: '15px', color: '#FF7D00' },
                    onClick: () => handleRemoveDataPermission(record as RoleModel)
                  },
                  t('authority.role.button.removeDataPermission')
                )
            }
          ),
        // 删除按钮
        h(
          Permission,
          { requiredPermissions: ['010304'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { color: '#FF7D00' },
                  onClick: () => handleDelete(record as RoleModel)
                },
                t('authority.button.delete')
              )
          }
        )
      ]);
    }
  }
]);

const reset = () => {
  formModel.value = {
    name: '',
    code: '',
    type: undefined
  };
  search();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  search();
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
