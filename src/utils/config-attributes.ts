// 配置属性工具函数

import type { ConfigAttributes, OptionConfig } from '@/types/api/support/config-attributes';

/**
 * 验证配置属性JSON字符串
 */
export function validateConfigAttributes(jsonString: string): boolean {
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
export function parseConfigAttributes(jsonString: string): ConfigAttributes | null {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * 序列化配置属性为JSON字符串
 */
export function stringifyConfigAttributes(attributes: ConfigAttributes): string {
  return JSON.stringify(attributes, null, 2);
}

/**
 * 获取数据类型的默认配置属性
 */
export function getDefaultConfigAttributes(type: string): ConfigAttributes {
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

/**
 * 验证配置属性格式
 */
export function validateConfigAttributesFormat(attributes: ConfigAttributes, type: string): string[] {
  const errors: string[] = [];

  // 数字类型验证
  if (['int', 'float'].includes(type)) {
    if (attributes.min !== undefined && attributes.max !== undefined && attributes.min > attributes.max) {
      errors.push('最小值不能大于最大值');
    }
    if (attributes.step !== undefined && attributes.step <= 0) {
      errors.push('步长必须大于0');
    }
    if (attributes.precision !== undefined && (attributes.precision < 0 || attributes.precision > 10)) {
      errors.push('精度必须在0-10之间');
    }
  }

  // 时间类型验证
  if (['time', 'date', 'datetime'].includes(type)) {
    if (attributes.format && !/^[YMDHms\-\s:]+$/.test(attributes.format)) {
      errors.push('时间格式不正确');
    }
  }

  // 选项验证
  if (attributes.options) {
    if (!Array.isArray(attributes.options)) {
      errors.push('选项必须是数组格式');
    } else {
      attributes.options.forEach((option, index) => {
        if (!option.label || !option.value) {
          errors.push(`选项${index + 1}的标签和值不能为空`);
        }
      });
    }
  }

  return errors;
}

/**
 * 格式化配置属性显示
 */
export function formatConfigAttributesDisplay(attributes: ConfigAttributes, type: string): string {
  if (!attributes || Object.keys(attributes).length === 0) {
    return '无特殊配置';
  }

  const parts: string[] = [];

  // 数字类型属性
  if (['int', 'float'].includes(type)) {
    if (attributes.min !== undefined) parts.push(`最小值: ${attributes.min}`);
    if (attributes.max !== undefined) parts.push(`最大值: ${attributes.max}`);
    if (attributes.step !== undefined) parts.push(`步长: ${attributes.step}`);
    if (attributes.precision !== undefined) parts.push(`精度: ${attributes.precision}`);
  }

  // 时间类型属性
  if (['time', 'date', 'datetime'].includes(type)) {
    if (attributes.format) parts.push(`格式: ${attributes.format}`);
    if (attributes.showTime) parts.push('显示时间');
    if (attributes.showSeconds) parts.push('显示秒数');
  }

  // 文本类型属性
  if (attributes.rows) parts.push(`行数: ${attributes.rows}`);
  if (attributes.maxLength) parts.push(`最大长度: ${attributes.maxLength}`);

  // 选项配置
  if (attributes.options && attributes.options.length > 0) {
    parts.push(`选项数量: ${attributes.options.length}`);
  }

  return parts.join(', ') || '无特殊配置';
}

/**
 * 合并配置属性
 */
export function mergeConfigAttributes(
  base: ConfigAttributes,
  override: ConfigAttributes
): ConfigAttributes {
  return { ...base, ...override };
}

/**
 * 创建选项配置
 */
export function createOptionConfig(label: string, value: string): OptionConfig {
  return { label, value };
}

/**
 * 批量创建选项配置
 */
export function createOptionConfigs(options: Array<{ label: string; value: string }>): OptionConfig[] {
  return options.map(option => createOptionConfig(option.label, option.value));
}
