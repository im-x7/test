import request from '@/utils/request';
import { ApiResponse } from '@/utils/request';

// 截图接口
export interface Screenshot {
  url: string;
  name: string;
  status: string;
}

// 电子服务接口
export interface ElectronicService {
  type: 'day' | 'night';
  shop: 'nanshan' | 'other';
  area: 'hallA' | 'hallB' | 'roomA' | 'roomB';
  receptionists: string[];
  phoneService: string;
  appointmentTime: string;
  arrivalTime: string;
  departureTime: string;
  stayEmployees: string[];
  additionalFee: number;
  meituan: PaymentMethodItem;
  shouqianba: PaymentMethodItem;
}

// 支付方式项目接口
export interface PaymentMethodItem {
  amount: number;
  screenshots: Screenshot[];
}

// 支付历史记录项接口
export interface PaymentHistoryItem {
  id?: string;
  paymentTime: string;
  amount: number;
  employeeName: string;
  deposit: PaymentMethodItem;
  meituan: PaymentMethodItem;
  qrcode: PaymentMethodItem;
  mapScan: PaymentMethodItem;
  cash: PaymentMethodItem;
}

// 服务类型
export type ServiceType = 'tattoo' | 'piercing' | 'electronic';

// 支付方式键
export type PaymentMethodKey = 'deposit' | 'meituan' | 'qrcode' | 'mapScan' | 'cash';

// 支付记录接口
export interface PaymentRecord {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  agreementId?: string;
  agreementStatus: boolean;
  videoUrl?: string;
  videoStatus: boolean;
  amount: number;
  shopId: string;
  shopName: string;
  employeeId: string;
  employeeName: string;
  serviceType: ServiceType;
  paymentTime: string;
  status: 'processing' | 'completed';
  remark: string;
  deposit: PaymentMethodItem;
  meituan: PaymentMethodItem;
  qrcode: PaymentMethodItem;
  mapScan: PaymentMethodItem;
  cash: PaymentMethodItem;
  paymentHistory: PaymentHistoryItem[];
  electronic?: ElectronicService;
  key?: string;
  [key: string]: any; // 添加索引签名
}

// 支付记录查询参数
export interface PaymentQueryParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  shopId?: string;
  startDate?: string;
  endDate?: string;
  status?: string[];
}

// API 响应类型
export interface PaymentListResponse {
  list: PaymentRecord[];
  total: number;
}

// 模拟数据存储
let mockPayments: PaymentRecord[] = [];

// 获取支付列表
export const getPaymentList = (params: PaymentQueryParams): Promise<ApiResponse<PaymentListResponse>> => {
  // 使用模拟数据
  console.log('获取支付列表:', params);
  
  // 如果没有模拟数据，创建一些初始数据
  if (mockPayments.length === 0) {
    mockPayments = [
      {
        id: '1001',
        orderNo: 'ORD-20230501-001',
        customerId: '1',
        customerName: '张三',
        agreementStatus: true,
        videoStatus: false,
        amount: 1000.00,
        shopId: '1',
        shopName: '总店',
        employeeId: '1',
        employeeName: '李四',
        serviceType: 'tattoo',
        paymentTime: '2023-05-01 10:00:00',
        status: 'completed',
        remark: '纹身服务',
        deposit: { amount: 200, screenshots: [] },
        meituan: { amount: 800, screenshots: [] },
        qrcode: { amount: 0, screenshots: [] },
        mapScan: { amount: 0, screenshots: [] },
        cash: { amount: 0, screenshots: [] },
        paymentHistory: [{
          paymentTime: '2023-05-01 10:00:00',
          amount: 1000.00,
          employeeName: '李四',
          deposit: { amount: 200, screenshots: [] },
          meituan: { amount: 800, screenshots: [] },
          qrcode: { amount: 0, screenshots: [] },
          mapScan: { amount: 0, screenshots: [] },
          cash: { amount: 0, screenshots: [] }
        }]
      },
      {
        id: '1002',
        orderNo: 'ORD-20230502-002',
        customerId: '2',
        customerName: '李四',
        agreementStatus: false,
        videoStatus: true,
        amount: 500.00,
        shopId: '2',
        shopName: '分店1',
        employeeId: '2',
        employeeName: '王五',
        serviceType: 'piercing',
        paymentTime: '2023-05-02 14:00:00',
        status: 'processing',
        remark: '穿孔服务',
        deposit: { amount: 0, screenshots: [] },
        meituan: { amount: 0, screenshots: [] },
        qrcode: { amount: 500, screenshots: [] },
        mapScan: { amount: 0, screenshots: [] },
        cash: { amount: 0, screenshots: [] },
        paymentHistory: [{
          paymentTime: '2023-05-02 14:00:00',
          amount: 500.00,
          employeeName: '王五',
          deposit: { amount: 0, screenshots: [] },
          meituan: { amount: 0, screenshots: [] },
          qrcode: { amount: 500, screenshots: [] },
          mapScan: { amount: 0, screenshots: [] },
          cash: { amount: 0, screenshots: [] }
        }]
      },
      {
        id: '1003',
        orderNo: 'ORD-20230503-003',
        customerId: '3',
        customerName: '王六',
        agreementStatus: true,
        videoStatus: true,
        amount: 300.00,
        shopId: '1',
        shopName: '总店',
        employeeId: '3',
        employeeName: '赵七',
        serviceType: 'electronic',
        paymentTime: '2023-05-03 09:30:00',
        status: 'completed',
        remark: '电子服务',
        deposit: { amount: 0, screenshots: [] },
        meituan: { amount: 0, screenshots: [] },
        qrcode: { amount: 200, screenshots: [] },
        mapScan: { amount: 0, screenshots: [] },
        cash: { amount: 100, screenshots: [] },
        paymentHistory: [{
          paymentTime: '2023-05-03 09:30:00',
          amount: 300.00,
          employeeName: '赵七',
          deposit: { amount: 0, screenshots: [] },
          meituan: { amount: 0, screenshots: [] },
          qrcode: { amount: 200, screenshots: [] },
          mapScan: { amount: 0, screenshots: [] },
          cash: { amount: 100, screenshots: [] }
        }]
      }
    ];
  }
  
  // 模拟分页
  const { page = 1, pageSize = 10 } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = mockPayments.slice(start, end);
  
  return Promise.resolve({
    code: 200,
    data: {
      list,
      total: mockPayments.length
    },
    msg: '成功'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request.get('/payments', { params });
  */
};

// 更新支付记录
export const updatePayment = (orderNo: string, data: Partial<PaymentRecord>): Promise<ApiResponse<PaymentRecord>> => {
  // 使用模拟数据
  console.log('更新支付记录:', orderNo, data);
  
  const index = mockPayments.findIndex(item => item.orderNo === orderNo);
  if (index !== -1) {
    mockPayments[index] = {
      ...mockPayments[index],
      ...data
    };
    
    return Promise.resolve({
      code: 200,
      data: mockPayments[index],
      msg: '更新成功'
    });
  }
  
  return Promise.reject({
    code: 404,
    msg: '支付记录不存在'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request.put(`/payments/${orderNo}`, data);
  */
};

// 删除支付记录
export const deletePayment = (orderNo: string): Promise<ApiResponse<null>> => {
  // 使用模拟数据
  console.log('删除支付记录:', orderNo);
  
  const index = mockPayments.findIndex(item => item.orderNo === orderNo);
  if (index !== -1) {
    mockPayments.splice(index, 1);
    return Promise.resolve({
      code: 200,
      data: null,
      msg: '删除成功'
    });
  }
  
  return Promise.reject({
    code: 404,
    msg: '支付记录不存在'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request.delete(`/payments/${orderNo}`);
  */
};

// 新增支付记录
export const addPayment = (data: Partial<PaymentRecord>): Promise<ApiResponse<PaymentRecord>> => {
  return request.post('/payments', data);
};

// 创建支付记录
export const createPayment = (data: any): Promise<ApiResponse<PaymentRecord>> => {
  return request.post('/payments', data);
};