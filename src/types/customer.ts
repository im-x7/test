import type { BaseEntity } from './common';

// 客户基础信息
export interface CustomerData extends BaseEntity {
  name: string;
  phone: string;
  id_card: string;
  signature: string;
  video?: string;
  store_id: string;
  employee_id: string;
  level: string;
  tags: string[];
  health_info?: {
    blood_type?: string;
    allergies?: string[];
    medical_history?: string;
  };
}

// 客户详细信息
export interface CustomerDetail extends CustomerData {
  store_name: string;
  employee_name: string;
  total_orders: number;
  total_amount: number;
  last_visit_time: string;
}

// 客户订单
export interface CustomerOrder extends BaseEntity {
  order_no: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  payment_status: string;
  services: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  employee: {
    id: string;
    name: string;
  };
}

// API请求参数类型
export interface CustomerQueryParams {
  keyword?: string;
  employee_id?: string;
  store_id?: string;
  level?: string;
}

export interface CustomerCreateParams extends Omit<CustomerData, keyof BaseEntity> {}

export interface CustomerUpdateParams extends Partial<CustomerCreateParams> {}

export interface CustomerHealthInfo {
  blood_type?: string;
  allergies?: string[];
  medical_history?: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
} 