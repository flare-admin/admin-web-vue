<template>
  <div class="container">
    <Breadcrumb :items="['menu.storage']" />
    <div class="view-mode-switch">
      <a-radio-group v-model="viewMode" type="button">
        <a-radio value="tree">
          <icon-mind-mapping :style="{ color: viewMode === 'tree' ? '#165DFF' : '' }" />
          {{ t('storage.viewMode.tree') }}
        </a-radio>
        <a-radio value="list">
          <icon-list :style="{ color: viewMode === 'list' ? '#165DFF' : '' }" />
          {{ t('storage.viewMode.list') }}
        </a-radio>
      </a-radio-group>
    </div>

    <a-row :gutter="16">
      <!-- 左侧文件夹树/列表 -->
      <a-col :span="viewMode === 'tree' ? 6 : 24">
        <a-card class="folder-tree-card">
          <template #title>
            <div class="card-title">
              <a-space>
                <icon-folder />
                {{ t('storage.folder.title') }}
              </a-space>

              <!-- 添加导航条 -->
              <template v-if="viewMode === 'list'">
                <a-divider direction="vertical" />
                <a-breadcrumb>
                  <a-breadcrumb-item>
                    <a @click="handleNavigateRoot">{{ t('storage.folder.root') }}</a>
                  </a-breadcrumb-item>
                  <a-breadcrumb-item v-for="folder in folderPath" :key="folder.id">
                    <a @click="handleNavigatePath(folder)">{{ folder.name }}</a>
                  </a-breadcrumb-item>
                </a-breadcrumb>
              </template>
            </div>
          </template>
          <template #extra>
            <a-button type="text" @click="handleAddRootFolder">
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
          </template>

          <!-- 树形模式 -->
          <a-tree
            v-if="viewMode === 'tree'"
            :data="folderTree"
            :field-names="{
              key: 'id',
              title: 'name',
              children: 'children'
            }"
            :show-line="true"
            :selected-keys="[currentFolderId]"
            @select="handleSelectFolder"
          >
            <template #extra="node">
              <a-dropdown trigger="contextMenu">
                <icon-menu class="icon-menu" />
                <template #content>
                  <a-doption @click="handleAddSubFolder(node)">
                    <icon-plus />
                    {{ t('storage.folder.add') }}
                  </a-doption>
                  <a-doption @click="handleRenameFolder(node)">
                    <icon-edit />
                    {{ t('storage.folder.rename') }}
                  </a-doption>
                  <a-doption @click="handleDeleteFolder(node)">
                    <icon-delete />
                    {{ t('storage.folder.delete') }}
                  </a-doption>
                </template>
              </a-dropdown>
            </template>
          </a-tree>

          <!-- 列表模式 -->
          <template v-else>
            <div class="folder-list">
              <a-button
                v-if="currentFolderId !== '0'"
                class="back-button"
                @click="handleBackFolder"
              >
                <template #icon>
                  <icon-up />
                </template>
                {{ t('storage.folder.back') }}
              </a-button>

              <!-- 文件夹列表 -->
              <div class="folder-grid">
                <div v-for="item in currentFolderList" :key="item.id" class="folder-item">
                  <div class="folder-content" @click="handleOpenFolder(item)">
                    <div class="folder-icon">
                      <icon-folder :style="{ fontSize: '40px', color: '#4080FF' }" />
                    </div>
                    <div class="folder-info">
                      <div class="folder-details">
                        <div class="folder-name">{{ item.name }}</div>
                        <div class="folder-path">{{ getFolderPath(item) }}</div>
                      </div>
                      <div class="folder-actions">
                        <a-dropdown trigger="hover">
                          <a-button type="text" size="mini">
                            <icon-more-vertical />
                          </a-button>
                          <template #content>
                            <!-- 添加上传文件选项到下拉菜单 -->
                            <a-doption @click.stop="handleUploadClick(item)">
                              <icon-upload />
                              {{ t('storage.file.upload') }}
                            </a-doption>
                            <a-doption @click.stop="handleAddSubFolder(item)">
                              <icon-plus />
                              {{ t('storage.folder.add') }}
                            </a-doption>
                            <a-doption @click.stop="handleRenameFolder(item)">
                              <icon-edit />
                              {{ t('storage.folder.rename') }}
                            </a-doption>
                            <a-doption @click.stop="handleDeleteFolder(item)">
                              <icon-delete />
                              {{ t('storage.folder.delete') }}
                            </a-doption>
                          </template>
                        </a-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 文件列表 -->
              <a-table
                v-model:selected-keys="selectedFileIds"
                row-key="id"
                :loading="loading"
                :pagination="pagination"
                :columns="columns"
                :data="fileList"
                :row-selection="rowSelection"
                @page-change="onPageChange"
              >
                <template #name="{ record }">
                  <a-space>
                    <component
                      :is="getFileIcon(record.type)"
                      :style="{
                        fontSize: '16px',
                        color: getIconColor(record.type)
                      }"
                    />
                    {{ record.name }}
                  </a-space>
                </template>
                <template #operations="{ record }">
                  <a-space>
                    <a-button
                      v-if="['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(record.type)"
                      type="text"
                      @click="handlePreview(record)"
                    >
                      <icon-eye />
                    </a-button>
                    <a-button type="text" @click="handleDownload(record)">
                      <icon-download />
                    </a-button>
                    <a-button type="text" @click="handleShare(record)">
                      <icon-reply />
                    </a-button>
                    <a-button type="text" status="danger" @click="handleDelete(record)">
                      <icon-delete />
                    </a-button>
                  </a-space>
                </template>
              </a-table>
            </div>
          </template>
        </a-card>
      </a-col>

      <!-- 右侧文件列表，仅在树形模式下显示 -->
      <a-col v-if="viewMode === 'tree'" :span="18">
        <a-card class="file-list-card">
          <template #title>
            <a-breadcrumb>
              <a-breadcrumb-item v-for="item in folderPath" :key="item.id">
                <a @click="handleNavigateFolder(item)">{{ item.name }}</a>
              </a-breadcrumb-item>
            </a-breadcrumb>
          </template>
          <template #extra>
            <a-space>
              <a-upload
                :custom-request="handleUpload"
                :show-file-list="false"
                accept="*/*"
                :multiple="false"
              >
                <a-button type="primary">
                  <template #icon>
                    <icon-upload />
                  </template>
                  {{ t('storage.file.upload') }}
                </a-button>
              </a-upload>
              <a-button
                type="primary"
                :disabled="!selectedFileIds.length"
                @click="handleBatchDownload"
              >
                <template #icon>
                  <icon-download />
                </template>
                {{ t('storage.file.batchDownload') }}
              </a-button>
              <a-button
                status="danger"
                :disabled="!selectedFileIds.length"
                @click="handleBatchDelete"
              >
                <template #icon>
                  <icon-delete />
                </template>
                {{ t('storage.file.batchDelete') }}
              </a-button>
            </a-space>
          </template>

          <!-- 文件列表 -->
          <a-table
            v-model:selected-keys="selectedFileIds"
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            :columns="columns"
            :data="fileList"
            :row-selection="rowSelection"
            @page-change="onPageChange"
          >
            <template #name="{ record }">
              <a-space>
                <component
                  :is="getFileIcon(record.type)"
                  :style="{
                    fontSize: '16px',
                    color: getIconColor(record.type)
                  }"
                />
                {{ record.name }}
              </a-space>
            </template>
            <template #operations="{ record }">
              <a-space>
                <a-button
                  v-if="['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(record.type)"
                  type="text"
                  @click="handlePreview(record)"
                >
                  <icon-eye />
                </a-button>
                <a-button type="text" @click="handleDownload(record)">
                  <icon-download />
                </a-button>
                <a-button type="text" @click="handleShare(record)">
                  <icon-reply />
                </a-button>
                <a-button type="text" status="danger" @click="handleDelete(record)">
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新建/重命名文件夹对话框 -->
    <a-modal
      v-model:visible="folderModalVisible"
      :title="folderModalTitle"
      @ok="handleFolderModalOk"
      @cancel="handleFolderModalCancel"
    >
      <a-form ref="folderFormRef" :model="folderForm">
        <a-form-item
          field="name"
          :label="t('storage.folder.name')"
          :rules="[{ required: true, message: t('storage.folder.nameRequired') }]"
        >
          <a-input v-model="folderForm.name" :placeholder="t('storage.folder.namePlaceholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分享对话框 -->
    <a-modal
      v-model:visible="shareModalVisible"
      :title="t('storage.share.title')"
      @ok="handleShareModalOk"
      @cancel="handleShareModalCancel"
    >
      <a-form ref="shareFormRef" :model="shareForm">
        <a-form-item field="password" :label="t('storage.share.password')">
          <a-input-password
            v-model="shareForm.password"
            :placeholder="t('storage.share.passwordPlaceholder')"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="expireTime" :label="t('storage.share.expireTime')">
          <a-date-picker
            v-model="shareForm.expireTime"
            :placeholder="t('storage.share.expireTimePlaceholder')"
            show-time
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 使用 Arco Design 的 Image.Preview 组件 -->
    <a-image-preview
      v-model:visible="previewVisible"
      :src="previewUrl"
      :title="previewFile?.name"
      :actions="['fullScreen', 'rotateRight', 'rotateLeft', 'zoomIn', 'zoomOut']"
    />
    <!-- 添加隐藏的上传组件 -->
    <a-upload
      ref="uploadRef"
      :custom-request="handleUpload"
      :show-file-list="false"
      accept="*/*"
      :multiple="false"
      style="display: none"
    />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, Modal, RequestOption, TreeNodeData, UploadRequest } from '@arco-design/web-vue';
import {
  IconDelete,
  IconDownload,
  IconEdit,
  IconEye,
  IconFolder,
  IconList,
  IconMenu,
  IconMindMapping,
  IconMoreVertical,
  IconPlus,
  IconUp,
  IconUpload,
  IconReply
} from '@arco-design/web-vue/es/icon';
import type { FileDto, FolderDto, FolderLevel, FolderTreeDto } from '@/types/api/support/storage';
import storageApi from '@/api/support/storage';
import useLoading from '@/hooks/loading';
import { permissionsApi } from '@/api/framework/authority';
// 文件操作相关
// 添加上传组件的引用
const uploadRef = ref();
const { t } = useI18n();
const { loading, setLoading } = useLoading();

// 图模式
const viewMode = ref<'tree' | 'list'>('tree');

// 状态定义
const folderTree = ref<FolderTreeDto[]>([]);
const currentFolderId = ref('0');
const folderPath = ref<FolderTreeDto[]>([]);
const currentFolderList = ref<FolderDto[]>([]);
const fileList = ref<FileDto[]>([]);
const selectedFiles = ref<FileDto[]>([]);
// 添加文件类型图标映射
const fileTypeIcons = {
  // 图片
  '.png': 'icon-image',
  '.jpg': 'icon-image',
  '.jpeg': 'icon-image',
  '.gif': 'icon-image',
  '.webp': 'icon-image',
  // 文档
  '.pdf': 'icon-file-pdf',
  '.doc': 'icon-file',
  '.docx': 'icon-file',
  '.xls': 'icon-file',
  '.xlsx': 'icon-file',
  '.ppt': 'icon-file',
  '.pptx': 'icon-file',
  '.txt': 'icon-file',
  // 视频
  '.mp4': 'icon-video-camera',
  '.avi': 'icon-video-camera',
  '.mov': 'icon-video-camera',
  // 音频
  '.mp3': 'icon-sound',
  '.wav': 'icon-sound',
  // 压缩包
  '.zip': 'icon-file-zip',
  '.rar': 'icon-file-zip',
  '.7z': 'icon-file-zip',
  // 代码文件
  '.js': 'icon-code',
  '.ts': 'icon-code',
  '.html': 'icon-code',
  '.css': 'icon-code',
  '.json': 'icon-code',
  // 默认
  default: 'icon-file'
} as const;

// 预览相关的状态
const previewVisible = ref(false);
const previewFile = ref<FileDto | null>(null);
const previewUrl = ref<string>('');
// 添加层级路径状态
const folderLevels = ref<FolderLevel[]>([]);
const selectedFileIds = ref<string[]>([]);
// 添加分页相关状态
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true
});

// 表格列配置
const columns = [
  {
    title: t('storage.file.name'),
    dataIndex: 'name',
    slotName: 'name'
  },
  {
    title: t('storage.file.size'),
    dataIndex: 'size'
  },
  {
    title: t('storage.file.type'),
    dataIndex: 'type'
  },
  {
    title: t('storage.file.updatedAt'),
    dataIndex: 'updatedAt'
  },
  {
    title: t('storage.file.operations'),
    slotName: 'operations',
    width: 180,
    fixed: 'right' as const
  }
];

// 定义表格选择配置
const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  showCheckedAll: true,
  onlyCurrent: false
}));

// 加载文件夹树
const loadFolderTree = async () => {
  setLoading(true);
  try {
    const tree = await storageApi.getFolderTree();
    folderTree.value = tree;
  } catch (err) {
    Message.error(t('storage.folder.loadError'));
  } finally {
    setLoading(false);
  }
};

// 加载当前层级的文件夹
const loadCurrentFolders = async () => {
  setLoading(true);
  try {
    const tree = await storageApi.getFolderTree();
    folderTree.value = tree;

    // 根据当前ID获取要显示的文件夹列表
    if (currentFolderId.value === '0') {
      // 显示根文件夹
      currentFolderList.value = tree;
    } else {
      // 递归查找当前文件夹的子文件夹
      const findChildren = (folders: FolderTreeDto[]): FolderTreeDto[] => {
        let result: FolderTreeDto[] = [];

        const found = folders.find((folder) => {
          if (folder.id === currentFolderId.value) {
            result = folder.children || [];
            return true;
          }
          if (folder.children) {
            result = findChildren(folder.children);
            return result.length > 0;
          }
          return false;
        });

        return found ? result : [];
      };
      currentFolderList.value = findChildren(tree);
    }
  } catch (err) {
    Message.error(t('storage.folder.loadError'));
  } finally {
    setLoading(false);
  }
};

// 修改文件列表载方法
const loadFileList = async () => {
  try {
    loading.value = true;
    const res = await storageApi.getFileList({
      folderId: currentFolderId.value,
      current: pagination.current,
      size: pagination.pageSize
    });
    fileList.value = res.list;
    pagination.total = res.total;
  } catch (err) {
    Message.error(t('storage.file.loadError'));
  } finally {
    loading.value = false;
  }
};

// 修改页码改变处方法
const onPageChange = (page: number) => {
  pagination.current = page;
  loadFileList();
};

// 监听文件夹变化时重置分页
watch(currentFolderId, () => {
  pagination.current = 1;
  loadFileList();
});

// 文件夹操作相关
const folderModalVisible = ref(false);
const folderModalTitle = ref('');
const folderForm = reactive({
  name: '',
  parentId: '0',
  id: ''
});
const folderFormRef = ref();

// 添加根目录
const handleAddRootFolder = () => {
  folderModalTitle.value = t('storage.folder.addRoot');
  folderForm.parentId = '0';
  folderForm.name = '';
  folderForm.id = '';
  folderModalVisible.value = true;
};

// 添加子目录
const handleAddSubFolder = (node: FolderTreeDto) => {
  folderModalTitle.value = t('storage.folder.addSub');
  folderForm.parentId = node.id;
  folderForm.name = '';
  folderForm.id = '';
  folderModalVisible.value = true;
};

// 重命名目录
const handleRenameFolder = (node: FolderTreeDto) => {
  folderModalTitle.value = t('storage.folder.rename');
  folderForm.parentId = node.parentId;
  folderForm.id = node.id;
  folderForm.name = node.name;
  folderModalVisible.value = true;
};

// 删除目录
const handleDeleteFolder = async (node: FolderTreeDto) => {
  Modal.confirm({
    title: t('storage.folder.deleteConfirmTitle'),
    content: t('storage.folder.deleteConfirmContent'),
    onOk: async () => {
      try {
        await storageApi.deleteFolder(node.id);
        Message.success(t('storage.folder.deleteSuccess'));
        loadFolderTree();
      } catch (err) {
        Message.error(t('storage.folder.deleteError'));
      }
    }
  });
};

// 确认新建/重命名文件夹
const handleFolderModalOk = async () => {
  if (!folderForm.name) {
    Message.error(t('storage.folder.nameRequired'));
    return;
  }
  try {
    if (folderForm.id) {
      await storageApi.renameFolder({
        name: folderForm.name,
        id: folderForm.id
      });
    } else {
      await storageApi.createFolder({
        name: folderForm.name,
        parentId: folderForm.parentId
      });
    }
    Message.success(t('storage.folder.createSuccess'));
    folderModalVisible.value = false;
    // 重新加载文件夹树
    loadFolderTree();
    // 如果当前在列表模式，也需要刷新当前文件夹列表
    // eslint-disable-next-line no-use-before-define
    if (viewMode.value === 'list') {
      loadFileList();
    }
  } catch (err) {
    Message.error(t('storage.folder.createError'));
  }
};

// 取消新建/重命名文件夹
const handleFolderModalCancel = () => {
  folderModalVisible.value = false;
  folderForm.name = '';
  folderForm.parentId = '0';
};

// 添加处理上传点击的方法
const handleUploadClick = (folder: FolderTreeDto) => {
  // 设置当前文件夹ID
  currentFolderId.value = folder.id;
  // 触发隐藏的上传组件的点击事件
  nextTick(() => {
    const uploadElement = uploadRef.value?.$el.querySelector('input[type="file"]');
    if (uploadElement) {
      uploadElement.click();
    }
  });
};

// 文件操作相关
// 上传文件
const handleUpload = (option: RequestOption): UploadRequest => {
  const { fileItem, onSuccess, onError } = option;

  // 返回一个控制上传操作的对象
  const abortController = new AbortController();
  if (fileItem.file) {
    storageApi
      .uploadFile(fileItem.file, currentFolderId.value)
      .then((res) => {
        // 成功回调
        Message.success(t('storage.file.uploadSuccess'));
        loadFileList(); // 刷新文件列表
        onSuccess?.(res);
      })
      .catch((err) => {
        Message.error(t('storage.file.uploadError'));
        onError?.(err as Error);
      });
  }
  // 返回控制操作对象
  return {
    abort: () => {
      abortController.abort();
    }
  };
};

// 预览文件
const handlePreview = async (file: FileDto) => {
  try {
    previewFile.value = file;

    // 显示加载状态
    const loadingInstance = Message.loading({
      content: t('storage.file.previewing'),
      duration: 0
    });

    try {
      // 获取预览地址
      const url = await storageApi.previewFile(file.id);
      previewUrl.value = url;
      previewVisible.value = true; // 获取到 URL 后再显示预览
    } finally {
      loadingInstance.close();
    }
  } catch (err) {
    Message.error(t('storage.file.previewError'));
  }
};

// 修改下载处理方法
const handleDownload = async (file: FileDto) => {
  try {
    // 显示加载状态
    const loadingInstance = Message.loading({
      content: t('storage.file.downloading'),
      duration: 0
    });

    try {
      // 直接获取文件流
      const response = await fetch(`/api/storage/files/${file.id}/download`, {
        method: 'GET',
        headers: {
          // 添加认证头等其他必要的头信息
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // 获取文件流
      const blob = await response.blob();

      // 创建下载链接
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name; // 使用文件原始名称

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      Message.success(t('storage.file.downloadSuccess'));
    } finally {
      loadingInstance.close();
    }
  } catch (err) {
    Message.error(t('storage.file.downloadError'));
  }
};

// 删除文件
const handleDelete = async (file: FileDto) => {
  Modal.confirm({
    title: t('storage.file.recycleConfirmTitle'),
    content: t('storage.file.recycleConfirmContent'),
    onOk: async () => {
      try {
        await storageApi.recycleFile(file.id);
        Message.success(t('storage.file.recycleSuccess'));
        loadFileList();
      } catch (err) {
        Message.error(t('storage.file.recycleError'));
      }
    }
  });
};

// 批量删除文件
const handleBatchDelete = async () => {
  Modal.confirm({
    title: t('storage.file.batchRecycleConfirmTitle'),
    content: t('storage.file.batchRecycleConfirmContent'),
    maskClosable: false,
    onOk: async () => {
      try {
        const recyclePromises = selectedFileIds.value.map((id) => storageApi.recycleFile(id));
        await Promise.all(recyclePromises);
        Message.success(t('storage.file.batchRecycleSuccess'));
        loadFileList();
      } catch (err) {
        Message.error(t('storage.file.batchRecycleError'));
      }
    }
  });
};

// 修改文件夹路径导航相关方法
const updateFolderPath = (currentFolder: FolderTreeDto | null) => {
  if (!currentFolder) {
    folderPath.value = [];
    return;
  }

  const path: FolderTreeDto[] = [];
  const findPath = (folders: FolderTreeDto[], targetId: string): boolean => {
    return folders.some((folder) => {
      if (folder.id === targetId) {
        path.push(folder);
        return true;
      }
      if (folder.children && findPath(folder.children, targetId)) {
        path.unshift(folder);
        return true;
      }
      return false;
    });
  };

  findPath(folderTree.value, currentFolder.id);
  folderPath.value = path;
};

// 修改 handleOpenFolder 方法
const handleOpenFolder = async (folder: FolderTreeDto) => {
  currentFolderId.value = folder.id;
  updateFolderPath(folder);
  await loadCurrentFolders();
  await loadFileList();
};

// 修改 handleBackFolder 方法
const handleBackFolder = async () => {
  if (folderPath.value.length > 1) {
    // 获取上一级文件夹
    const parentFolder = folderPath.value[folderPath.value.length - 2];
    currentFolderId.value = parentFolder.id;
    updateFolderPath(parentFolder);
  } else {
    // 返回根目录
    currentFolderId.value = '0';
    folderPath.value = [];
  }
  await loadCurrentFolders();
  await loadFileList();
};

// 修改 handleNavigateRoot 方法
const handleNavigateRoot = async () => {
  folderLevels.value = [];
  currentFolderId.value = '0';
  await loadCurrentFolders();
  await loadFileList();
};

// 修改导航到指定文件夹的方法
const handleNavigatePath = async (folder: FolderTreeDto) => {
  currentFolderId.value = folder.id;
  updateFolderPath(folder);
  await loadCurrentFolders();
  await loadFileList();
};

// 获取文件夹路径
const getFolderPath = (folder: FolderTreeDto) => {
  const paths: string[] = [];

  const findPathInTree = (folders: FolderTreeDto[], targetId: string): boolean => {
    return folders.some((f) => {
      if (f.id === targetId) {
        paths.push(f.name);
        return true;
      }
      if (f.children && findPathInTree(f.children, targetId)) {
        paths.unshift(f.name);
        return true;
      }
      return false;
    });
  };

  findPathInTree(folderTree.value, folder.id);
  return paths.join('/');
};

// 获取文件图标
const getFileIcon = (type: string) => {
  return fileTypeIcons[type as keyof typeof fileTypeIcons] || fileTypeIcons.default;
};

// 处理树形模式下��文件夹选择
const handleSelectFolder = (
  selectedKeys: (string | number)[],
  data: {
    selected?: boolean;
    selectedNodes: TreeNodeData[];
    node?: TreeNodeData;
    e?: Event;
  }
) => {
  if (selectedKeys.length > 0 && data.selectedNodes.length > 0) {
    const stringKeys = selectedKeys.map((key) => key.toString());
    const folderId = stringKeys[0];
    if (folderId) {
      currentFolderId.value = folderId;
      // updateFolderPath(data.selectedNodes[0]);
      loadFileList();
    }
  }
};

// 添加批量下载处理方法
const handleBatchDownload = async () => {
  if (!selectedFiles.value.length) return;

  try {
    const loadingInstance = Message.loading({
      content: t('storage.file.downloading'),
      duration: 0
    });

    try {
      // 调用批量下载接口
      const blob = await storageApi.batchDownloadFiles(selectedFileIds.value);

      // 创建下载链接
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `files_${new Date().getTime()}.zip`; // 使用时间戳作为文件名

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      Message.success(t('storage.file.downloadSuccess'));
    } finally {
      loadingInstance.close();
    }
  } catch (err) {
    Message.error(t('storage.file.downloadError'));
  }
};

// 初始化
onMounted(() => {
  folderLevels.value = [];
  if (viewMode.value === 'tree') {
    loadFolderTree();
  } else {
    loadCurrentFolders();
    // if (currentFolderId.value !== '0') {
    //   await loadFolderPath(currentFolderId.value);
    // }
  }
  loadFileList();
});
// 处理导航到指定文件夹
const handleNavigateFolder = async (folder: FolderTreeDto) => {
  try {
    currentFolderId.value = folder.id;
    // 更新面包屑导航路径
    updateFolderPath(folder);
    // 重新加载当前文件夹的文件列表
    await loadFileList();
  } catch (err) {
    Message.error(t('storage.folder.loadError'));
  }
};
// 监听视图模式变化
watch(viewMode, () => {
  folderLevels.value = [];
  if (viewMode.value === 'tree') {
    loadFolderTree();
  } else {
    loadCurrentFolders();
  }
});
// 添加图标颜色映射方法
const getIconColor = (type: string) => {
  // 根据文件类型返回不同的颜色
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(type)) {
    return '#13C2C2'; // 图片文件使用青色
  }
  if (['.doc', '.docx', '.pdf'].includes(type)) {
    return '#1677FF'; // 文档文件使用蓝色
  }
  if (['.xls', '.xlsx'].includes(type)) {
    return '#52C41A'; // Excel文件使用绿色
  }
  if (['.mp4', '.avi', '.mov'].includes(type)) {
    return '#722ED1'; // 视频文件使用紫色
  }
  if (['.mp3', '.wav'].includes(type)) {
    return '#EB2F96'; // 音频文件使用粉色
  }
  if (['.zip', '.rar', '.7z'].includes(type)) {
    return '#FA8C16'; // 压缩包使用黄色
  }
  return '#8C8C8C'; // 默认使用灰色
};

// 监听预览窗口关闭，清理状态
watch(previewVisible, (visible) => {
  if (!visible) {
    previewFile.value = null;
    previewUrl.value = '';
  }
});

// 添加分享相关的状态
const shareModalVisible = ref(false);
const shareForm = reactive({
  password: '',
  expireTime: 0 as number
});
const currentShareFile = ref<FileDto | null>(null);

// 添加分享处理方法
const handleShare = (file: FileDto) => {
  currentShareFile.value = file;
  shareModalVisible.value = true;
};

// 处理分享确认
const handleShareModalOk = async () => {
  if (!currentShareFile.value) return;
  try {
    // 如果选择了日期，转换为秒级时间戳
    const expireTime = shareForm.expireTime
      ? Math.floor(new Date(shareForm.expireTime).getTime() / 1000)
      : 0;

    const res = await storageApi.shareFile({
      fileId: currentShareFile.value.id,
      password: shareForm.password,
      expireTime
    });

    await navigator.clipboard.writeText(res.url);
    Message.success(t('storage.share.success'));
    shareModalVisible.value = false;
  } catch (err) {
    Message.error(t('storage.share.error'));
  }
};

// 处理分享取消
const handleShareModalCancel = () => {
  shareModalVisible.value = false;
  shareForm.password = '';
  shareForm.expireTime = 0;
  currentShareFile.value = null;
};
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px;
}

.folder-tree-card {
  min-height: calc(100vh - 160px);
}

.file-list-card {
  min-height: calc(100vh - 160px);
}

.icon-menu {
  position: absolute;
  right: 8px;
  font-size: 12px;
  top: 10px;
  color: #3370ff;
}

.view-mode-switch {
  margin-bottom: 16px;
  text-align: right;
}

.folder-list {
  .back-button {
    margin-bottom: 16px;
  }
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.folder-item {
  cursor: pointer;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: var(--color-fill-2);
    border-color: var(--color-primary-light-3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .folder-action-bar {
      opacity: 1;
    }
  }
}

.folder-content {
  padding: 16px 16px 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.folder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.folder-details {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 14px;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.folder-path {
  font-size: 12px;
  color: var(--color-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-actions {
  opacity: 0;
  transition: opacity 0.3s;
  margin-left: 8px;
  flex-shrink: 0;

  .folder-item:hover & {
    opacity: 1;
  }
}

// 添加路径卡片样式
.path-card {
  margin-bottom: 16px;

  :deep(.arco-card-body) {
    padding: 12px 20px;
  }

  :deep(.arco-breadcrumb) {
    margin: 0;
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.arco-breadcrumb) {
    margin: 0;
    font-size: 14px;
  }

  :deep(.arco-divider-vertical) {
    margin: 0 8px;
    height: 14px;
  }
}

.folder-action-bar {
  opacity: 0;
  transition: opacity 0.3s;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  background-color: var(--color-bg-2);
}

// 添加操作组样式
.operation-group {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
