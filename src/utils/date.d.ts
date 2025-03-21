/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化模式，默认为 YYYY-MM-DD
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format?: string): string;

/**
 * 获取当月第一天
 * @returns 当月第一天的日期字符串
 */
export function getFirstDayOfMonth(): string;

/**
 * 获取当月最后一天
 * @returns 当月最后一天的日期字符串
 */
export function getLastDayOfMonth(): string;

/**
 * 获取指定月份的第一天
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 指定月份第一天的日期字符串
 */
export function getFirstDayOfSpecificMonth(year: number, month: number): string;

/**
 * 获取指定月份的最后一天
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 指定月份最后一天的日期字符串
 */
export function getLastDayOfSpecificMonth(year: number, month: number): string; 