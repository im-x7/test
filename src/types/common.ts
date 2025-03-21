// API响应格式
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T | null;
}

// 分页参数
export interface PageParams {
  current: number;
  pageSize: number;
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
}

// 日期范围参数
export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

// 基础实体属性
export interface BaseEntity {
  id: string;
  create_time: string;
  update_time: string;
}

// 门店信息
export interface Store {
  id: string;
  name: string;
}

// 员工信息
export interface Employee {
  id: string;
  name: string;
}

// 客户信息
export interface Customer {
  id: string;
  name: string;
  phone: string;
}

// 统计数据基础接口
export interface BaseStatistics {
  total_count: number;
  total_amount: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

// 导出所有类型
export default {
  ApiResponse,
  PageParams,
  PageResponse,
  DateRangeParams,
  BaseEntity,
  Store,
  Employee,
  Customer,
  BaseStatistics
}; 