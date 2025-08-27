<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.department']" />
    <a-card class="general-card">
      <a-row>
        <!-- 左侧部门树 -->
        <a-col :span="6" class="left-panel">
          <div class="panel-header">
            <span class="title">{{ t('department.tree.title') }}</span>
            <a-button v-permission="['010501']" type="primary" size="small" @click="handleCreate">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('department.button.create') }}
            </a-button>
          </div>
          <div class="panel-content">
            <a-tree
              :data="departmentTree"
              :field-names="{
                key: 'id',
                title: 'name',
                children: 'children'
              }"
              :selectable="true"
              @select="handleSelectDept"
            >
              <template #extra="nodeData">
                <div class="tree-node-content">
                  <div class="node-actions">
                    <a-button
                      v-permission="['010501']"
                      class="node-action-btn"
                      type="text"
                      size="mini"
                      @click.stop="handleCreateSubDept(nodeData)"
                    >
                      <icon-plus />
                    </a-button>
                    <a-button
                      v-permission="['010502']"
                      class="node-action-btn"
                      type="text"
                      size="mini"
                      @click.stop="handleEdit(nodeData)"
                    >
                      <icon-edit />
                    </a-button>
                    <a-button
                      v-permission="['010503']"
                      class="node-action-btn"
                      type="text"
                      size="mini"
                      status="danger"
                      @click.stop="handleDelete(nodeData)"
                    >
                      <icon-delete />
                    </a-button>
                  </div>
                </div>
              </template>
            </a-tree>
          </div>
        </a-col>

        <!-- 右侧部门列表 -->
        <a-col :span="18" class="right-panel">
          <div class="panel-header">
            <span class="title">
              <span class="sub-count">
                ({{ t('department.subDepts.count', { count: pagination.total }) }})
              </span>
            </span>
          </div>
          <div class="panel-content">
            <a-table
              row-key="id"
              :loading="loading"
              :data="subDepartments"
              :pagination="pagination"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
            >
              <template #columns>
                <a-table-column title="部门名称" data-index="name" />
                <a-table-column title="部门编码" data-index="code" />
                <a-table-column title="排序" data-index="sort" />
                <a-table-column title="负责人" data-index="leader" />
                <a-table-column title="联系电话" data-index="phone" />
                <a-table-column title="邮箱" data-index="email" />
                <a-table-column title="状态" data-index="status">
                  <template #cell="{ record }">
                    <a-tag :color="record.status === 1 ? 'green' : 'red'">
                      {{
                        record.status === 1
                          ? t('authority.status.enabled')
                          : t('authority.status.disabled')
                      }}
                    </a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="操作">
                  <template #cell="{ record }">
                    <a-space>
                      <a-button
                        v-permission="['010502']"
                        type="text"
                        size="small"
                        @click="handleEdit(record)"
                      >
                        <icon-edit />
                        {{ t('authority.button.edit') }}
                      </a-button>
                      <a-button
                        v-permission="['010503']"
                        type="text"
                        size="small"
                        @click="handleDelete(record)"
                      >
                        <icon-delete />
                        {{ t('authority.button.delete') }}
                      </a-button>
                    </a-space>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 部门表单弹窗 -->
    <DepartmentForm
      v-model:visible="visible"
      :title="formTitle"
      :form-data="formData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal, TreeNodeData } from '@arco-design/web-vue';
import useLoading from '@/hooks/loading';
import type { DepartmentDto } from '@/types/api/framework/department';
import { departmentApi } from '@/api/framework/department';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon';
import DepartmentForm from './components/department-form.vue';

const { t } = useI18n();
const { loading, setLoading } = useLoading();
const visible = ref(false);
const formTitle = ref('');
const formData = ref<Partial<DepartmentDto>>({});

// 修改 DepartmentDto 的类型定义，添加 children 字段
type DepartmentTreeNode = DepartmentDto & {
  children?: DepartmentTreeNode[];
};

// 部门树数据
const departmentTree = ref<DepartmentTreeNode[]>([]);
const currentDept = ref<DepartmentTreeNode>();
const subDepartments = ref<DepartmentDto[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 递归查找部门节点
const findDepartment = (
  deptId: string,
  departments: DepartmentTreeNode[]
): DepartmentTreeNode | undefined => {
  // 使用 find 替代 for...of
  const found = departments.find((dept) => dept.id === deptId);
  if (found) return found;

  // 递归查找子部门
  return departments
    .filter((dept) => dept.children?.length)
    .reduce<DepartmentTreeNode | undefined>((result, dept) => {
      if (result) return result;
      return dept.children ? findDepartment(deptId, dept.children) : undefined;
    }, undefined);
};

// 加载下级部门
const loadSubDepartments = async () => {
  setLoading(true);
  try {
    const { list, total } = await departmentApi.getDepartmentList({
      parentId: currentDept.value?.id,
      current: pagination.current,
      size: pagination.pageSize
    });
    subDepartments.value = list;
    pagination.total = total;
  } catch (err) {
    Message.error(t('department.subDepts.load.failed'));
  } finally {
    setLoading(false);
  }
};

// 选择部门
const handleSelectDept = async (
  selectedKeys: (string | number)[],
  data: {
    selected?: boolean | undefined;
    selectedNodes: TreeNodeData[];
    node?: TreeNodeData | undefined;
    e?: Event | undefined;
  }
) => {
  // 如果是取消选中，清空当前选中的部门和列表数据
  if (!selectedKeys.length || !data.selected) {
    currentDept.value = undefined;
    subDepartments.value = [];
    pagination.total = 0;
    return;
  }

  const stringKeys = selectedKeys.map((key) => key.toString());
  const deptId = stringKeys[0];
  currentDept.value = findDepartment(deptId, departmentTree.value);

  // 重置分页并加载数据
  pagination.current = 1;
  await loadSubDepartments();
};

// 页码改变
const onPageChange = async (current: number) => {
  pagination.current = current;
  await loadSubDepartments();
};

// 每页条数改变
const onPageSizeChange = async (pageSize: number) => {
  pagination.current = 1;
  pagination.pageSize = pageSize;
  await loadSubDepartments();
};

// 加载部门树
const loadDepartmentTree = async () => {
  try {
    // 直接使用后台返回的树形结构
    departmentTree.value = await departmentApi.getDepartmentTree();
  } catch (err) {
    Message.error(t('department.tree.load.failed'));
  }
};

// 创建部门
const handleCreate = () => {
  formTitle.value = t('department.form.title.create');
  formData.value = {
    status: 1,
    sort: 0
  };
  visible.value = true;
};

// 创建子部门
const handleCreateSubDept = (nodeData: DepartmentTreeNode) => {
  formTitle.value = t('department.form.title.createSub');
  formData.value = {
    status: 1,
    sort: 0,
    parentId: nodeData.id
  };
  visible.value = true;
};

// 编辑部门
const handleEdit = (record: DepartmentDto) => {
  formTitle.value = t('department.form.title.edit');
  formData.value = { ...record };
  visible.value = true;
};

// 删除部门
const handleDelete = (record: DepartmentDto) => {
  Modal.confirm({
    title: t('department.operation.delete.confirm.title'),
    content: t('department.operation.delete.confirm.content'),
    onOk: async () => {
      try {
        await departmentApi.deleteDepartment(record.id);
        Message.success(t('department.operation.delete.success'));
        await loadDepartmentTree(); // 刷新部门树
        // 如果删除的是当前选中的部门，清空当前选中
        if (currentDept.value?.id === record.id) {
          currentDept.value = undefined;
          subDepartments.value = [];
        } else {
          await loadSubDepartments(); // 否则刷新列表
        }
      } catch (err) {
        Message.error(t('department.operation.delete.error'));
      }
    }
  });
};

// 表单提交
const handleSubmit = async (data: DepartmentDto) => {
  try {
    if (data.id) {
      await departmentApi.updateDepartment(data);
      Message.success(t('department.operation.update.success'));
    } else {
      await departmentApi.createDepartment(data);
      Message.success(t('department.operation.create.success'));
    }
    visible.value = false;
    await loadDepartmentTree(); // 刷新部门树
    // 如果是在当前部门下创建子部门，刷新子部门列表
    if (data.parentId && currentDept.value?.id === data.parentId) {
      await loadSubDepartments(); // 使用新的加载函数
    }
  } catch (err) {
    Message.error(
      data.id ? t('department.operation.update.error') : t('department.operation.create.error')
    );
  }
};

// 初始化
onMounted(async () => {
  await loadDepartmentTree();
  // 初始加载下级部门列表
  await loadSubDepartments();
});
</script>

<style scoped lang="less">
.container {
  padding: 16px 20px 20px;
}

.general-card {
  min-height: calc(100vh - 160px);
  padding-top: 12px;
}

.left-panel {
  border-right: 1px solid var(--color-neutral-3);
  padding-right: 16px;
}

.right-panel {
  padding-left: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title {
    font-size: 16px;
    font-weight: 500;

    .sub-count {
      margin-left: 8px;
      font-size: 14px;
      font-weight: normal;
      color: var(--color-text-3);
    }
  }
}
.panel-content {
  height: calc(100vh - 250px);
  overflow: auto;
  width: 100%;
}
.tree-node-content {
  .node-actions {
    //display: none;
    //flex-shrink: 0;
    .node-action-btn {
      padding: 0 3px;
    }
  }
  &:hover .node-actions {
    display: flex;
    gap: 2px;
  }
}

:deep(.arco-tree-node) {
  width: 100%;
  min-width: fit-content;
}

:deep(.arco-tree-node-title) {
  flex: 1;
  width: 0;
}
</style>
