import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MessagePlugin } from 'tdesign-vue-next';

// 创建 axios 实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 在这里可以添加认证信息等
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data.code && data.code !== 200) {
      MessagePlugin.error(data.msg || '请求失败');
      return Promise.reject(new Error(data.msg || '请求失败'));
    }
    return data;
  },
  (error) => {
    MessagePlugin.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = <T>(url: string, config?: AxiosRequestConfig) => {
  return http.get<T>(url, config);
};

// 封装 POST 请求
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.post<T>(url, data, config);
};

// 封装 PUT 请求
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.put<T>(url, data, config);
};

// 封装 DELETE 请求
export const del = <T>(url: string, config?: AxiosRequestConfig) => {
  return http.delete<T>(url, config);
};

export { http }; 