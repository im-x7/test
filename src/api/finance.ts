// import request from '@/utils/request'; // 删除未使用的导入

// 模拟财务盘点数据
const mockFinanceData = {
  records: [
    {
      key: '1',
      shopId: '1',
      shopName: '总店',
      period: '2023-10',
      totalAmount: 89234.56,
      supplyCost: 25000.00,
      profit: 64234.56,
      createdAt: '2023-11-01 10:00:00'
    },
    {
      key: '2',
      shopId: '2',
      shopName: '分店1',
      period: '2023-10',
      totalAmount: 45678.90,
      supplyCost: 15000.00,
      profit: 30678.90,
      createdAt: '2023-11-01 10:05:00'
    },
    {
      key: '3',
      shopId: '1',
      shopName: '总店',
      period: '2023-09',
      totalAmount: 85123.45,
      supplyCost: 24000.00,
      profit: 61123.45,
      createdAt: '2023-10-01 09:00:00'
    },
    {
      key: '4',
      shopId: '2',
      shopName: '分店1',
      period: '2023-09',
      totalAmount: 42567.80,
      supplyCost: 14500.00,
      profit: 28067.80,
      createdAt: '2023-10-01 09:05:00'
    }
  ],
  total: 4
};

// 模拟员工业绩数据
const mockEmployeePerformanceData = {
  employeeRecords: [
    {
      id: '1',
      name: '张三',
      role: 'employee',
      shops: [
        {
          id: '1',
          name: '总店',
          salary: {
            base: 5000,
            commission: 5,
            profit: 0
          },
          income: {
            base: 5000,
            commission: 2500,
            profit: 0,
            total: 7500
          },
          services: {
            tattoo: 3500,
            piercing: 2000,
            electronic: 2000
          }
        },
        {
          id: '2',
          name: '分店1',
          salary: {
            base: 4500,
            commission: 5,
            profit: 0
          },
          income: {
            base: 4500,
            commission: 1800,
            profit: 0,
            total: 6300
          },
          services: {
            tattoo: 2500,
            piercing: 1800,
            electronic: 2000
          }
        }
      ]
    },
    {
      id: '2',
      name: '李四',
      role: 'manager',
      shops: [
        {
          id: '2',
          name: '分店1',
          salary: {
            base: 0,
            commission: 8,
            profit: 0
          },
          income: {
            base: 0,
            commission: 4000,
            profit: 0,
            total: 4000
          },
          services: {
            tattoo: 3000,
            piercing: 2500,
            electronic: 1500
          }
        }
      ]
    },
    {
      id: '3',
      name: '王五',
      role: 'employee',
      shops: [
        {
          id: '1',
          name: '总店',
          salary: {
            base: 4800,
            commission: 5,
            profit: 0
          },
          income: {
            base: 4800,
            commission: 2200,
            profit: 0,
            total: 7000
          },
          services: {
            tattoo: 2800,
            piercing: 1500,
            electronic: 2700
          }
        }
      ]
    }
  ],
  shopRecords: [
    {
      id: '1',
      name: '总店',
      employees: [
        {
          id: '1',
          name: '张三',
          role: 'employee',
          salary: {
            base: 5000,
            commission: 5,
            profit: 0
          },
          income: {
            base: 5000,
            commission: 2500,
            profit: 0,
            total: 7500
          }
        },
        {
          id: '3',
          name: '王五',
          role: 'employee',
          salary: {
            base: 4800,
            commission: 5,
            profit: 0
          },
          income: {
            base: 4800,
            commission: 2200,
            profit: 0,
            total: 7000
          }
        }
      ]
    },
    {
      id: '2',
      name: '分店1',
      employees: [
        {
          id: '1',
          name: '张三',
          role: 'employee',
          salary: {
            base: 4500,
            commission: 5,
            profit: 0
          },
          income: {
            base: 4500,
            commission: 1800,
            profit: 0,
            total: 6300
          }
        },
        {
          id: '2',
          name: '李四',
          role: 'manager',
          salary: {
            base: 0,
            commission: 8,
            profit: 0
          },
          income: {
            base: 0,
            commission: 4000,
            profit: 0,
            total: 4000
          }
        }
      ]
    }
  ]
};

// 类型定义
export interface Salary {
  base: number
  commission: number
  profit: number
}

export interface Income {
  base: number
  commission: number
  profit: number
  total: number
}

export interface Services {
  tattoo: number
  piercing: number
  electronic: number
  [key: string]: number
}

export interface Shop {
  id: string
  name: string
  salary: Salary
  income: Income
  services: Services
}

export interface Employee {
  id: string
  name: string
  role: string
  shops: Shop[]
}

export interface ShopRecord {
  id: string
  name: string
  employees: {
    id: string
    name: string
    role: string
    salary: Salary
    income: Income
  }[]
}

export interface EmployeePerformanceResponse {
  records: Employee[] | ShopRecord[]
  total: number
}

// 获取财务盘点列表
export function getFinanceList(params: any) {
  // 生成当前月份的模拟数据
  const currentPeriod = params.period || new Date().toISOString().slice(0, 7);
  const mockData = {
    records: mockFinanceData.records.map(record => ({
      ...record,
      period: currentPeriod
    })),
    total: mockFinanceData.records.length,
    statistics: {
      totalAmount: 134913.46,
      amountGrowth: 5.8,
      totalOrders: 245,
      orderGrowth: 3.2,
      averageAmount: 550.67,
      averageGrowth: 2.5
    }
  };
  
  console.log('使用模拟财务盘点数据', mockData);
  
  // 直接返回模拟数据，不进行实际API请求
  return Promise.resolve({
    code: 200,
    data: mockData
  });
}

// 生成财务盘点数据
export function countFinance(_data: any) {
  // 直接返回模拟数据，不进行实际API请求
  console.log('使用模拟财务盘点生成');
  return Promise.resolve({
    code: 200,
    data: {
      success: true,
      message: '盘点数据已生成'
    }
  });
}

// 获取员工业绩数据
export function getEmployeePerformance(params: {
  dimension: 'employee' | 'shop'
  dateRange: string[]
}): Promise<{
  code: number
  data: EmployeePerformanceResponse
}> {
  // 直接返回模拟数据，不进行实际API请求
  console.log('使用模拟员工业绩数据');
  
  const { dimension, dateRange } = params;
  const [_startDate] = dateRange;
  
  // 根据维度返回不同的数据结构
  const data = dimension === 'employee' 
    ? {
        records: mockEmployeePerformanceData.employeeRecords,
        total: mockEmployeePerformanceData.employeeRecords.length
      }
    : {
        records: mockEmployeePerformanceData.shopRecords,
        total: mockEmployeePerformanceData.shopRecords.length
      };
  
  return Promise.resolve({
    code: 200,
    data
  });
}