/**
 * 标题生成器工具
 * 用于根据类别和计数器生成唯一的标题
 */

/**
 * 生成标题
 * @param category 类别名称
 * @param counter 计数器值
 * @returns 生成的标题字符串
 */
export function generateTitle(category: string, counter: number): string {
  // 格式化计数器为两位数
  const formattedCounter = counter.toString().padStart(2, '0');
  
  // 生成格式为 "类别-序号" 的标题
  return `${category}-${formattedCounter}`;
}
