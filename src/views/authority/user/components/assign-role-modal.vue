<template>
  <a-modal
    :visible="visible"
    :title="t('authority.user.modal.title.assignRole')"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="role-transfer">
      <!-- 资源角色选择 -->
      <div class="role-section">
        <div class="section-title">{{ t('authority.user.role.section.resource') }}</div>
        <div class="transfer-container">
          <div class="transfer-box">
            <div class="box-header">
              {{ t('authority.user.role.available') }}
            </div>
            <div class="box-content">
              <a-checkbox-group
                v-model="availableResourceRoleKeys"
                :options="
                  availableResourceRoles.map((role) => ({
                    label: role.name,
                    value: role.id
                  }))
                "
              />
            </div>
          </div>
          <div class="transfer-operation">
            <a-space direction="vertical">
              <a-button type="primary" @click="handleAddResourceRole">
                <template #icon>
                  <icon-right />
                </template>
              </a-button>
              <a-button type="primary" @click="handleRemoveResourceRole">
                <template #icon>
                  <icon-left />
                </template>
              </a-button>
            </a-space>
          </div>
          <div class="transfer-box">
            <div class="box-header">
              {{ t('authority.user.role.current') }}
            </div>
            <div class="box-content">
              <a-checkbox-group
                v-model="currentResourceRoleKeys"
                :options="
                  currentResourceRoles.map((role) => ({
                    label: role.name,
                    value: role.id
                  }))
                "
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 数据权限角色选择 -->
      <div class="role-section">
        <div class="section-title">{{ t('authority.user.role.section.data') }}</div>
        <div class="transfer-container">
          <div class="transfer-box">
            <div class="box-header">
              {{ t('authority.user.role.available') }}
            </div>
            <div class="box-content">
              <a-checkbox-group
                v-model="availableDataRoleKeys"
                :options="
                  availableDataRoles.map((role) => ({
                    label: role.name,
                    value: role.id
                  }))
                "
              />
            </div>
          </div>
          <div class="transfer-operation">
            <a-space direction="vertical">
              <a-button type="primary" @click="handleAddDataRole">
                <template #icon>
                  <icon-right />
                </template>
              </a-button>
              <a-button type="primary" @click="handleRemoveDataRole">
                <template #icon>
                  <icon-left />
                </template>
              </a-button>
            </a-space>
          </div>
          <div class="transfer-box">
            <div class="box-header">
              {{ t('authority.user.role.current') }}
            </div>
            <div class="box-content">
              <a-checkbox-group
                v-model="currentDataRoleKeys"
                :options="
                  currentDataRoles.map((role) => ({
                    label: role.name,
                    value: role.id
                  }))
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconRight } from '@arco-design/web-vue/es/icon';
import type { RoleModel, UserModel } from '@/types/api/authority';
import { roleApi, userApi } from '@/api/framework/authority';

const props = defineProps<{
  visible: boolean;
  userId: string;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const currentRoles = ref<RoleModel[]>([]);
const availableRoles = ref<RoleModel[]>([]);
const checkedKeys = ref<number[]>([]);
const availableCheckedKeys = ref<number[]>([]);
const allRoles = ref<RoleModel[]>([]);
const currentUser = ref<UserModel>();

// 资源角色相关
const currentResourceRoles = ref<RoleModel[]>([]);
const availableResourceRoles = ref<RoleModel[]>([]);
const currentResourceRoleKeys = ref<number[]>([]);
const availableResourceRoleKeys = ref<number[]>([]);

// 数据权限角色相关
const currentDataRoles = ref<RoleModel[]>([]);
const availableDataRoles = ref<RoleModel[]>([]);
const currentDataRoleKeys = ref<number[]>([]);
const availableDataRoleKeys = ref<number[]>([]);

// 加载数据
const loadData = async () => {
  try {
    // 获取用户最新详情
    const userDetail = await userApi.getById(props.userId);
    currentUser.value = userDetail;

    // 获取所有可用角色
    const allEnabledRoles = await roleApi.getAllEnabled();

    // 当前用户已分配的角色ID集合
    const currentRoleIds = new Set(userDetail.roleIds || []);

    // 按角色类型分类
    currentResourceRoles.value = allEnabledRoles.filter(
      (role) => role.type === 1 && currentRoleIds.has(role.id)
    );
    availableResourceRoles.value = allEnabledRoles.filter(
      (role) => role.type === 1 && !currentRoleIds.has(role.id)
    );
    currentDataRoles.value = allEnabledRoles.filter(
      (role) => role.type === 2 && currentRoleIds.has(role.id)
    );
    availableDataRoles.value = allEnabledRoles.filter(
      (role) => role.type === 2 && !currentRoleIds.has(role.id)
    );
  } catch (err) {
    Message.error(t('authority.user.role.load.failed'));
  }
};

// 处理添加资源角色
const handleAddResourceRole = () => {
  if (!availableResourceRoleKeys.value.length) {
    Message.warning(t('authority.user.role.select.required'));
    return;
  }

  const selectedRoles = availableResourceRoles.value.filter((role) =>
    availableResourceRoleKeys.value.includes(role.id)
  );

  currentResourceRoles.value = [...currentResourceRoles.value, ...selectedRoles];
  availableResourceRoles.value = availableResourceRoles.value.filter(
    (role) => !availableResourceRoleKeys.value.includes(role.id)
  );

  availableResourceRoleKeys.value = [];
};

// 处理移除资源角色
const handleRemoveResourceRole = () => {
  if (!currentResourceRoleKeys.value.length) {
    Message.warning(t('authority.user.role.select.required'));
    return;
  }

  const selectedRoles = currentResourceRoles.value.filter((role) =>
    currentResourceRoleKeys.value.includes(role.id)
  );

  availableResourceRoles.value = [...availableResourceRoles.value, ...selectedRoles];
  currentResourceRoles.value = currentResourceRoles.value.filter(
    (role) => !currentResourceRoleKeys.value.includes(role.id)
  );

  currentResourceRoleKeys.value = [];
};

// 处理添加数据权限角色
const handleAddDataRole = () => {
  if (!availableDataRoleKeys.value.length) {
    Message.warning(t('authority.user.role.select.required'));
    return;
  }

  const selectedRoles = availableDataRoles.value.filter((role) =>
    availableDataRoleKeys.value.includes(role.id)
  );

  currentDataRoles.value = [...currentDataRoles.value, ...selectedRoles];
  availableDataRoles.value = availableDataRoles.value.filter(
    (role) => !availableDataRoleKeys.value.includes(role.id)
  );

  availableDataRoleKeys.value = [];
};

// 处理移除数据权限角色
const handleRemoveDataRole = () => {
  if (!currentDataRoleKeys.value.length) {
    Message.warning(t('authority.user.role.select.required'));
    return;
  }

  const selectedRoles = currentDataRoles.value.filter((role) =>
    currentDataRoleKeys.value.includes(role.id)
  );

  availableDataRoles.value = [...availableDataRoles.value, ...selectedRoles];
  currentDataRoles.value = currentDataRoles.value.filter(
    (role) => !currentDataRoleKeys.value.includes(role.id)
  );

  currentDataRoleKeys.value = [];
};

// 保存角色分配
const handleOk = async () => {
  try {
    const roleIds = [
      ...currentResourceRoles.value.map((role) => role.id),
      ...currentDataRoles.value.map((role) => role.id)
    ];

    await userApi.assignRole({
      userId: props.userId,
      roleIds
    });

    Message.success(t('authority.user.role.assign.success'));
    emit('success');
    emit('update:visible', false);
  } catch (err) {
    Message.error(t('authority.user.role.assign.failed'));
  }
};

const handleCancel = () => {
  emit('update:visible', false);
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
.role-transfer {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .role-section {
    .section-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }

    .transfer-container {
      display: flex;
      height: 300px;

      .transfer-box {
        flex: 1;
        border: 1px solid var(--color-neutral-3);
        border-radius: 4px;

        .box-header {
          padding: 10px;
          font-weight: 500;
          border-bottom: 1px solid var(--color-neutral-3);
        }

        .box-content {
          height: calc(100% - 41px);
          padding: 10px;
          overflow: auto;

          :deep(.arco-checkbox-group) {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
        }
      }

      .transfer-operation {
        display: flex;
        align-items: center;
        padding: 0 16px;
      }
    }
  }
}
</style>
