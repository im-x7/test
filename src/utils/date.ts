/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化模式，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * 获取当月第一天
 * @returns 当月第一天的日期字符串
 */
export function getFirstDayOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  return formatDate(date);
}

/**
 * 获取当月最后一天
 * @returns 当月最后一天的日期字符串
 */
export function getLastDayOfMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return formatDate(date);
}

/**
 * 获取指定月份的第一天
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 指定月份第一天的日期字符串
 */
export function getFirstDayOfSpecificMonth(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return formatDate(date);
}

/**
 * 获取指定月份的最后一天
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 指定月份最后一天的日期字符串
 */
export function getLastDayOfSpecificMonth(year: number, month: number): string {
  const date = new Date(year, month, 0);
  return formatDate(date);
} 