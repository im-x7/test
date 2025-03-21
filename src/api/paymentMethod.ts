import request from '../utils/request';

// 模拟支付方式数据
const mockPaymentMethods = [
  {
    id: '1',
    name: '微信支付',
    code: 'wechat',
    feeRate: 0.006,
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '2',
    name: '支付宝',
    code: 'alipay',
    feeRate: 0.006,
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '3',
    name: '现金',
    code: 'cash',
    feeRate: 0,
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '4',
    name: '银行卡',
    code: 'bank_card',
    feeRate: 0.005,
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '5',
    name: '其他',
    code: 'other',
    feeRate: 0,
    status: false,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  }
];

// 模拟数据处理函数
const getMockPaymentMethods = (params?: any) => {
  const { page = 1, pageSize = 10 } = params || {};
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = mockPaymentMethods.slice(start, end);
  
  return {
    list,
    total: mockPaymentMethods.length
  };
};

// 生成新ID
const generateId = () => {
  return String(Math.floor(Math.random() * 1000) + 6);
};

// 获取当前时间
const getCurrentTime = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

// 获取支付方式列表
export const getPaymentMethodList = (params?: any) => {
  // 使用模拟数据替代实际API请求
  console.log('使用模拟支付方式数据', params);
  const mockData = getMockPaymentMethods(params);
  
  return Promise.resolve({
    code: 200,
    data: mockData,
    message: '成功'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request({
    url: '/payment-method/list',
    method: 'get',
    params
  });
  */
};

// 创建支付方式
export const createPaymentMethod = (data: any) => {
  // 使用模拟数据替代实际API请求
  console.log('创建支付方式', data);
  
  const newPaymentMethod = {
    ...data,
    id: generateId(),
    createTime: getCurrentTime(),
    updateTime: getCurrentTime()
  };
  
  mockPaymentMethods.push(newPaymentMethod);
  
  return Promise.resolve({
    code: 200,
    data: newPaymentMethod,
    message: '创建成功'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request({
    url: '/payment-method',
    method: 'post',
    data
  });
  */
};

// 更新支付方式
export const updatePaymentMethod = (id: string, data: any) => {
  // 使用模拟数据替代实际API请求
  console.log('更新支付方式', id, data);
  
  const index = mockPaymentMethods.findIndex(item => item.id === id);
  if (index !== -1) {
    mockPaymentMethods[index] = {
      ...mockPaymentMethods[index],
      ...data,
      updateTime: getCurrentTime()
    };
  }
  
  return Promise.resolve({
    code: 200,
    data: index !== -1 ? mockPaymentMethods[index] : null,
    message: '更新成功'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request({
    url: `/payment-method/${id}`,
    method: 'put',
    data
  });
  */
};

// 切换支付方式状态
export const togglePaymentMethodStatus = (id: string, status: boolean) => {
  // 使用模拟数据替代实际API请求
  console.log('切换支付方式状态', id, status);
  
  const index = mockPaymentMethods.findIndex(item => item.id === id);
  if (index !== -1) {
    mockPaymentMethods[index].status = status;
    mockPaymentMethods[index].updatedAt = getCurrentTime();
  }
  
  return Promise.resolve({
    code: 200,
    data: index !== -1 ? mockPaymentMethods[index] : null,
    message: '状态更新成功'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request({
    url: `/payment-method/${id}/status`,
    method: 'patch',
    data: { status }
  });
  */
};

// 删除支付方式
export const deletePaymentMethod = (id: string) => {
  // 使用模拟数据替代实际API请求
  console.log('删除支付方式', id);
  
  const index = mockPaymentMethods.findIndex(item => item.id === id);
  if (index !== -1) {
    mockPaymentMethods.splice(index, 1);
  }
  
  return Promise.resolve({
    code: 200,
    data: null,
    message: '删除成功'
  });
  
  // 实际API请求（暂时注释）
  /*
  return request({
    url: `/payment-method/${id}`,
    method: 'delete'
  });
  */
};