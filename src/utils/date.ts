import dayjs from 'dayjs';

export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
} as const;

export type DateFormat = keyof typeof DATE_FORMAT;

/**
 * 字符串转时间戳(秒)
 */
export const dateToTimestamp = (date: string): number => {
  return Math.floor(dayjs(date).valueOf() / 1000);
};

/**
 * 指定格式的字符串转时间戳(秒)
 */
export const parseToTimestamp = (
  dateStr: string,
  format: DateFormat | string = 'DATE_TIME'
): number => {
  const formatStr = DATE_FORMAT[format as DateFormat] || format;
  return Math.floor(dayjs(dateStr, formatStr).valueOf() / 1000);
};

/**
 * 时间戳(秒)转字符串
 */
export const timestampToDate = (timestamp?: number, format: DateFormat = 'DATE_TIME'): string => {
  if (!timestamp) return '-';
  return dayjs(timestamp * 1000).format(DATE_FORMAT[format]);
};

/**
 * 格式化日期
 */
export const formatDate = (
  date?: string | number | Date,
  format: DateFormat = 'DATE_TIME'
): string => {
  if (!date) return '-';
  return dayjs(date).format(DATE_FORMAT[format]);
};
