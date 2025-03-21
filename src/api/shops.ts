import axios from 'axios';

// 假设使用 axios 进行 API 请求
export const getShops = async (params: any) => {
  try {
    const response = await axios.get('/api/shops', { params });
    return response;
  } catch (error) {
    console.error('获取店铺数据失败:', error);
    throw error;
  }
};