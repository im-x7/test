import request from '../utils/request';

export interface ShopRole {
  id: string;
  name: string;
  role: 'employee' | 'manager' | 'partner';
  salary: {
    base: number;
    commission: number;
    profit: number;
    tattooCommission: number;
    piercingCommission: number;
    electronicCommission: number;
  };
}

export interface UserData {
  id?: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  systemRole: string;
  status: string;
  remark?: string;
  isReceptionist: boolean;
  receptionFee: number;
  shops: ShopRole[];
  salary: {
    base: number;
    commission: number;
    bonus: number;
  };
}

export interface User extends UserData {
  id: string;
  lastLoginTime?: string;
  createTime?: string;
  updateTime?: string;
  isReceptionist: boolean;
  receptionFee: number;
}

export interface UserListResponse {
  items: User[];
  total: number;
}

export function login(data: { username: string; password: string }) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  });
}

export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  });
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

// 获取用户列表
export function getUserList(params: { current: number; pageSize: number }) {
  console.log('调用获取用户列表 API，参数:', params);
  return request<{
    items: User[];
    total: number;
    current: number;
    pageSize: number;
  }>({
    url: '/user/list',
    method: 'get',
    params
  });
}

// 更新用户状态
export function updateUserStatus(id: string, status: '启用' | '禁用') {
  return request({
    url: `/user/${id}/status`,
    method: 'put',
    data: { status }
  });
}

// 创建用户
export function createUser(data: Omit<UserData, 'id'>) {
  return request({
    url: '/user',
    method: 'post',
    data
  });
}

// 更新用户
export function updateUser(id: string, data: Partial<UserData>) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  });
}

// 获取系统角色列表
export function getSystemRoles() {
  return request<Array<{ label: string; value: string }>>({
    url: '/user/system-roles',
    method: 'get'
  });
}

// 获取店铺列表
export function getStoreList() {
  return request<Array<{ id: string; name: string }>>({
    url: '/shop/list',
    method: 'get'
  });
}