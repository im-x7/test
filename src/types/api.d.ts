// API 响应格式
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

// 分页响应数据
export interface PaginationData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户相关类型
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

// 支付相关类型
export interface PaymentInfo {
  id: number;
  orderNo: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createTime: string;
  updateTime: string;
}

// 商店相关类型
export interface ShopInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
} 