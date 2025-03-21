import { getEnvValue } from '@/utils/env';

export const API_CONFIG = {
  baseURL: getEnvValue('VITE_API_BASE_URL', '/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  user: {
    login: '/user/login',
    logout: '/user/logout',
    info: '/user/info',
    list: '/user/list',
    create: '/user/create',
    update: '/user/update',
    delete: '/user/delete',
  },
  payment: {
    list: '/payment/list',
    create: '/payment/create',
    update: '/payment/update',
    delete: '/payment/delete',
    detail: '/payment/detail',
  },
  // ... 其他接口配置
}; 