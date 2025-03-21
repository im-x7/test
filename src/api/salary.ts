import request from '@/utils/request';
import type { ApiResponse, SalaryListResponse, CreateSalaryParams, UpdateSalaryParams, SalaryDetailResponse } from '@/types/salary';

interface PageParams {
  current: number;
  pageSize: number;
}

interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

// 获取工资列表
export const getSalaryList = (params: PageParams & DateRangeParams & {
  employee_id?: string;
  store_id?: string;
}) => {
  return request.get<ApiResponse<SalaryListResponse>>('/salaries/list', { params });
};

// 获取工资详情
export const getSalaryDetail = (id: string) => {
  return request.get<ApiResponse<SalaryDetailResponse>>(`/salaries/${id}`);
};

// 创建工资记录
export const createSalary = (data: CreateSalaryParams) => {
  return request.post<ApiResponse<any>>('/salaries', data);
};

// 更新工资记录
export const updateSalary = (id: string, data: UpdateSalaryParams) => {
  return request.put<ApiResponse<any>>(`/salaries/${id}`, data);
};

// 删除工资记录
export const deleteSalary = (id: string) => {
  return request.delete<ApiResponse<null>>(`/salaries/${id}`);
};