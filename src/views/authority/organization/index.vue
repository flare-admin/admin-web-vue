<template>
  <div class="container">
    <Breadcrumb :items="['menu.authority', 'menu.authority.organization']" />
    <a-card class="general-card">
      <a-row>
        <!-- 左侧部门树 -->
        <a-col :span="6" class="left-panel">
          <div class="panel-header">
            <span class="title">{{ t('organization.tree.title') }}</span>
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
            />
          </div>
        </a-col>

        <!-- 右侧用户列表 -->
        <a-col :span="18" class="right-panel">
          <div class="panel-header">
            <span class="title">
              {{ currentDept?.name || t('organization.users.title') }}
              <span class="sub-count">
                ({{ t('organization.users.count', { count: pagination.total }) }})
              </span>
            </span>
            <a-space>
              <a-button v-if="currentDept" type="primary" size="small" @click="handleAssignUsers">
                <template #icon>
                  <icon-plus />
                </template>
                {{ t('organization.button.assignUsers') }}
              </a-button>
              <a-button
                v-if="currentDept"
                type="primary"
                status="warning"
                size="small"
                @click="handleMoveUsers"
              >
                <template #icon>
                  <icon-swap />
                </template>
                {{ t('organization.button.moveUsers') }}
              </a-button>
            </a-space>
          </div>
          <div class="panel-content">
            <a-table
              v-model:selected-keys="selectedUserIds"
              row-key="id"
              :loading="loading"
              :data="users"
              :pagination="pagination"
              :row-selection="rowSelection"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
            >
              <template #columns>
                <a-table-column title="用户名" data-index="username" />
                <a-table-column title="姓名" data-index="name" />
                <a-table-column title="邮箱" data-index="email" />
                <a-table-column title="手机号" data-index="phone" />
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
                        type="text"
                        size="small"
                        status="danger"
                        @click="handleRemoveUser(record)"
                      >
                        <template #icon>
                          <icon-delete />
                        </template>
                        {{ t('organization.button.removeUser') }}
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

    <!-- 分配用户弹窗 -->
    <assign-users-modal
      v-model:visible="assignUsersVisible"
      :dept-id="currentDept?.id"
      @success="handleAssignSuccess"
    />

    <!-- 移动用户弹窗 -->
    <move-users-modal
      v-model:visible="moveUsersVisible"
      :dept-id="currentDept?.id"
      :user-ids="selectedUserIds"
      @success="handleMoveSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal, TreeNodeData } from '@arco-design/web-vue';
import useLoading from '@/hooks/loading';
import type { DepartmentDto } from '@/types/api/department';
import type { UserModel } from '@/types/api/authority';
import { departmentApi } from '@/api/framework/department';
import { IconPlus, IconDelete, IconSwap } from '@arco-design/web-vue/es/icon';
import AssignUsersModal from './components/assign-users-modal.vue';
import MoveUsersModal from './components/move-users-modal.vue';

const { t } = useI18n();
const { loading, setLoading } = useLoading();

// 部门树数据
type DepartmentTreeNode = DepartmentDto & {
  children?: DepartmentTreeNode[];
};

const departmentTree = ref<DepartmentTreeNode[]>([]);
const currentDept = ref<DepartmentTreeNode>();
const users = ref<UserModel[]>([]);
const selectedUserIds = ref<string[]>([]);

// 弹窗控制
const assignUsersVisible = ref(false);
const moveUsersVisible = ref(false);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 定义表格选择配置
const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
}));

// 递归查找部门节点
const findDepartment = (
  deptId: string,
  departments: DepartmentTreeNode[]
): DepartmentTreeNode | undefined => {
  const found = departments.find((dept) => dept.id === deptId);
  if (found) return found;

  return departments
    .filter((dept) => dept.children?.length)
    .reduce<DepartmentTreeNode | undefined>((result, dept) => {
      if (result) return result;
      return dept.children ? findDepartment(deptId, dept.children) : undefined;
    }, undefined);
};

// 加载部门用户
const loadDepartmentUsers = async () => {
  setLoading(true);
  try {
    const { list, total } = await departmentApi.getDepartmentUsers(currentDept.value?.id || '', {
      current: pagination.current,
      size: pagination.pageSize
    });
    users.value = list;
    pagination.total = total;
  } catch (err) {
    Message.error(t('organization.users.load.failed'));
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
  // 取消选中时清空数据
  if (!selectedKeys.length || !data.selected) {
    currentDept.value = undefined;
    users.value = [];
    pagination.total = 0;
    selectedUserIds.value = [];
    return;
  }

  const stringKeys = selectedKeys.map((key) => key.toString());
  const deptId = stringKeys[0];
  currentDept.value = findDepartment(deptId, departmentTree.value);

  // 重置分页并加载数据
  pagination.current = 1;
  selectedUserIds.value = [];
  await loadDepartmentUsers();
};

// 分页相关
const onPageChange = async (current: number) => {
  pagination.current = current;
  await loadDepartmentUsers();
};

const onPageSizeChange = async (pageSize: number) => {
  pagination.current = 1;
  pagination.pageSize = pageSize;
  await loadDepartmentUsers();
};

// 分配用户
const handleAssignUsers = () => {
  assignUsersVisible.value = true;
};

const handleAssignSuccess = () => {
  assignUsersVisible.value = false;
  loadDepartmentUsers();
};

// 移动用户
const handleMoveUsers = () => {
  if (!selectedUserIds.value.length) {
    Message.warning(t('organization.users.select.required'));
    return;
  }
  moveUsersVisible.value = true;
};

const handleMoveSuccess = () => {
  moveUsersVisible.value = false;
  loadDepartmentUsers();
};

// 移除用户
const handleRemoveUser = (user: UserModel) => {
  Modal.confirm({
    title: t('organization.users.remove.confirm.title'),
    content: t('organization.users.remove.confirm.content', { name: user.name || user.username }),
    onOk: async () => {
      try {
        await departmentApi.removeUsers({
          deptId: currentDept.value?.id || '',
          userIds: [user.id]
        });
        Message.success(t('organization.users.remove.success'));
        loadDepartmentUsers();
      } catch (err) {
        Message.error(t('organization.users.remove.failed'));
      }
    }
  });
};

// 初始化
onMounted(async () => {
  try {
    departmentTree.value = await departmentApi.getDepartmentTree();
  } catch (err) {
    Message.error(t('organization.tree.load.failed'));
  }
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
</style>
