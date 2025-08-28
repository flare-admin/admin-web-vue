<template>
  <div class="container">
    <Breadcrumb :items="['menu.dictionary']" />

    <!-- 快速操作区域 -->
    <a-card class="quick-actions-card" :title="t('dictionary.quickActions.title')">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-button
            type="outline"
            size="small"
            class="quick-action-btn"
            @click="handleQuickAddCategory"
          >
            <template #icon>
              <icon-plus />
            </template>
            {{ t('dictionary.quickActions.addCategory') }}
          </a-button>
        </a-col>
        <a-col :span="8">
          <a-button
            type="outline"
            size="small"
            class="quick-action-btn"
            @click="handleQuickAddOption"
          >
            <template #icon>
              <icon-plus />
            </template>
            {{ t('dictionary.quickActions.addOption') }}
          </a-button>
        </a-col>
        <a-col :span="8">
          <a-button type="outline" size="small" class="quick-action-btn" @click="handleImportData">
            <template #icon>
              <icon-upload />
            </template>
            {{ t('dictionary.quickActions.import') }}
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 主要功能区域 -->
    <a-card class="dictionary-card">
      <template #title>
        <div class="card-title">
          <span>{{ t('dictionary.title') }}</span>
          <a-space>
            <a-button type="primary" @click="handleAddCategory">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('dictionary.category.create') }}
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
                <a-form-item field="id" :label="t('dictionary.search.id')">
                  <a-input
                    v-model="searchForm.id"
                    :placeholder="t('dictionary.search.id')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="name" :label="t('dictionary.search.name')">
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="t('dictionary.search.name')"
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
              {{ t('dictionary.operation.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('dictionary.operation.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />

      <!-- 分类列表 -->
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column :title="t('dictionary.table.id')" data-index="id" :width="180" />
          <a-table-column :title="t('dictionary.table.name')" data-index="name" :width="180" />
          <a-table-column
            :title="t('dictionary.table.description')"
            data-index="description"
            :min-width="180"
          />
          <a-table-column
            :title="t('dictionary.table.i18nKey')"
            data-index="i18nKey"
            :width="180"
          />
          <a-table-column :title="t('dictionary.table.createdAt')" data-index="createdAt" :width="180">
            <template #cell="{ record }">
              {{ formatTimestamp(record.createdAt) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('dictionary.table.operations')"
            data-index="operations"
            :width="120"
          >
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="mini" @click="handleEditCategory(record)">
                  <template #icon>
                    <icon-edit />
                  </template>
                  {{ t('dictionary.operation.edit') }}
                </a-button>
                <a-button type="primary" size="mini" @click="handleManageOptions(record)">
                  <template #icon>
                    <icon-settings />
                  </template>
                  {{ t('dictionary.preview.manageOptions') }}
                </a-button>
                <a-button
                  type="text"
                  size="mini"
                  status="danger"
                  @click="handleDeleteCategory(record)"
                >
                  <template #icon>
                    <icon-delete />
                  </template>
                  {{ t('dictionary.operation.delete') }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 快速添加分类对话框 -->
    <a-modal
      v-model:visible="quickCategoryModalVisible"
      :title="t('dictionary.quickActions.addCategory')"
      @ok="handleQuickCategoryOk"
      @cancel="handleQuickCategoryCancel"
    >
      <a-form ref="quickCategoryFormRef" :model="quickCategoryForm" layout="vertical">
        <a-form-item
          field="id"
          :label="t('dictionary.category.id')"
          :rules="[{ required: true, message: t('dictionary.category.idRequired') }]"
        >
          <a-input
            v-model="quickCategoryForm.id"
            :placeholder="t('dictionary.category.idPlaceholder')"
            @change="handleQuickIdChange"
          />
        </a-form-item>
        <a-form-item
          field="name"
          :label="t('dictionary.category.name')"
          :rules="[{ required: true, message: t('dictionary.category.nameRequired') }]"
        >
          <a-input
            v-model="quickCategoryForm.name"
            :placeholder="t('dictionary.category.namePlaceholder')"
          />
        </a-form-item>
        <a-form-item field="description" :label="t('dictionary.category.description')">
          <a-textarea
            v-model="quickCategoryForm.description"
            :placeholder="t('dictionary.category.descriptionPlaceholder')"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分类管理模态框 -->
    <a-modal
      v-model:visible="categoryModalVisible"
      :title="categoryModalTitle"
      @ok="handleCategoryModalOk"
      @cancel="handleCategoryModalCancel"
    >
      <a-form ref="categoryFormRef" :model="categoryForm" layout="vertical">
        <a-form-item
          field="id"
          :label="t('dictionary.category.id')"
          :rules="[{ required: true, message: t('dictionary.category.idRequired') }]"
        >
          <a-input
            v-model="categoryForm.id"
            :placeholder="t('dictionary.category.idPlaceholder')"
            :disabled="isEditMode"
            @change="handleIdChange"
          />
        </a-form-item>
        <a-form-item
          field="name"
          :label="t('dictionary.category.name')"
          :rules="[{ required: true, message: t('dictionary.category.nameRequired') }]"
        >
          <a-input
            v-model="categoryForm.name"
            :placeholder="t('dictionary.category.namePlaceholder')"
          />
        </a-form-item>
        <a-form-item field="i18nKey" :label="t('dictionary.category.i18nKey')">
          <a-input
            v-model="categoryForm.i18nKey"
            :placeholder="t('dictionary.category.i18nKeyPlaceholder')"
            readonly
          />
        </a-form-item>
        <a-form-item field="description" :label="t('dictionary.category.description')">
          <a-textarea
            v-model="categoryForm.description"
            :placeholder="t('dictionary.category.descriptionPlaceholder')"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 快速添加选项对话框 -->
    <a-modal
      v-model:visible="quickOptionModalVisible"
      :title="t('dictionary.quickActions.addOption')"
      @ok="handleQuickOptionOk"
      @cancel="handleQuickOptionCancel"
    >
      <a-form ref="quickOptionFormRef" :model="quickOptionForm" layout="vertical">
        <a-form-item
          field="categoryId"
          :label="t('dictionary.option.categoryId')"
          :rules="[{ required: true, message: t('dictionary.option.categoryIdRequired') }]"
        >
          <a-select
            v-model="quickOptionForm.categoryId"
            :placeholder="t('dictionary.option.categoryIdRequired')"
          >
            <a-option
              v-for="category in categoryList"
              :key="category.id"
              :value="category.id"
              :label="category.name"
            />
          </a-select>
        </a-form-item>
        <a-form-item
          field="label"
          :label="t('dictionary.option.label')"
          :rules="[{ required: true, message: t('dictionary.option.labelRequired') }]"
        >
          <a-input
            v-model="quickOptionForm.label"
            :placeholder="t('dictionary.option.labelPlaceholder')"
          />
        </a-form-item>
        <a-form-item
          field="value"
          :label="t('dictionary.option.value')"
          :rules="[{ required: true, message: t('dictionary.option.valueRequired') }]"
        >
          <a-input
            v-model="quickOptionForm.value"
            :placeholder="t('dictionary.option.valuePlaceholder')"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 选项管理抽屉 -->
    <a-drawer
      v-model:visible="optionsDrawerVisible"
      :title="`${t('dictionary.option.title')} - ${selectedCategory?.name || ''}`"
      width="800px"
      placement="right"
    >
      <div v-if="selectedCategory" class="options-drawer-content">
        <OptionManagement
          :category-id="selectedCategory.id"
          :visible="optionsDrawerVisible"
          @refresh="fetchData"
        />
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import {
  IconPlus,
  IconUpload,
  IconEdit,
  IconDelete,
  IconSettings,
  IconSearch,
  IconRefresh
} from '@arco-design/web-vue/es/icon';
import Breadcrumb from '@/components/breadcrumb/index.vue';
import dictionaryApi from '@/api/support/dictionary';
import type { DictionaryCategory } from '@/types/api/support/dictionary';
import { formatTimestamp } from '@/filters/date';
import OptionManagement from './components/OptionManagement.vue';

const { t } = useI18n();

// 搜索表单
const searchForm = reactive({
  id: '',
  name: '',
  i18nKey: ''
});

// 分页数据
const renderData = ref<DictionaryCategory[]>([]);
const loading = ref(false);

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 分类列表（用于快速添加选项）
const categoryList = ref<DictionaryCategory[]>([]);

// 分类管理模态框
const categoryModalVisible = ref(false);
const categoryModalTitle = ref('');
const categoryFormRef = ref();
const categoryForm = reactive({
  id: '',
  name: '',
  i18nKey: '',
  description: ''
});
const isEditMode = ref(false);

// 快速添加分类
const quickCategoryModalVisible = ref(false);
const quickCategoryFormRef = ref();
const quickCategoryForm = reactive({
  id: '',
  name: '',
  description: ''
});

// 快速添加选项
const quickOptionModalVisible = ref(false);
const quickOptionFormRef = ref();
const quickOptionForm = reactive({
  categoryId: '',
  label: '',
  value: ''
});

// 选项管理抽屉
const optionsDrawerVisible = ref(false);
const selectedCategory = ref<DictionaryCategory | null>(null);

// 加载分类数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await dictionaryApi.getCategoryList({
      current: pagination.current,
      size: pagination.pageSize,
      id: searchForm.id || undefined,
      name: searchForm.name || undefined,
      i18nKey: searchForm.i18nKey || undefined
    });
    renderData.value = res.list;
    pagination.total = res.total;
    categoryList.value = res.list;
  } catch (err) {
    Message.error(t('dictionary.category.loadError'));
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

// 搜索
const search = () => {
  pagination.current = 1;
  fetchData();
};

// 重置搜索
const reset = () => {
  searchForm.id = '';
  searchForm.name = '';
  searchForm.i18nKey = '';
  search();
};

// 新增分类
const handleAddCategory = () => {
  categoryModalVisible.value = true;
  categoryModalTitle.value = t('dictionary.category.create');
  categoryForm.id = '';
  categoryForm.name = '';
  categoryForm.i18nKey = '';
  categoryForm.description = '';
  isEditMode.value = false;
};

// 编辑分类
const handleEditCategory = (record: DictionaryCategory) => {
  categoryModalVisible.value = true;
  categoryModalTitle.value = t('dictionary.category.edit');
  categoryForm.id = record.id;
  categoryForm.name = record.name;
  categoryForm.i18nKey = record.i18nKey;
  categoryForm.description = record.description || '';
  isEditMode.value = true;
};

// 删除分类
const handleDeleteCategory = async (record: DictionaryCategory) => {
  try {
    await dictionaryApi.deleteCategory(record.id);
    Message.success(t('dictionary.category.deleteSuccess'));
    fetchData();
  } catch (err) {
    Message.error(t('dictionary.category.deleteError'));
  }
};

// 快速添加分类
const handleQuickAddCategory = () => {
  quickCategoryModalVisible.value = true;
  quickCategoryForm.id = '';
  quickCategoryForm.name = '';
  quickCategoryForm.description = '';
};

// 快速添加选项
const handleQuickAddOption = () => {
  if (categoryList.value.length === 0) {
    Message.warning(t('dictionary.tip.selectCategory'));
    return;
  }
  quickOptionModalVisible.value = true;
  quickOptionForm.categoryId = '';
  quickOptionForm.label = '';
  quickOptionForm.value = '';
};

// 导入数据
const handleImportData = () => {
  Message.info(t('dictionary.quickActions.importComingSoon'));
};

// 管理选项
const handleManageOptions = async (category: DictionaryCategory) => {
  selectedCategory.value = category;
  optionsDrawerVisible.value = true;
};

// 快速添加分类确认
const handleQuickCategoryOk = async () => {
  try {
    await quickCategoryFormRef.value?.validate();

    await dictionaryApi.createCategory({
      id: quickCategoryForm.id,
      name: quickCategoryForm.name,
      i18nKey: `dictionary.${quickCategoryForm.id}`,
      description: quickCategoryForm.description
    });

    Message.success(t('dictionary.category.createSuccess'));
    quickCategoryModalVisible.value = false;
    fetchData();
  } catch (err) {
    // 验证失败或其他错误
  }
};

// 快速添加选项确认
const handleQuickOptionOk = async () => {
  try {
    await quickOptionFormRef.value?.validate();

    // 自动生成国际化键
    const i18nKey = `dictionary.${quickOptionForm.categoryId}.option.${quickOptionForm.value}`;

    await dictionaryApi.createOption({
      categoryId: quickOptionForm.categoryId,
      label: quickOptionForm.label,
      value: quickOptionForm.value,
      i18nKey,
      sort: 0,
      status: 1,
      remark: ''
    });

    Message.success(t('dictionary.option.createSuccess'));
    quickOptionModalVisible.value = false;
    fetchData();
  } catch (err) {
    // 验证失败或其他错误
  }
};

// 取消快速添加分类
const handleQuickCategoryCancel = () => {
  quickCategoryModalVisible.value = false;
  quickCategoryFormRef.value?.resetFields();
};

// 当ID变化时自动生成国际化键
const handleIdChange = (id: string) => {
  if (id && !isEditMode.value) {
    categoryForm.i18nKey = `dictionary.${id}`;
  }
};

// 快速添加分类时ID变化处理
const handleQuickIdChange = (id: string) => {
  // 这里可以添加快速添加时的ID验证逻辑
};

// 分类管理模态框确认
const handleCategoryModalOk = async () => {
  try {
    await categoryFormRef.value?.validate();

    if (isEditMode.value) {
      // 编辑分类
      await dictionaryApi.updateCategory({
        id: categoryForm.id,
        name: categoryForm.name,
        i18nKey: categoryForm.i18nKey,
        description: categoryForm.description
      });
      Message.success(t('dictionary.category.updateSuccess'));
    } else {
      // 新增分类
      await dictionaryApi.createCategory({
        id: categoryForm.id,
        name: categoryForm.name,
        i18nKey: categoryForm.i18nKey,
        description: categoryForm.description
      });
      Message.success(t('dictionary.category.createSuccess'));
    }

    categoryModalVisible.value = false;
    fetchData();
  } catch (err) {
    // 验证失败或其他错误
  }
};

// 分类管理模态框取消
const handleCategoryModalCancel = () => {
  categoryModalVisible.value = false;
  categoryFormRef.value?.resetFields();
};

// 取消快速添加选项
const handleQuickOptionCancel = () => {
  quickOptionModalVisible.value = false;
  quickOptionFormRef.value?.resetFields();
};

// 初始化
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px;
}

.quick-actions-card {
  margin-bottom: 16px;

  .quick-action-btn {
    width: 100%;
    height: 40px;
    font-size: 14px;
  }
}

.dictionary-card {
  min-height: calc(100vh - 400px);

  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.options-drawer-content {
  .drawer-actions {
    margin-bottom: 16px;
  }
}
</style>
