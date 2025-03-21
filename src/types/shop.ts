export interface ShopInfo {
  id: string;
  name: string;
  status: 'active' | 'closed';
}

export interface EmployeePayment {
  id: string;
  name: string;
  totalAmount: number;
  paymentCount: number;
}

export interface OrderDetail {
  id: string;
  orderNo: string;
  amount: number;
  shopName: string;
  employeeName: string;
  createTime: string;
  status: 'completed' | 'processing';
}

export interface DateRange {
  startTime: string;
  endTime: string;
} 