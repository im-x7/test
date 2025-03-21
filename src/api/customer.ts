import request from '@/utils/request';
import type { ApiResponse, PageParams, DateRangeParams, PageResponse } from '@/types/common';
import type {
  CustomerData,
  CustomerDetail,
  CustomerOrder,
  CustomerQueryParams,
  CustomerCreateParams,
  CustomerUpdateParams,
  CustomerHealthInfo
} from '@/types/customer';

// 搜索客户
export const searchCustomers = (params: { phone: string }) => {
  return request.get<ApiResponse<CustomerData[]>>('/customers/search', { params });
};

// 创建客户
export const createCustomer = (data: CustomerCreateParams) => {
  return request.post<ApiResponse<CustomerData>>('/customers', data);
};

// 更新客户
export const updateCustomer = (id: string, data: CustomerUpdateParams) => {
  return request.put<ApiResponse<CustomerData>>(`/customers/${id}`, data);
};

// 获取客户详情
export const getCustomer = (id: string) => {
  return request.get<ApiResponse<CustomerDetail>>(`/customers/${id}`);
};

// 获取客户列表
export const getCustomerList = (params: PageParams & DateRangeParams & CustomerQueryParams) => {
  return request.get<ApiResponse<PageResponse<CustomerDetail>>>('/customers/list', { params });
};

// 获取客户订单列表
export const getCustomerOrders = (customerId: string, params: PageParams & DateRangeParams) => {
  return request.get<ApiResponse<PageResponse<CustomerOrder>>>(`/customers/${customerId}/orders`, { params });
};

// 更新客户健康信息
export const updateCustomerHealth = (id: string, data: CustomerHealthInfo) => {
  return request.put<ApiResponse<CustomerData>>(`/customers/${id}/health`, { health_info: data });
};

// 更新客户标签
export const updateCustomerTags = (id: string, tags: string[]) => {
  return request.put<ApiResponse<CustomerData>>(`/customers/${id}/tags`, { tags });
};

// 获取客户统计数据
export const getCustomerStatistics = (id: string, params: DateRangeParams) => {
  return request.get<ApiResponse<{
    total_orders: number;
    total_amount: number;
    average_amount: number;
    total_points: number;
    favorite_services: Array<{
      type: string;
      count: number;
      amount: number;
    }>;
    visit_times: {
      morning: number;
      afternoon: number;
      evening: number;
    };
  }>>(`/customers/${id}/statistics`, { params });
};

// 获取客户二维码
export const getCustomerQRCode = (customerId: string) => {
  return request.get<ApiResponse<{ url: string }>>(`/customers/${customerId}/qrcode`);
};