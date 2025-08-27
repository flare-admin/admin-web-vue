<template>
  <div class="option-management">
    <!-- 选项操作按钮 -->
    <div class="drawer-actions">
      <a-button type="primary" @click="handleAddOption">
        <template #icon>
          <icon-plus />
        </template>
        {{ t('dictionary.option.create') }}
      </a-button>
    </div>

    <!-- 选项列表 -->
    <a-table
      :loading="loading"
      :data="optionList"
      :columns="columns"
      row-key="id"
      :pagination="false"
    >
      <template #status="{ record }">
        <a-tag :color="record.status === 1 ? 'green' : 'red'">
          {{
            record.status === 1 ? t('dictionary.status.enabled') : t('dictionary.status.disabled')
          }}
        </a-tag>
      </template>

      <template #operations="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="handleEditOption(record)">
            <template #icon>
              <icon-edit />
            </template>
            {{ t('dictionary.operation.edit') }}
          </a-button>
          <a-button type="text" size="small" status="danger" @click="handleDeleteOption(record)">
            <template #icon>
              <icon-delete />
            </template>
            {{ t('dictionary.operation.delete') }}
          </a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 新增/编辑选项对话框 -->
    <a-modal
      v-model:visible="optionModalVisible"
      :title="optionModalTitle"
      @ok="handleOptionModalOk"
      @cancel="handleOptionModalCancel"
    >
      <a-form ref="optionFormRef" :model="optionForm" :rules="optionFormRules" layout="vertical">
        <a-form-item
          field="label"
          :label="t('dictionary.option.label')"
          :rules="optionFormRules.label"
        >
          <a-input
            v-model="optionForm.label"
            :placeholder="t('dictionary.option.labelPlaceholder')"
          />
        </a-form-item>
        <a-form-item
          field="value"
          :label="t('dictionary.option.value')"
          :rules="optionFormRules.value"
        >
          <a-input
            v-model="optionForm.value"
            :placeholder="t('dictionary.option.valuePlaceholder')"
            @change="handleValueChange"
          />
        </a-form-item>
        <a-form-item field="i18nKey" :label="t('dictionary.option.i18nKey')">
          <a-input
            v-model="optionForm.i18nKey"
            :placeholder="t('dictionary.option.i18nKeyPlaceholder')"
            readonly
          />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="sort" :label="t('dictionary.option.sort')">
              <a-input-number
                v-model="optionForm.sort"
                :placeholder="t('dictionary.option.sortPlaceholder')"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="status" :label="t('dictionary.option.status')">
              <a-select v-model="optionForm.status">
                <a-option :value="1" :label="t('dictionary.status.enabled')" />
                <a-option :value="0" :label="t('dictionary.status.disabled')" />
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" :label="t('dictionary.option.remark')">
          <a-textarea
            v-model="optionForm.remark"
            :placeholder="t('dictionary.option.remarkPlaceholder')"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon';
import type {
  DictionaryOption,
  CreateOptionRequest,
  UpdateOptionRequest
} from '@/types/api/support/dictionary';
import dictionaryApi from '@/api/support/dictionary';

// 定义props
interface Props {
  categoryId: string;
  visible: boolean;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  refresh: [];
}>();

const { t } = useI18n();

// 选项列表
const optionList = ref<DictionaryOption[]>([]);
const loading = ref(false);

// 选项表单
const optionModalVisible = ref(false);
const optionModalTitle = ref('');
const optionFormRef = ref();
const optionForm = reactive({
  id: '',
  categoryId: '',
  label: '',
  value: '',
  i18nKey: '',
  sort: 0,
  status: 1,
  remark: ''
});

// 表单验证规则
const optionFormRules = {
  label: [{ required: true, message: t('dictionary.option.labelRequired') }],
  value: [{ required: true, message: t('dictionary.option.valueRequired') }]
};

// 表格列配置
const columns = [
  {
    title: t('dictionary.table.label'),
    dataIndex: 'label',
    width: 150
  },
  {
    title: t('dictionary.table.value'),
    dataIndex: 'value',
    width: 150
  },
  {
    title: t('dictionary.table.i18nKey'),
    dataIndex: 'i18nKey',
    width: 200
  },
  {
    title: t('dictionary.table.sort'),
    dataIndex: 'sort',
    width: 80
  },
  {
    title: t('dictionary.table.status'),
    slotName: 'status',
    width: 100
  },
  {
    title: t('dictionary.table.remark'),
    dataIndex: 'remark',
    width: 200
  },
  {
    title: t('dictionary.table.operations'),
    slotName: 'operations',
    width: 150,
    fixed: 'right' as const
  }
];

// 加载选项列表
const loadOptionList = async () => {
  if (!props.categoryId) {
    optionList.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await dictionaryApi.getOptionList({ categoryId: props.categoryId });
    optionList.value = res;
  } catch (err) {
    Message.error(t('dictionary.option.loadError'));
  } finally {
    loading.value = false;
  }
};

// 监听抽屉显示状态，加载数据
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible && props.categoryId) {
      loadOptionList();
    }
  }
);

// 监听分类ID变化
watch(
  () => props.categoryId,
  (newCategoryId) => {
    if (newCategoryId && props.visible) {
      loadOptionList();
    }
  }
);

// 新增选项
const handleAddOption = () => {
  optionModalTitle.value = t('dictionary.option.create');
  optionForm.id = '';
  optionForm.categoryId = props.categoryId;
  optionForm.label = '';
  optionForm.value = '';
  optionForm.i18nKey = '';
  optionForm.sort = 0;
  optionForm.status = 1;
  optionForm.remark = '';
  optionModalVisible.value = true;
};

// 当值变化时自动生成国际化键
const handleValueChange = (value: string) => {
  if (value && props.categoryId) {
    optionForm.i18nKey = `dictionary.${props.categoryId}.option.${value}`;
  }
};

// 编辑选项
const handleEditOption = (record: DictionaryOption) => {
  optionModalTitle.value = t('dictionary.option.edit');
  optionForm.id = record.id;
  optionForm.categoryId = record.categoryId;
  optionForm.label = record.label;
  optionForm.value = record.value;
  optionForm.i18nKey = record.i18nKey || `dictionary.${record.categoryId}.option.${record.value}`;
  optionForm.sort = record.sort;
  optionForm.status = record.status;
  optionForm.remark = record.remark;
  optionModalVisible.value = true;
};

// 删除选项
const handleDeleteOption = async (record: DictionaryOption) => {
  try {
    await dictionaryApi.deleteOption(record.id);
    Message.success(t('dictionary.option.deleteSuccess'));
    loadOptionList();
    emit('refresh');
  } catch (err) {
    Message.error(t('dictionary.option.deleteError'));
  }
};

// 确认新增/编辑选项
const handleOptionModalOk = async () => {
  try {
    await optionFormRef.value?.validate();

    if (optionForm.id) {
      // 编辑
      const updateData: UpdateOptionRequest = {
        id: optionForm.id,
        label: optionForm.label,
        value: optionForm.value,
        i18nKey: optionForm.i18nKey,
        sort: optionForm.sort,
        status: optionForm.status,
        remark: optionForm.remark
      };
      await dictionaryApi.updateOption(optionForm.id, updateData);
      Message.success(t('dictionary.option.updateSuccess'));
    } else {
      // 新增
      const createData: CreateOptionRequest = {
        categoryId: optionForm.categoryId,
        label: optionForm.label,
        value: optionForm.value,
        i18nKey: optionForm.i18nKey,
        sort: optionForm.sort,
        status: optionForm.status,
        remark: optionForm.remark
      };
      await dictionaryApi.createOption(createData);
      Message.success(t('dictionary.option.createSuccess'));
    }

    optionModalVisible.value = false;
    loadOptionList();
    emit('refresh');
  } catch (err) {
    // 验证失败或其他错误
  }
};

// 取消新增/编辑选项
const handleOptionModalCancel = () => {
  optionModalVisible.value = false;
  optionFormRef.value?.resetFields();
};
</script>

<style scoped lang="less">
.option-management {
  .drawer-actions {
    margin-bottom: 16px;
  }
}
</style>
