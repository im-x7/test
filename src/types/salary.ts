// 工资记录数据类型
export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  shopId: string;
  shopName: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  deduction: number;
  total: number;
  month: string;
  remark?: string;
  create_time: string;
  store: {
    id: string;
    name: string;
  };
  employee: {
    id: string;
    name: string;
    store_id: string;
  };
  tattoo_amount: number;
  accessory_amount: number;
  electronic_amount: number;
  materials_amount: number;
  brushing_amount: number;
  payment_date: string;
  amount: number;
}

// 接口响应类型
export interface ApiResponse<T> {
  code: number;
  msg?: string;
  data: T;
}

// 工资列表响应类型
export interface SalaryListResponse {
  list: SalaryRecord[];
  total: number;
}

// 工资列表查询参数
export interface SalaryListParams {
  current: number;
  pageSize: number;
  employeeId?: string;
  shopId?: string;
  startDate?: string;
  endDate?: string;
}

// 创建工资记录参数
export interface CreateSalaryParams {
  employeeId: string;
  shopId: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  deduction: number;
  month: string;
  remark?: string;
}

// 更新工资记录参数
export interface UpdateSalaryParams {
  baseSalary?: number;
  commission?: number;
  bonus?: number;
  deduction?: number;
  remark?: string;
}

// 工资详情响应类型
export interface EmployeeDetail {
  id: string;
  name: string;
  baseSalary: number;
  position?: string; // 职位
  hireDate?: string; // 入职时间
  workYears?: string; // 工龄
  commissionRate?: string; // 提成比例
  income: {
    tattoo: number;
    accessory: number;
    electronic: number;
    details: Array<{
      date: string;
      serviceType: string;
      amount: number;
    }>;
  };
  expenses: {
    materials: number;
    brushing: number;
    tattoo: number;
    details: Array<{
      name: string;
      type: 'brushing' | 'materials' | 'tattoo';
      amount: number;
      date: string;
    }>;
  };
  payments: Array<{
    date: string;
    amount: number;
    type: string;
  }>;
  totalSalary: number;
}

export interface SalaryDetailResponse {
  employees: EmployeeDetail[];
  income: {
    tattoo: number;
    accessory: number;
    electronic: number;
    details: Array<{
      date: string;
      serviceType: string;
      amount: number;
    }>;
  };
  expenses: {
    materials: number;
    brushing: number;
    tattoo: number;
    details: Array<{
      name: string;
      type: 'brushing' | 'materials' | 'tattoo';
      amount: number;
      date: string;
    }>;
  };
  payments: Array<{
    date: string;
    amount: number;
    type: string;
  }>;
} 