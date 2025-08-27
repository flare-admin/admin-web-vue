<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.permission']" />
    <a-card class="general-card" :title="t('menu.authority.permission')">
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
                <a-form-item field="name" :label="t('authority.permission.searchTable.form.name')">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="t('authority.permission.searchTable.form.name.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="code" :label="t('authority.permission.searchTable.form.code')">
                  <a-input
                    v-model="formModel.code"
                    :placeholder="t('authority.permission.searchTable.form.code.placeholder')"
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
            <a-button v-permission="['010401']" type="primary" @click="openCreateModal">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('authority.permission.searchTable.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        v-model:expanded-keys="expandedKeys"
        row-key="id"
        :loading="loading"
        :pagination="false"
        :columns="columns"
        :data="renderData"
        show-empty-tree
        style="margin-top: 20px"
      />
    </a-card>

    <!-- 创建/编辑权限的弹窗 -->
    <edit-modal v-model:visible="modalVisible" :data="modalForm" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, h, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal } from '@arco-design/web-vue';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-vue/es/icon';
import { permissionsApi } from '@/api/framework/authority';
import type { PermissionModel, ResourceModel } from '@/types/api/authority';
import Permission from '@/components/check-permission/index.vue';
import { formatTimestamp } from '@/filters/date';
import EditModal from './components/edit-modal.vue';

const { t } = useI18n();
const instance = getCurrentInstance();
const proxy = instance?.proxy;
const formModel = ref({
  name: '',
  code: ''
});

const loading = ref(false);
const renderData = ref<PermissionModel[]>([]);
const expandedKeys = ref<(string | number)[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const defaultFormData = {
  id: 0,
  name: '',
  code: '',
  type: 1,
  icon: undefined,
  path: undefined,
  parentId: undefined,
  sequence: undefined,
  description: undefined,
  localize: undefined,
  properties: undefined,
  resources: [] as ResourceModel[],
  status: 1
};
const modalForm = reactive<PermissionModel>({ ...defaultFormData });

const pagination = reactive({
  current: 1,
  pageSize: 500,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

const sortBySequence = (items: PermissionModel[]): PermissionModel[] => {
  return items
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    .map((item) => ({
      ...item,
      children: item.children?.length ? sortBySequence(item.children) : []
    }));
};

const buildPermissionTreeOptimizedWithSorting = (data: PermissionModel[]): PermissionModel[] => {
  const idMap: Record<number, PermissionModel> = {};
  const tree: PermissionModel[] = [];

  // 先建立 id 映射
  data.forEach((item) => {
    idMap[item.id] = { ...item, children: [] };
  });

  // 建立层级关系
  data.forEach((item) => {
    if (item.parentId === 0 || !item.parentId) {
      // 顶级节点
      tree.push(idMap[item.id]);
    } else if (idMap[item.parentId]) {
      // 子节点添加到父节点的 children 中
      let ch: PermissionModel[] | undefined = idMap[item.parentId].children;
      const it = idMap[item.id];
      if (ch) {
        ch.push(it);
      } else {
        ch = [it];
      }
      idMap[item.parentId].children = ch;
    }
  });

  return tree;
};

const search = async () => {
  loading.value = true;
  try {
    const data = await permissionsApi.getList({
      current: pagination.current,
      size: pagination.pageSize,
      ...formModel.value
    });
    renderData.value = buildPermissionTreeOptimizedWithSorting(data.list);
    pagination.total = data.total;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openEditModal = (record: PermissionModel) => {
  modalTitle.value = t('authority.permission.modal.title.edit');
  modalForm.id = record.id;
  modalForm.name = record.name;
  modalForm.code = record.code;
  modalForm.type = record.type;
  modalForm.icon = record.icon;
  modalForm.path = record.path;
  modalForm.parentId = record.parentId;
  modalForm.sequence = record.sequence;
  modalForm.description = record.description;
  modalForm.localize = record.localize;
  modalForm.properties = record.properties;
  modalForm.resources = record.resources?.map((r) => ({ ...r })) || [];
  modalForm.status = record.status;
  modalVisible.value = true;
};

const handleDelete = async (record: PermissionModel) => {
  Modal.confirm({
    title: t('authority.permission.delete.confirm.title'),
    content: t('authority.permission.delete.confirm.content', {
      name: record.name
    }),
    onOk: async () => {
      try {
        await permissionsApi.delete(record.id);
        Message.success(t('common.success.operation'));
        search();
      } catch (err) {
        console.error(err);
      }
    }
  });
};

const columns: TableColumnData[] = [
  {
    title: t('authority.permission.searchTable.columns.name'),
    dataIndex: 'name'
  },
  {
    title: t('authority.permission.searchTable.columns.code'),
    dataIndex: 'code'
  },
  {
    title: t('authority.permission.searchTable.columns.type'),
    dataIndex: 'type',
    render: ({ record }) => {
      const typeMap = {
        1: t('authority.permission.type.menu'),
        2: t('authority.permission.type.button'),
        3: t('authority.permission.type.api')
      };
      return h('span', {}, typeMap[record.type as keyof typeof typeMap]);
    }
  },
  {
    title: t('authority.permission.searchTable.columns.path'),
    dataIndex: 'path'
  },
  {
    title: t('authority.permission.searchTable.columns.sequence'),
    dataIndex: 'sequence'
  },
  {
    title: t('authority.permission.searchTable.columns.status'),
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
    render: ({ record }) => {
      return h('div', [
        h(
          Permission,
          { requiredPermissions: ['010402'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { marginRight: '15px' },
                  onClick: () => openEditModal(record as PermissionModel)
                },
                t('authority.button.edit')
              )
          }
        ),
        h(
          Permission,
          { requiredPermissions: ['010403'] },
          {
            default: () =>
              h(
                'a',
                {
                  style: { color: '#FF7D00' },
                  onClick: () => handleDelete(record as PermissionModel)
                },
                t('authority.button.delete')
              )
          }
        )
      ]);
    }
  }
];

const reset = () => {
  formModel.value = {
    name: '',
    code: ''
  };
  search();
};

const openCreateModal = () => {
  modalTitle.value = t('authority.permission.searchTable.operation.create');
  Object.assign(modalForm, defaultFormData);
  modalVisible.value = true;
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

.resource-list {
  .resource-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .resource-add {
    margin-top: 8px;
  }
}
</style>
