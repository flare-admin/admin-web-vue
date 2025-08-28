// 配置属性类型定义

// 数字类型配置属性
export interface NumberConfigAttributes {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

// 时间类型配置属性
export interface TimeConfigAttributes {
  format?: string;
  showTime?: boolean;
  showSeconds?: boolean;
}

// 选项配置
export interface OptionConfig {
  label: string;
  value: string;
}

// 通用配置属性
export interface ConfigAttributes {
  // 数字类型属性
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  
  // 时间类型属性
  format?: string;
  showTime?: boolean;
  showSeconds?: boolean;
  
  // 文本类型属性
  rows?: number;
  maxLength?: number;
  
  // 选项配置
  options?: OptionConfig[];
  
  // 其他自定义属性
  [key: string]: any;
}

// 配置属性验证器
export class ConfigAttributesValidator {
  /**
   * 验证配置属性JSON字符串
   */
  static validateJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 解析配置属性JSON字符串
   */
  static parseAttributes(jsonString: string): ConfigAttributes | null {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }

  /**
   * 序列化配置属性为JSON字符串
   */
  static stringifyAttributes(attributes: ConfigAttributes): string {
    return JSON.stringify(attributes, null, 2);
  }

  /**
   * 获取默认配置属性
   */
  static getDefaultAttributes(type: string): ConfigAttributes {
    switch (type) {
      case 'int':
        return {
          min: 0,
          max: 100,
          step: 1,
          precision: 0
        };
      case 'float':
        return {
          min: 0,
          max: 100,
          step: 1,
          precision: 2
        };
      case 'time':
        return {
          format: 'HH:mm:ss',
          showSeconds: true
        };
      case 'date':
        return {
          format: 'YYYY-MM-DD'
        };
      case 'datetime':
        return {
          format: 'YYYY-MM-DD HH:mm:ss',
          showTime: true,
          showSeconds: true
        };
      case 'json':
      case 'array':
      case 'object':
        return {
          rows: 4,
          options: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ]
        };
      default:
        return {};
    }
  }
}
