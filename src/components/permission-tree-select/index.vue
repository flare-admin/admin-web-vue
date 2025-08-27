<template>
  <a-tree-select
    :model-value="innerValue"
    :data="treeData"
    :multiple="multiple"
    :loading="loading"
    :filter-tree-node="handleFilter"
    allow-search
    allow-clear
    :placeholder="placeholder"
    @update:model-value="handleChange"
  >
    <template #trigger-search>
      <a-input-search
        :model-value="searchValue"
        :placeholder="t('common.search.placeholder')"
        @update:model-value="(val: any) => searchValue = val"
      />
    </template>
  </a-tree-select>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TreeNodeData } from '@arco-design/web-vue';
import type { SimplePermissionTreeNode } from '@/types/api/authority';
import { permissionsApi } from '@/api/framework/authority';
import type { LabelValue } from '@arco-design/web-vue/es/tree-select/interface';

const props = withDefaults(
  defineProps<{
    modelValue?: number | number[];
    multiple?: boolean;
    placeholder?: string;
    checkStrictly?: boolean;
  }>(),
  {
    multiple: false,
    checkStrictly: false,
    placeholder: ''
  }
);

const emit = defineEmits(['update:modelValue', 'change']);

const { t } = useI18n();
const loading = ref(false);
const treeData = ref<TreeNodeData[]>([]);
const searchValue = ref('');
const innerValue = ref<number | number[] | undefined>(
  props.modelValue || (props.multiple ? [] : undefined)
);
// 转换数据结构
const convertToTreeData = (permissions: SimplePermissionTreeNode[]): TreeNodeData[] => {
  return permissions.map((perm) => ({
    key: perm.id,
    title: perm.name,
    children: perm.children ? convertToTreeData(perm.children) : undefined
  }));
};

// 加载权限树数据
const loadData = async () => {
  loading.value = true;
  try {
    const { tree } = await permissionsApi.getSimpleTree();
    treeData.value = convertToTreeData(tree);
  } catch (err) {
    console.error('Failed to load permission tree:', err);
  } finally {
    loading.value = false;
  }
};

// 获取父节点ID
const getParentIds = (selectedIds: number[]): number[] => {
  const parentIds: number[] = [];
  const idMap = new Map<number, number>();

  // 构建ID映射
  const buildIdMap = (nodes: TreeNodeData[], parentId?: number) => {
    nodes.forEach((node) => {
      if (parentId !== undefined) {
        idMap.set(node.key as number, parentId);
      }
      if (node.children) {
        buildIdMap(node.children, node.key as number);
      }
    });
  };

  buildIdMap(treeData.value);

  // 查找所有父节点
  selectedIds.forEach((id) => {
    let currentId = id;
    while (idMap.has(currentId)) {
      const parentId = idMap.get(currentId);
      if (parentId) {
        parentIds.push(parentId);
        currentId = parentId;
      }
    }
  });

  return parentIds;
};

// 处理搜索过滤
const handleFilter = (searchText: string, node: TreeNodeData) => {
  return (node.title as string).toLowerCase().includes(searchText.toLowerCase());
};

// 处理选择变化
const handleChange = (
  value: string | number | (string | number)[] | LabelValue | LabelValue[] | undefined
) => {
  if (!value) {
    emit('update:modelValue', props.multiple ? [] : undefined);
    return;
  }

  const numValue = Array.isArray(value)
    ? value.map((v) => Number(typeof v === 'object' ? v.value : v))
    : Number(typeof value === 'object' ? value.value : value);

  if (props.multiple && !props.checkStrictly) {
    const parentIds = getParentIds(numValue as number[]);
    const newValue = [...new Set([...(numValue as number[]), ...parentIds])];
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    emit('update:modelValue', numValue);
    emit('change', numValue);
  }
};

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  }
);

onMounted(() => {
  loadData();
});
</script>
