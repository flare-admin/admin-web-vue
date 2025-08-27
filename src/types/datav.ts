// 画布类型
export interface Canvas {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  components: Component[];
}

// 组件基础类型
export interface Component {
  id: string;
  name: string;
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  option: any; // ECharts配置项
}

// 组件类别
export interface ComponentCategory {
  key: string;
  title: string;
  icon?: string;
  children: ComponentTemplate[];
}

// 组件模板
export interface ComponentTemplate {
  type: string;
  name: string;
  icon?: string;
  width: number;
  height: number;
  option: any; // 默认ECharts配置
}
