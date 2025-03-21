import http from '@/utils/request';
import type { ShopInfo, EmployeePayment, OrderDetail, DateRange } from '@/types/shop';

export const getShopDetail = (shopId: string) => {
  console.log('Requesting shop detail for shopId:', shopId);
  return http.get<ShopInfo>(`/api/shops/${shopId}`);
};

export const getEmployeePayments = (shopId: string, params: DateRange) => {
  console.log('Requesting employee payments for shopId:', shopId, 'params:', params);
  return http.get<EmployeePayment[]>(`/api/shops/${shopId}/employee-payments`, { params });
};

export const getEmployeeOrders = (shopId: string, employeeId: string, params: DateRange) => {
  console.log('Requesting employee orders for shopId:', shopId, 'employeeId:', employeeId, 'params:', params);
  return http.get<OrderDetail[]>(`/api/shops/${shopId}/employees/${employeeId}/orders`, { params });
}; 