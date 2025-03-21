import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { MessagePlugin } from 'tdesign-vue-next';
import { API_CONFIG } from '@/config/api.config';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 扩展 AxiosResponse 类型
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    code: number;
    data: T;
    msg: string;
  }
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    });
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('收到响应:', response.data);
    const { data } = response;
    console.log('API Response:', data);
    if (data.code === 0) {
      return data.data;
    }
    console.error('API Error:', data);
    MessagePlugin.error(data.msg || '请求失败');
    return Promise.reject(new Error(data.msg || '请求失败'));
  },
  (error) => {
    console.error('响应错误:', error);
    console.error('Request Config:', error.config);
    console.error('Response Data:', error.response?.data);
    MessagePlugin.error(error.response?.data?.msg || '请求失败');
    return Promise.reject(error);
  }
);

export default service;