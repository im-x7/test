import request from '@/utils/request';
import type { ApiResponse, PageParams, DateRangeParams, Employee as BaseEmployee } from '@/types/common';

interface Employee extends BaseEmployee {
  phone: string;
  avatar: string;
  gender: 'male' | 'female';
  birthday: string;
  id_card: string;
  address: string;
  store: {
    id: string;
    name: string;
  };
  position: string;
  status: 'active' | 'inactive';
  entry_date: string;
  leave_date: string | null;
  salary: {
    base_salary: number;
    commission_rate: number;
  };
  skills: string[];
  work_days: string[];
  work_time: {
    start: string;
    end: string;
  };
  create_time: string;
  update_time: string;
  remark: string;
}

// 获取员工列表
export const getEmployeeList = (params: PageParams & {
  status?: string;
  store_id?: string;
  position?: string;
  keyword?: string;
}) => {
  return request.get<ApiResponse<{
    list: Employee[];
    total: number;
  }>>('/employees/list', { params });
};

// 获取员工详情
export const getEmployeeDetail = (id: string) => {
  return request.get<ApiResponse<Employee>>(`/employees/${id}`);
};

// 创建员工
export const createEmployee = (data: Omit<Employee, 'id' | 'create_time' | 'update_time'>) => {
  return request.post<ApiResponse<Employee>>('/employees', data);
};

// 更新员工信息
export const updateEmployee = (id: string, data: Partial<Employee>) => {
  return request.put<ApiResponse<Employee>>(`/employees/${id}`, data);
};

// 删除员工
export const deleteEmployee = (id: string) => {
  return request.delete<ApiResponse<null>>(`/employees/${id}`);
};

// 更新员工状态
export const updateEmployeeStatus = (id: string, data: {
  status: 'active' | 'inactive';
  leave_date?: string;
}) => {
  return request.put<ApiResponse<Employee>>(`/employees/${id}/status`, data);
};

// 更新员工工作时间
export const updateEmployeeSchedule = (id: string, data: {
  work_days: string[];
  work_time: {
    start: string;
    end: string;
  };
}) => {
  return request.put<ApiResponse<Employee>>(`/employees/${id}/schedule`, data);
};

// 更新员工薪资配置
export const updateEmployeeSalary = (id: string, data: {
  base_salary: number;
  commission_rate: number;
}) => {
  return request.put<ApiResponse<Employee>>(`/employees/${id}/salary`, data);
};

// 获取员工业绩统计
export const getEmployeePerformance = (id: string, params: DateRangeParams) => {
  return request.get<ApiResponse<{
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_amount: number;
    commission_amount: number;
    customer_satisfaction: number;
  }>>(`/employees/${id}/performance`, { params });
};