import request from '@/utils/request';
import type { ApiResponse, PageParams, Store as BaseStore, Employee as BaseEmployee } from '@/types/common';

interface Store extends BaseStore {
  address: string;
  phone: string;
  status: string;
  create_time: string;
}

interface StoreDetail extends Store {
  employee_count: number;
  qr_code: string;
  remark: string;
  update_time: string;
}

interface StoreEmployee extends BaseEmployee {
  position: string;
  status: boolean;
  store_id: string;
}

// 获取门店列表
export function getStoreList(params: PageParams & {
  keyword?: string;
  status?: string;
}) {
  return request.get<ApiResponse<{
    list: Store[];
    total: number;
  }>>('/stores/list', { params });
}

// 获取门店员工列表
export function getStoreEmployees(storeId: string, params: PageParams & {
  position?: string;
  status?: string;
}) {
  return request.get<ApiResponse<{
    list: StoreEmployee[];
    total: number;
  }>>(`/stores/${storeId}/employees`, { params });
}

// 获取门店详情
export function getStoreDetail(id: string) {
  return request.get<ApiResponse<StoreDetail>>(`/stores/${id}`);
}

// 创建门店
export function createStore(data: Omit<Store, 'id' | 'create_time'>) {
  return request.post<ApiResponse<Store>>('/stores', data);
}

// 更新门店信息
export function updateStore(id: string, data: Partial<Store>) {
  return request.put<ApiResponse<Store>>(`/stores/${id}`, data);
}

// 删除门店
export function deleteStore(id: string) {
  return request.delete<ApiResponse<null>>(`/stores/${id}`);
}

// 切换门店营业状态
export function updateStoreStatus(id: string, status: 'open' | 'closed') {
  return request.put<ApiResponse<Store>>(`/stores/${id}/status`, { status });
}

// 获取门店统计数据
export function getStoreStatistics(id: string, params: {
  start_date?: string;
  end_date?: string;
}) {
  return request.get<ApiResponse<{
    total_orders: number;
    total_amount: number;
    employee_count: number;
    customer_count: number;
  }>>(`/stores/${id}/statistics`, { params });
}