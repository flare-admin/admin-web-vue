<template>
  <div class="datav-container">
    <!-- 左侧组件列表 -->
    <div class="component-panel">
      <a-collapse :default-active-key="['charts']">
        <a-collapse-item
          v-for="category in componentTemplates"
          :key="category.key"
          :header="category.title"
        >
          <div class="component-list">
            <div
              v-for="item in category.children"
              :key="item.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart($event, item)"
            >
              <div class="component-icon">
                <component :is="item.icon || 'icon-bar-chart'" />
              </div>
              <div class="component-name">{{ item.name }}</div>
            </div>
          </div>
        </a-collapse-item>
      </a-collapse>
    </div>

    <!-- 中间画布区域 -->
    <div class="canvas-container">
      <div
        ref="canvasRef"
        class="canvas"
        :style="{
          width: `${canvas.width}px`,
          height: `${canvas.height}px`,
          backgroundColor: canvas.backgroundColor
        }"
        @dragover.prevent
        @drop="handleDrop"
      >
        <div
          v-for="component in canvas.components"
          :key="component.id"
          class="component-wrapper"
          :class="{ active: currentComponent?.id === component.id }"
          :style="{
            width: `${component.width}px`,
            height: `${component.height}px`,
            left: `${component.left}px`,
            top: `${component.top}px`,
            zIndex: component.zIndex
          }"
          @click.stop="selectComponent(component)"
        >
          <v-chart :option="component.option" autoresize />
          <!-- 拖拽手柄 -->
          <div v-if="currentComponent?.id === component.id" class="resize-handles">
            <div
              v-for="handle in resizeHandles"
              :key="handle"
              :class="['resize-handle', handle]"
              @mousedown="handleResizeStart($event, handle)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧配置面板 -->
    <div class="config-panel">
      <template v-if="currentComponent">
        <div class="panel-header">
          <span class="title">组件配置</span>
          <a-button type="text" status="danger" size="small" @click="handleDeleteComponent">
            <template #icon>
              <icon-delete />
            </template>
            删除
          </a-button>
        </div>
        <a-form :model="currentComponent" layout="vertical">
          <a-form-item label="名称">
            <a-input v-model="currentComponent.name" />
          </a-form-item>
          <a-form-item label="位置">
            <a-space>
              <a-input-number v-model="currentComponent.left" :min="0" style="width: 100px" />
              <a-input-number v-model="currentComponent.top" :min="0" style="width: 100px" />
            </a-space>
          </a-form-item>
          <a-form-item label="尺寸">
            <a-space>
              <a-input-number v-model="currentComponent.width" :min="50" style="width: 100px" />
              <a-input-number v-model="currentComponent.height" :min="50" style="width: 100px" />
            </a-space>
          </a-form-item>
          <a-form-item label="配置">
            <json-editor v-model="currentComponent.option" />
          </a-form-item>
        </a-form>
      </template>
      <div v-else class="empty-tip">请选择组件进行配置</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import VChart from 'vue-echarts';
import { Message, Modal } from '@arco-design/web-vue';
import { IconDelete } from '@arco-design/web-vue/es/icon';
import type { Canvas, Component, ComponentTemplate } from '@/types/datav';
import componentTemplates from './config/components';
import JsonEditor from './components/json-editor.vue';

// 画布数据
const canvas = reactive<Canvas>({
  id: uuidv4(),
  name: '未命名',
  width: 1920,
  height: 1080,
  backgroundColor: '#1e1e1e',
  components: []
});

const currentComponent = ref<Component>();
const canvasRef = ref<HTMLElement>();
const startPos = reactive({ x: 0, y: 0 });

// 调整大小相关
const resizeHandles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
const isResizing = ref(false);
const resizeHandle = ref('');

// 调整大小移动处理
const handleResizeMove = (e: MouseEvent) => {
  if (!isResizing.value || !currentComponent.value) return;

  const deltaX = e.clientX - startPos.x;
  const deltaY = e.clientY - startPos.y;

  const component = currentComponent.value;
  const handle = resizeHandle.value;

  if (handle.includes('w')) {
    component.width = Math.max(50, component.width - deltaX);
    component.left += deltaX;
  }
  if (handle.includes('e')) {
    component.width = Math.max(50, component.width + deltaX);
  }
  if (handle.includes('n')) {
    component.height = Math.max(50, component.height - deltaY);
    component.top += deltaY;
  }
  if (handle.includes('s')) {
    component.height = Math.max(50, component.height + deltaY);
  }

  startPos.x = e.clientX;
  startPos.y = e.clientY;
};

// 调整大小结束处理
const handleResizeEnd = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
};

// 调整大小开始处理
const handleResizeStart = (e: MouseEvent, handle: string) => {
  if (!currentComponent.value) return;
  e.stopPropagation();
  isResizing.value = true;
  resizeHandle.value = handle;
  startPos.x = e.clientX;
  startPos.y = e.clientY;

  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
};

// 拖拽开始
const handleDragStart = (e: DragEvent, template: ComponentTemplate) => {
  e.dataTransfer?.setData('componentType', template.type);
};

// 放置组件
const handleDrop = (e: DragEvent) => {
  const type = e.dataTransfer?.getData('componentType');
  if (!type || !canvasRef.value) return;

  const template = componentTemplates
    .flatMap((category) => category.children)
    .find((item) => item.type === type);

  if (!template) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 获取当前最大的 zIndex
  const maxZIndex = Math.max(0, ...canvas.components.map((item) => item.zIndex));

  const component: Component = {
    id: uuidv4(),
    name: template.name,
    type: template.type,
    left: x,
    top: y,
    width: template.width,
    height: template.height,
    zIndex: maxZIndex + 1,
    option: JSON.parse(JSON.stringify(template.option))
  };

  canvas.components.push(component);
  currentComponent.value = component;
};

// 选择组件
const selectComponent = (component: Component) => {
  // 将选中的组件置顶
  const maxZIndex = Math.max(...canvas.components.map((item) => item.zIndex));
  if (component.zIndex < maxZIndex) {
    component.zIndex = maxZIndex + 1;
  }
  currentComponent.value = component;
};

// 删除组件
const handleDeleteComponent = () => {
  if (!currentComponent.value) return;

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该组件吗？',
    onOk: () => {
      const index = canvas.components.findIndex((item) => item.id === currentComponent.value?.id);
      if (index !== -1) {
        canvas.components.splice(index, 1);
        currentComponent.value = undefined;
        Message.success('删除成功');
      }
    }
  });
};
</script>

<style scoped lang="less">
.datav-container {
  display: flex;
  height: 100vh;
  background-color: #121212;
  color: #fff;

  .component-panel {
    width: 280px;
    padding: 16px;
    border-right: 1px solid #333;
    background-color: #1e1e1e;

    .component-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .component-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 4px;
      cursor: move;

      &:hover {
        background-color: #2a2a2a;
      }

      .component-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .component-name {
        font-size: 12px;
      }
    }
  }

  .canvas-container {
    flex: 1;
    padding: 20px;
    overflow: auto;

    .canvas {
      position: relative;
      margin: 0 auto;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);

      .component-wrapper {
        position: absolute;
        background-color: #2a2a2a;
        border: 1px solid transparent;
        cursor: move;
        overflow: hidden;

        :deep(.echarts) {
          width: 100% !important;
          height: 100% !important;
        }

        &.active {
          border-color: #165dff;
        }

        .resize-handles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;

          .resize-handle {
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #fff;
            border: 1px solid #165dff;
            pointer-events: all;

            &.nw {
              top: -4px;
              left: -4px;
              cursor: nw-resize;
            }
            &.n {
              top: -4px;
              left: 50%;
              transform: translateX(-50%);
              cursor: n-resize;
            }
            &.ne {
              top: -4px;
              right: -4px;
              cursor: ne-resize;
            }
            &.w {
              top: 50%;
              left: -4px;
              transform: translateY(-50%);
              cursor: w-resize;
            }
            &.e {
              top: 50%;
              right: -4px;
              transform: translateY(-50%);
              cursor: e-resize;
            }
            &.sw {
              bottom: -4px;
              left: -4px;
              cursor: sw-resize;
            }
            &.s {
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              cursor: s-resize;
            }
            &.se {
              bottom: -4px;
              right: -4px;
              cursor: se-resize;
            }
          }
        }
      }
    }
  }

  .config-panel {
    width: 300px;
    padding: 16px;
    border-left: 1px solid #333;
    background-color: #1e1e1e;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #333;

      .title {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .empty-tip {
      text-align: center;
      color: #666;
      padding: 20px 0;
    }

    :deep(.arco-form) {
      .arco-form-item {
        &:last-child {
          margin-bottom: 0;
        }

        .arco-form-item-label {
          color: #fff;
        }
      }
    }
  }
}
</style>
