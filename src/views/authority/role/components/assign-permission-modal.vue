<template>
  <a-modal
    :visible="visible"
    :title="t('authority.role.modal.title.assignPermission')"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="permission-transfer">
      <div class="transfer-box">
        <div class="box-header">
          <div class="header-content">
            {{ t('authority.role.permission.available') }}
            <a-button type="text" size="mini" @click="handleSelectAllAvailable">
              {{ t('common.selectAll') }}
            </a-button>
          </div>
        </div>
        <div class="box-content">
          <a-tree
            v-model:checked-keys="availableCheckedKeys"
            :data="convertToTreeData(availablePermissions)"
            checkable
            :check-strictly="false"
          />
        </div>
      </div>
      <div class="transfer-operation">
        <a-space direction="vertical">
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <icon-right />
            </template>
          </a-button>
          <a-button type="primary" @click="handleRemove">
            <template #icon>
              <icon-left />
            </template>
          </a-button>
        </a-space>
      </div>
      <div class="transfer-box">
        <div class="box-header">
          <div class="header-content">
            {{ t('authority.role.permission.current') }}
            <a-button type="text" size="mini" @click="handleSelectAllCurrent">
              {{ t('common.selectAll') }}
            </a-button>
          </div>
        </div>
        <div class="box-content">
          <a-tree
            v-model:checked-keys="checkedKeys"
            :data="convertToTreeData(currentPermissions)"
            checkable
            :check-strictly="false"
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TreeNodeData } from '@arco-design/web-vue';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconRight } from '@arco-design/web-vue/es/icon';
import type { RoleModel, SimplePermissionTreeNode } from '@/types/api/authority';
import { permissionsApi, roleApi } from '@/api/framework/authority';

const props = defineProps<{
  visible: boolean;
  roleId: number;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const currentPermissions = ref<SimplePermissionTreeNode[]>([]);
const availablePermissions = ref<SimplePermissionTreeNode[]>([]);
const checkedKeys = ref<number[]>([]);
const availableCheckedKeys = ref<number[]>([]);
const currentRole = ref<RoleModel>();
const assignedIds = ref<number[]>([]);
const allPermissions = ref<SimplePermissionTreeNode[]>([]);
const allPermissionIds = ref<number[]>([]);

// 构建树
const buildTree = (permissions: SimplePermissionTreeNode[], selectKeys: number[]) => {
  assignedIds.value = selectKeys;
  if (permissions.length > 0) {
    const allIds = permissions.map((item) => item.id);
    if (!selectKeys || selectKeys.length === 0) {
      availablePermissions.value = permissionsApi.buildFilteredTree(permissions, allIds);
      currentPermissions.value = [];
    } else {
      currentPermissions.value = permissionsApi.buildFilteredTree(permissions, selectKeys);
      const avIds = allIds.filter((id: number) => !selectKeys.includes(id));
      availablePermissions.value = permissionsApi.buildFilteredTree(permissions, avIds);
    }
  } else {
    availablePermissions.value = [];
    currentPermissions.value = [];
  }
};

// 修改加载权限数据的方法
const loadData = async () => {
  try {
    // 获取所有权限列表并转换为树形结构
    const allPerms = await permissionsApi.getAllList();
    allPermissions.value = allPerms;
    allPermissionIds.value = allPerms.map((item) => item.id);

    // 获取租户当前权限ID列表
    const role = await roleApi.getById(props.roleId);
    const currentPermIds = role.permIds;
    availableCheckedKeys.value = [];
    checkedKeys.value = [];
    buildTree(allPerms, currentPermIds);
  } catch (err) {
    Message.error(t('authority.tenant.permission.load.failed'));
  }
};

// 添加权限
const handleAdd = () => {
  if (!availableCheckedKeys.value.length) {
    Message.warning(t('authority.tenant.permission.select.required'));
    return;
  }
  const currentIds = [...assignedIds.value, ...availableCheckedKeys.value];
  buildTree(allPermissions.value, currentIds);
  // 清空选中状态
  availableCheckedKeys.value = [];
};
//
// 移除权限
const handleRemove = () => {
  if (!checkedKeys.value.length) {
    Message.warning(t('authority.tenant.permission.select.required'));
    return;
  }
  const currentIds = assignedIds.value.filter((item) => !checkedKeys.value.includes(item));
  buildTree(allPermissions.value, currentIds);
  // 清空选中状态
  checkedKeys.value = [];
};
// 全选可用权限
const handleSelectAllAvailable = () => {
  if (!availableCheckedKeys.value.length || availableCheckedKeys.value.length === 0) {
    availableCheckedKeys.value = allPermissionIds.value.filter(
      (item) => !assignedIds.value.includes(item)
    );
  } else {
    availableCheckedKeys.value = [];
  }
};

// 全选已分配权限
const handleSelectAllCurrent = () => {
  if (!checkedKeys.value.length || checkedKeys.value.length === 0) {
    checkedKeys.value = assignedIds.value;
  } else {
    checkedKeys.value = [];
  }
};

// 保存权限分配
const handleOk = async () => {
  try {
    // 获取所有已分配权限的父ID
    const selectedParentIds = permissionsApi.getAllParentIds(
      allPermissions.value,
      assignedIds.value
    );
    // 合并选中的ID和父节点ID
    const allIds = [...new Set([...assignedIds.value, ...selectedParentIds])];
    // 直接更新角色的权限
    await roleApi.assignPermission({
      role_id: props.roleId,
      ...currentRole.value,
      permission_ids: allIds
    });

    Message.success(t('authority.role.permission.assign.success'));
    emit('success');
    emit('update:visible', false);
  } catch (err) {
    Message.error(t('authority.role.permission.assign.failed'));
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};

const convertToTreeData = (permissions: SimplePermissionTreeNode[]): TreeNodeData[] => {
  return permissions.map((perm) => ({
    key: perm.id,
    title: perm.name,
    children: perm.children ? convertToTreeData(perm.children) : undefined
  }));
};

onMounted(() => {
  if (props.visible) {
    loadData();
  }
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadData();
    }
  }
);
</script>

<style scoped lang="less">
.permission-transfer {
  display: flex;
  height: 500px;

  .transfer-box {
    flex: 1;
    border: 1px solid var(--color-neutral-3);
    border-radius: 4px;

    .box-header {
      padding: 10px;
      font-weight: 500;
      border-bottom: 1px solid var(--color-neutral-3);

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }

    .box-content {
      height: calc(100% - 41px);
      padding: 10px;
      overflow: auto;
    }
  }

  .transfer-operation {
    display: flex;
    align-items: center;
    padding: 0 16px;
  }
}
</style>
