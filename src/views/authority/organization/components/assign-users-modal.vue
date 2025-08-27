<template>
  <a-modal
    :visible="visible"
    :title="t('organization.users.assign.title')"
    :width="1000"
    @cancel="handleCancel"
    @ok="handleAssign"
  >
    <div class="assign-users">
      <!-- 搜索表单 -->
      <a-form
        :model="searchForm"
        class="search-form"
        label-align="left"
        :style="{ marginBottom: '16px' }"
      >
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="username" :label="t('organization.users.search.username')">
              <a-input
                v-model="searchForm.username"
                :placeholder="t('organization.users.search.username.placeholder')"
                allow-clear
                @press-enter="handleSearch"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="name" :label="t('organization.users.search.name')">
              <a-input
                v-model="searchForm.name"
                :placeholder="t('organization.users.search.name.placeholder')"
                allow-clear
                @press-enter="handleSearch"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                {{ t('organization.users.button.search') }}
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                {{ t('organization.users.button.reset') }}
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>

      <!-- 用户表格 -->
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
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
import type { UserModel } from '@/types/api/framework/authority';
import { departmentApi } from '@/api/framework/department';
import useLoading from '@/hooks/loading';

const props = defineProps<{
  visible: boolean;
  deptId?: string;
}>();

const emit = defineEmits(['update:visible', 'success']);

const { t } = useI18n();
const { loading, setLoading } = useLoading();
const users = ref<UserModel[]>([]);
const selectedUserIds = ref<string[]>([]);

// 搜索表单
const searchForm = reactive({
  username: '',
  name: ''
});

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

// 加载数据
const loadData = async () => {
  setLoading(true);
  try {
    const { list, total } = await departmentApi.getUnassignedUsers({
      current: pagination.current,
      size: pagination.pageSize,
      ...searchForm
    });
    users.value = list;
    pagination.total = total;
  } catch (err) {
    Message.error(t('organization.users.load.failed'));
  } finally {
    setLoading(false);
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.username = '';
  searchForm.name = '';
  pagination.current = 1;
  loadData();
};

// 分页相关
const onPageChange = async (current: number) => {
  pagination.current = current;
  await loadData();
};

const onPageSizeChange = async (pageSize: number) => {
  pagination.current = 1;
  pagination.pageSize = pageSize;
  await loadData();
};

// 分配用户
const handleAssign = async () => {
  if (!selectedUserIds.value.length) {
    Message.warning(t('organization.users.assign.select.required'));
    return;
  }

  try {
    await departmentApi.assignUsers({
      deptId: props.deptId || '',
      userIds: selectedUserIds.value
    });
    Message.success(t('organization.users.assign.success'));
    emit('success');
    emit('update:visible', false);
  } catch (err) {
    Message.error(t('organization.users.assign.failed'));
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
      // 重置数据
      searchForm.username = '';
      searchForm.name = '';
      selectedUserIds.value = [];
      pagination.current = 1;
      loadData();
    }
  }
);
</script>

<style scoped lang="less">
.assign-users {
  .search-form {
    :deep(.arco-form-item) {
      margin-bottom: 0;
    }
  }
}
</style>
