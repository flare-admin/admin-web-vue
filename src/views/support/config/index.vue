<template>
  <div class="container">
    <Breadcrumb :items="['menu.config']" />

    <!-- 快速操作区域 -->
    <a-card class="quick-actions-card" :title="t('config.quickActions.title')">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-button
            type="outline"
            size="small"
            class="quick-action-btn"
            @click="handleQuickAddGroup"
          >
            <template #icon>
              <icon-plus />
            </template>
            {{ t('config.quickActions.addGroup') }}
          </a-button>
        </a-col>
        <a-col :span="8">
          <a-button
            type="outline"
            size="small"
            class="quick-action-btn"
            @click="handleQuickAddConfig"
          >
            <template #icon>
              <icon-plus />
            </template>
            {{ t('config.quickActions.addConfig') }}
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 主要功能区域 -->
    <a-card class="config-card">
      <template #title>
        <div class="card-title">
          <span>{{ t('config.group.title') }}</span>
          <a-space>
            <a-button type="primary" @click="handleAddGroup">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('config.group.create') }}
            </a-button>
          </a-space>
        </div>
      </template>

      <!-- 搜索表单 -->
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
                <a-form-item field="name" :label="t('config.search.name')">
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="t('config.search.namePlaceholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="code" :label="t('config.search.code')">
                  <a-input
                    v-model="searchForm.code"
                    :placeholder="t('config.search.codePlaceholder')"
                    allow-clear
                  />
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
              {{ t('config.operation.search') }}
            </a-button>
            <a-button @click="resetSearch">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('config.operation.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 分组列表 -->
      <a-table
        :data="groupList"
        :loading="groupLoading"
        :pagination="groupPagination"
        @page-change="onGroupPageChange"
        @page-size-change="onGroupPageSizeChange"
      >
        <template #columns>
          <a-table-column :title="t('config.table.groupCode')" data-index="code" :width="180" />
          <a-table-column :title="t('config.table.groupName')" data-index="name" :width="150" />
          <a-table-column
            :title="t('config.table.description')"
            data-index="description"
            :width="200"
          />
          <a-table-column :title="t('config.table.status')" data-index="status" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.is_enabled  ? 'green' : 'red'">
                {{ record.is_enabled ? t('config.status.enabled') : t('config.status.disabled') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('config.table.sort')" data-index="sort" :width="80" />
          <a-table-column
            :title="t('config.table.createdAt')"
            data-index="createdAt"
            :width="160"
          />
          <a-table-column :title="t('config.table.operations')" :width="250" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleManageConfigs(record)">
                  {{ t('config.operation.manageConfigs') }}
                </a-button>
                <a-button type="text" size="small" @click="handleEditGroup(record)">
                  {{ t('config.operation.edit') }}
                </a-button>
                <a-button type="text" size="small" @click="handleToggleGroupStatus(record)">
                  {{
                    record.is_enabled
                      ? t('config.operation.disable')
                      : t('config.operation.enable')
                  }}
                </a-button>
                <a-popconfirm
                  :content="t('config.operation.deleteConfirm')"
                  @ok="handleDeleteGroup(record.id)"
                >
                  <a-button type="text" size="small" status="danger">
                    {{ t('config.operation.delete') }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 配置管理抽屉 -->
    <a-drawer
      v-model:visible="configDrawerVisible"
      :title="`配置管理 - ${selectedGroup?.name || ''}`"
      :width="800"
      placement="right"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAddConfig">
            <template #icon>
              <icon-plus />
            </template>
            {{ t('config.operation.create') }}
          </a-button>
          <a-button @click="handleBatchUpdate">
            <template #icon>
              <icon-edit />
            </template>
            {{ t('config.quickActions.batchUpdate') }}
          </a-button>
        </a-space>
      </template>

      <!-- 配置列表 -->
      <a-table
        :data="configList"
        :loading="configLoading"
      >
        <template #columns>
  
          <a-table-column :title="t('config.table.key')" data-index="key" :width="180" />
          <a-table-column :title="t('config.table.name')" data-index="name" :width="150" />
          <a-table-column :title="t('config.table.type')" data-index="type" :width="100" />
          <a-table-column :title="t('config.table.value')" data-index="value" :width="200" />
          <a-table-column
            :title="t('config.table.description')"
            data-index="description"
            :width="200"
          />
          <a-table-column :title="t('config.table.status')" data-index="is_enabled" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.is_enabled ? 'green' : 'red'">
                {{ record.is_enabled ? t('config.status.enabled') : t('config.status.disabled') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('config.table.sort')" data-index="sort" :width="80" />
          <a-table-column :title="t('config.table.operations')" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditConfig(record)">
                  {{ t('config.operation.edit') }}
                </a-button>
                <a-button type="text" size="small" @click="handleToggleConfigStatus(record)">
                  {{
                    record.is_enabled
                      ? t('config.operation.disable')
                      : t('config.operation.enable')
                  }}
                </a-button>
                <a-popconfirm
                  :content="t('config.operation.deleteConfirm')"
                  @ok="handleDeleteConfig(record.id)"
                >
                  <a-button type="text" size="small" status="danger">
                    {{ t('config.operation.delete') }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-drawer>

    <!-- 配置表单弹窗 -->
    <SharedConfigForm
      v-model:visible="configModalVisible"
      :config="currentConfig"
      :groups="groupOptions"
      :default-group-id="selectedGroup?.id"
      @success="handleConfigSuccess"
    />

    <!-- 分组表单弹窗 -->
    <GroupFormModal
      v-model:visible="groupModalVisible"
      :group="currentGroup"
      @success="handleGroupSuccess"
    />

    <!-- 批量更新弹窗 -->
    <BatchUpdateModal
      v-model:visible="batchUpdateModalVisible"
      :configs="selectedConfigs"
      @success="handleBatchUpdateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useI18n } from '@/locale/useI18n';
import Breadcrumb from '@/components/breadcrumb/index.vue';
import configApi from '@/api/support/config';
import type { Config, ConfigGroup } from '@/types/api/support/config';
import SharedConfigForm from './components/SharedConfigForm.vue';
import GroupFormModal from './components/GroupFormModal.vue';
import BatchUpdateModal from './components/BatchUpdateModal.vue';

const { t } = useI18n();

// 响应式数据
const groupLoading = ref(false);
const configList = ref<Config[]>([]);
const groupList = ref<ConfigGroup[]>([]);
const configModalVisible = ref(false);
const groupModalVisible = ref(false);
const batchUpdateModalVisible = ref(false);
const configDrawerVisible = ref(false);
const currentConfig = ref<Config | null>(null);
const currentGroup = ref<ConfigGroup | null>(null);
const selectedGroup = ref<ConfigGroup | null>(null);
const selectedConfigs = ref<Config[]>([]);
const configLoading = ref(false);

// 搜索表单
const searchForm = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  code: ''
});

// 分页
const groupPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 计算属性
const groupOptions = computed(() => {
  return groupList.value.filter((group) => group.is_enabled);
});

// 方法
const loadConfigs = async (groupId: string) => {
  configLoading.value = true;
  try {
    const response = await configApi.getConfigsByGroupId(groupId);
    configList.value = response;
  } catch (error) {
    Message.error('加载配置列表失败');
  } finally {
    configLoading.value = false;
  }
};

const loadGroups = async () => {
  groupLoading.value = true;
  try {
    const response = await configApi.getGroupList({
      pageNum: groupPagination.current,
      pageSize: groupPagination.pageSize,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined
    });
    groupList.value = response.list;
    groupPagination.total = response.total;
  } catch (error) {
    Message.error('加载分组列表失败');
  } finally {
    groupLoading.value = false;
  }
};

const search = () => {
  searchForm.pageNum = 1;
  loadGroups();
};

const resetSearch = () => {
  Object.assign(searchForm, {
    pageNum: 1,
    pageSize: 10,
    name: '',
    code: ''
  });
  search();
};

const onGroupPageChange = (page: number) => {
  searchForm.pageNum = page;
  groupPagination.current = page;
  loadGroups();
};

const onGroupPageSizeChange = (pageSize: number) => {
  searchForm.pageSize = pageSize;
  groupPagination.pageSize = pageSize;
  groupPagination.current = 1;
  searchForm.pageNum = 1;
  loadGroups();
};

// 配置操作
const handleAddConfig = () => {
  if (!selectedGroup.value) {
    Message.warning('请先选择配置分组');
    return;
  }
  currentConfig.value = {
    id: '',
    groupId: selectedGroup.value.id,
    key: '',
    value: '',
    name: '',
    description: '',
    is_enabled: true,
    sort: 0,
    createdAt: '',
    updatedAt: ''
  };
  configModalVisible.value = true;
};

const handleEditConfig = (config: Config) => {
  currentConfig.value = { ...config };
  configModalVisible.value = true;
};

const handleDeleteConfig = async (id: string) => {
  try {
    await configApi.deleteConfig(id);
    Message.success('删除配置成功');
    if (selectedGroup.value) {
      loadConfigs(selectedGroup.value.id);
    }
  } catch (error) {
    Message.error('删除配置失败');
  }
};

const handleToggleConfigStatus = async (config: Config) => {
  try {
    await configApi.updateConfigStatus({
      id: config.id,
      is_enabled: config.is_enabled
    });
    Message.success('更新状态成功');
    if (selectedGroup.value) {
      loadConfigs(selectedGroup.value.id);
    }
  } catch (error) {
    Message.error('更新状态失败');
  }
};

const handleToggleGroupStatus = async (group: ConfigGroup) => {
  try {
    await configApi.updateGroupStatus({
      id: group.id,
      is_enabled: group.is_enabled
    });
    Message.success('更新状态成功');
    loadGroups();
  } catch (error) {
    Message.error('更新状态失败');
  }
};

const handleConfigSuccess = () => {
  configModalVisible.value = false;
  if (selectedGroup.value) {
    loadConfigs(selectedGroup.value.id);
  }
};

const handleManageConfigs = (group: ConfigGroup) => {
  selectedGroup.value = group;
  configDrawerVisible.value = true;
  loadConfigs(group.id);
};

// 分组操作
const handleAddGroup = () => {
  currentGroup.value = null;
  groupModalVisible.value = true;
};

const handleEditGroup = (group: ConfigGroup) => {
  currentGroup.value = { ...group };
  groupModalVisible.value = true;
};

const handleDeleteGroup = async (id: string) => {
  try {
    await configApi.deleteGroup(id);
    Message.success('删除分组成功');
    loadGroups();
  } catch (error) {
    Message.error('删除分组失败');
  }
};

const handleGroupSuccess = () => {
  groupModalVisible.value = false;
  loadGroups();
};

// 快速操作
const handleQuickAddGroup = () => {
  handleAddGroup();
};

const handleQuickAddConfig = () => {
  if (groupList.value.length === 0) {
    Message.warning('请先创建配置分组');
    return;
  }
  // 快速新增配置时，让用户选择分组
  currentConfig.value = null;
  configModalVisible.value = true;
};

const handleBatchUpdate = () => {
  selectedConfigs.value = configList.value.filter((config) => config.is_enabled);
  if (selectedConfigs.value.length === 0) {
    Message.warning('没有可编辑的配置');
    return;
  }
  batchUpdateModalVisible.value = true;
};

const handleBatchUpdateSuccess = () => {
  batchUpdateModalVisible.value = false;
  if (selectedGroup.value) {
    loadConfigs(selectedGroup.value.id);
  }
  Message.success('批量更新成功');
};

// 生命周期
onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-title {
  font-size: 16px;
  font-weight: 500;
}

.drawer-actions {
  display: flex;
  gap: 8px;
}
</style>

<style scoped>
.container {
  padding: 20px;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-action-btn {
  width: 100%;
}

.config-card {
  margin-bottom: 20px;
}

.group-card {
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
