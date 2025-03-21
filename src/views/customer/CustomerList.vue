<template>
  <div class="customer-list">
    <h2>客户列表</h2>
    
    <!-- 筛选条件 -->
    <t-card class="filter-card" :bordered="false">
      <t-form layout="inline">
        <t-form-item label="关键字搜索">
          <t-input v-model="filters.customerName" placeholder="请输入客户名称/微信号/手机号" style="width: 240px" />
        </t-form-item>
        

        
        <t-form-item label="创建时间">
          <t-date-range-picker
            v-model="filters.dateRange"
            mode="date"
            :placeholder="['开始日期', '结束日期']"
            style="width: 240px"
          />
        </t-form-item>
        
        <t-form-item>
          <t-button theme="primary" @click="handleSearch">查询</t-button>
          <t-button style="margin-left: 8px" @click="resetFilters">重置</t-button>
        </t-form-item>
      </t-form>
    </t-card>
    
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <t-button theme="primary" @click="handleAdd">新增客户</t-button>
    </div>
    
    <!-- 数据表格 -->
    <t-table 
      :columns="columns" 
      :data="customerList" 
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @page-change="handleTableChange"
      bordered
      stripe
      table-layout="fixed"
      style="width: 100%"
    >
      <!-- 表格列的操作列 -->
      <template #action="{ row }">
        <t-space>
          <t-button variant="text" @click="handleViewDetail(row)">详情</t-button>
          <t-button variant="text" @click="handleEdit(row)">编辑</t-button>
          <t-popconfirm
            content="确定要删除这条客户信息吗？"
            @confirm="handleDelete(row)"
          >
            <t-button variant="text" theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    
    <!-- 客户详情弹窗 -->
    <t-dialog
      v-model:visible="detailModalVisible"
      header="客户详情"
      :footer="false"
      width="700px"
      @after-leave="handleDialogAfterLeave"
    >
      <t-descriptions bordered :column="2" size="medium">
        <t-descriptions-item label="客户ID">
          {{ currentCustomer?.id }}
        </t-descriptions-item>
        <t-descriptions-item label="客户姓名">
          {{ currentCustomer?.name }}
        </t-descriptions-item>
        <t-descriptions-item label="性别">
          {{ currentCustomer?.gender === 1 ? '男' : '女' }}
        </t-descriptions-item>
        <t-descriptions-item label="微信号码">
          {{ currentCustomer?.wechat }}
        </t-descriptions-item>
        <t-descriptions-item label="手机号码">
          {{ currentCustomer?.phone }}
        </t-descriptions-item>
        <t-descriptions-item label="录入员工">
          {{ currentCustomer?.employeeName }}
        </t-descriptions-item>
        <t-descriptions-item label="创建时间">
          {{ currentCustomer?.createTime }}
        </t-descriptions-item>
        <t-descriptions-item label="客户备注" :span="2">
          {{ currentCustomer?.remark || '暂无备注' }}
        </t-descriptions-item>
      </t-descriptions>
      
      <div style="margin-top: 24px;">
        <h3>消费记录</h3>
        <t-table
          :columns="orderColumns"
          :data="customerOrders"
          :pagination="{ disabled: true }"
          row-key="orderNo"
          size="small"
        ></t-table>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getEmployeeOptions } from '../../constants/employees';
import { scheduleVisualUpdate, runInWorker } from '@/utils/performanceUtils';

const router = useRouter();
const loading = ref(false);
const customerList = ref<CustomerRecord[]>([]);

// 详情弹窗相关
const detailModalVisible = ref(false);
const currentCustomer = ref<CustomerRecord>({} as CustomerRecord);
const customerOrders = ref<any[]>([]);

// 订单记录表格列定义
const orderColumns = [
  {
    title: '订单编号',
    colKey: 'orderNo',
  },
  {
    title: '消费金额',
    colKey: 'amount',
    cell: ({ row }: { row: any }) => {
      if (!row || row.amount === undefined || row.amount === null) return '-';
      return `¥${Number(row.amount).toFixed(2)}`;
    },
  },
  {
    title: '消费时间',
    colKey: 'createTime',
  },
];

// 客户数据类型
interface CustomerRecord {
  id: string;     // 客户ID，主键
  name: string;   // 客户名称
  gender: number; // 性别，1表示男，2表示女
  wechat: string; // 微信号
  phone: string;  // 手机号
  employeeName: string; // 录入员工
  createTime: string;   // 创建时间
  remark?: string;      // 备注
}

// 筛选条件类型
interface Filters {
  customerName: string;
  employeeId: string;
  dateRange: string[];
}

// 员工选项列表
const employeeOptions = ref(getEmployeeOptions());

// 筛选条件
const filters = reactive<Filters>({
  customerName: '',
  employeeId: '',
  dateRange: []
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: true
});

// 表格列定义
const columns = [
  {
    title: '客户ID',
    colKey: 'id',
    sorter: (a: CustomerRecord, b: CustomerRecord) => a.id.localeCompare(b.id),
    width: 100,
  },
  {
    title: '客户名称',
    colKey: 'name',
    width: 120,
  },
  {
    title: '性别',
    colKey: 'gender',
    cell: ({ row }: { row: CustomerRecord }) => {
      if (!row || row.gender === undefined || row.gender === null) {
        return '-';
      }
      return row.gender === 1 ? '男' : '女';
    },
    width: 80,
  },
  {
    title: '微信号码',
    colKey: 'wechat',
    width: 120,
  },
  {
    title: '手机号码',
    colKey: 'phone',
    width: 120,
  },
  {
    title: '录入员工',
    colKey: 'employeeName',
    width: 100,
  },
  {
    title: '创建时间',
    colKey: 'createTime',
    width: 160,
  },
  {
    title: '备注',
    colKey: 'remark',
    ellipsis: true,
    width: 200,
    minWidth: 100,
  },
  {
    title: '操作',
    colKey: 'action',
    fixed: 'right',
    width: 180,
  },
];

// 存储全部客户数据
const allCustomerData = ref<CustomerRecord[]>([]);

// 模拟客户数据
const mockCustomerData = [
  {
    id: 'CUS001',
    name: '张三',
    gender: 1,
    wechat: 'zhangsan123',
    phone: '13800138001',
    employeeName: '李四',
    createTime: '2023-11-01 10:00:00',
    remark: '重要客户'
  },
  {
    id: 'CUS002',
    name: '王五',
    gender: 1,
    wechat: 'wangwu456',
    phone: '13800138002',
    employeeName: '李四',
    createTime: '2023-11-02 11:00:00',
    remark: ''
  },
  {
    id: 'CUS003',
    name: '赵六',
    gender: 2,
    wechat: 'zhaoliu789',
    phone: '13800138003',
    employeeName: '张三',
    createTime: '2023-11-03 12:00:00',
    remark: '新客户'
  },
  {
    id: 'CUS004',
    name: '刘七',
    gender: 1,
    wechat: 'liuqi777',
    phone: '13800138004',
    employeeName: '王八',
    createTime: '2023-11-04 13:00:00',
    remark: '高级会员'
  },
  {
    id: 'CUS005',
    name: '陈九',
    gender: 2,
    wechat: 'chenjiu999',
    phone: '13800138005',
    employeeName: '王八',
    createTime: '2023-11-05 14:00:00',
    remark: ''
  }
];

// 查询客户列表 - 简化版
const fetchCustomerList = () => {
  loading.value = true;
  
  // 直接使用模拟数据，不使用Web Worker
  setTimeout(() => {
    try {
      // 确保每条记录都有必要的字段
      const validatedData = mockCustomerData.map(item => {
        // 确保gender字段存在
        if (item.gender === undefined || item.gender === null) {
          console.warn(`客户 ${item.id} 缺少性别字段，设置为默认值1`);
          return { ...item, gender: 1 };
        }
        return item;
      });
      
      allCustomerData.value = validatedData;
      applyFiltersAndPagination();
    } catch (error) {
      console.error('加载客户数据时出错:', error);
      MessagePlugin.error('加载数据失败，请刷新页面重试');
    } finally {
      loading.value = false;
    }
  }, 300);
};

// 应用筛选和分页的统一函数
const applyFiltersAndPagination = () => {
  const filteredData = filterCustomerData();
  pagination.total = filteredData.length;
  applyPagination(filteredData);
  
  if (filteredData.length === 0 && (filters.customerName || filters.employeeId || filters.dateRange?.length)) {
    MessagePlugin.info('没有找到符合条件的客户');
  }
};

// 查询按钮点击事件 - 简化版
const handleSearch = () => {
  // 重置为第一页
  pagination.current = 1;
  loading.value = true;
  
  setTimeout(() => {
    applyFiltersAndPagination();
    loading.value = false;
  }, 300);
};

// 重置筛选条件
const resetFilters = () => {
  // 重置所有筛选条件
  filters.customerName = '';
  filters.employeeId = '';
  filters.dateRange = [];
  
  // 重置到第一页
  pagination.current = 1;
  
  // 刷新表格数据
  refreshTableData();
  
  // 提示用户
  MessagePlugin.info('已重置所有筛选条件');
};

// 新增客户
const handleAdd = () => {
  router.push('/customer/add');
};

// 过滤客户数据
const filterCustomerData = () => {
  if (!allCustomerData.value.length) return [];
  
  // 记录筛选条件使用情况
  const hasNameFilter = filters.customerName && filters.customerName.trim() !== '';
  const hasEmployeeFilter = filters.employeeId && filters.employeeId.trim() !== '';
  const hasDateFilter = filters.dateRange && Array.isArray(filters.dateRange) && filters.dateRange.length === 2;
  
  // 如果有筛选条件，输出一次日志
  if (hasNameFilter || hasEmployeeFilter || hasDateFilter) {
    console.log('应用筛选条件:', {
      客户信息: hasNameFilter ? filters.customerName : '无',
      员工: hasEmployeeFilter ? filters.employeeId : '无',
      时间范围: hasDateFilter ? `${filters.dateRange[0]} 至 ${filters.dateRange[1]}` : '无'
    });
  }
  
  const result = allCustomerData.value.filter(item => {
    // 确保数据完整性
    if (!item || typeof item !== 'object') {
      return false;
    }
    
    // 客户名称/微信号/手机号筛选
    if (hasNameFilter) {
      const keyword = filters.customerName.trim().toLowerCase();
      const nameMatch = item.name && item.name.toLowerCase().includes(keyword);
      const wechatMatch = item.wechat && item.wechat.toLowerCase().includes(keyword);
      const phoneMatch = item.phone && item.phone.toLowerCase().includes(keyword);
      
      if (!(nameMatch || wechatMatch || phoneMatch)) {
        return false;
      }
    }
    
    // 员工筛选
    if (hasEmployeeFilter) {
      const employeeName = getEmployeeName(filters.employeeId);
      if (item.employeeName !== employeeName) {
        return false;
      }
    }
    
    // 创建时间范围筛选
    if (hasDateFilter) {
      try {
        const startDate = new Date(filters.dateRange[0]).getTime();
        const endDate = new Date(filters.dateRange[1]).getTime();
        
        // 确保日期有效
        if (!isNaN(startDate) && !isNaN(endDate) && item.createTime) {
          const itemDate = new Date(item.createTime).getTime();
          
          if (isNaN(itemDate) || itemDate < startDate || itemDate > endDate) {
            return false;
          }
        }
      } catch (error) {
        console.error('日期过滤器错误:', error);
      }
    }
    
    return true;
  });
  
  return result;
};

// 获取员工名称
const getEmployeeName = (employeeId: string) => {
  const employee = employeeOptions.value.find(e => e.value === employeeId);
  return employee ? employee.label : '';
};

// 应用分页
const applyPagination = (data: CustomerRecord[]) => {
  if (!data || !Array.isArray(data)) {
    console.warn('应用分页时数据无效:', data);
    customerList.value = [];
    return;
  }
  
  try {
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    
    // 确保分页范围有效
    if (start < 0 || start >= data.length) {
      console.warn(`分页起始位置无效: ${start}, 数据长度: ${data.length}`);
      pagination.current = 1; // 重置到第一页
      customerList.value = data.slice(0, pageSize);
    } else {
      customerList.value = data.slice(start, end);
    }
    
    console.log('当前分页数据:', customerList.value);
  } catch (error) {
    console.error('应用分页时出错:', error);
    customerList.value = [];
  }
};

// 表格分页变化
const handleTableChange = (pageInfo: { current: number, pageSize: number }) => {
  console.log('分页变化:', pageInfo);
  
  // 更新分页信息
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  
  // 显示加载状态
  loading.value = true;
  
  // 使用setTimeout确保加载状态能够正确显示
  setTimeout(() => {
    try {
      // 重新过滤数据
      const filteredData = filterCustomerData();
      
      // 应用分页
      applyPagination(filteredData);
    } catch (error) {
      console.error('分页处理时出错:', error);
      MessagePlugin.error('分页处理失败，请重试');
    } finally {
      loading.value = false;
    }
  }, 100);
};

// 处理表格数据刷新
// 注意：这个函数会在删除客户后被调用，以保持表格样式一致性
const refreshTableData = () => {
  loading.value = true;
  
  setTimeout(() => {
    try {
      const filteredData = filterCustomerData();
      pagination.total = filteredData.length;
      
      // 如果当前页没有数据了，返回上一页
      const maxPage = Math.ceil(filteredData.length / pagination.pageSize);
      if (pagination.current > maxPage && maxPage > 0) {
        pagination.current = maxPage;
      }
      
      applyPagination(filteredData);
      
      // 如果没有数据，显示提示
      if (filteredData.length === 0) {
        MessagePlugin.info('没有找到符合条件的客户');
      }
    } catch (error) {
      console.error('刷新表格数据时出错:', error);
      MessagePlugin.error('数据处理失败，请重试');
    } finally {
      loading.value = false;
    }
  }, 100);
};

// 查看客户详情
const handleViewDetail = (row: CustomerRecord) => {
  currentCustomer.value = row;
  fetchCustomerOrders(row.id);
  detailModalVisible.value = true;
};

// 处理关闭详情弹窗
const handleDialogAfterLeave = () => {
  // 在对话框关闭动画完成后重置数据
  customerOrders.value = [];
  currentCustomer.value = {
    id: '',
    name: '',
    gender: 1,
    wechat: '',
    phone: '',
    employeeName: '',
    createTime: '',
    remark: ''
  };
};

// 获取客户订单记录
const fetchCustomerOrders = async (_customerId: string) => {
  // 先清空订单列表
  customerOrders.value = [];
  // 使用Web Worker生成模拟订单数据
  const generateOrdersWorker = `
    function generateOrders(customerId) {
      // 模拟订单数据
      return [
        {
          orderNo: 'ORD20231101',
          amount: 1000,
          createTime: '2023-11-01 10:00:00'
        },
        {
          orderNo: 'ORD20231102',
          amount: 2000,
          createTime: '2023-11-02 11:00:00'
        }
      ].map(order => ({
        ...order,
        key: order.orderNo // 确保每条记录都有唯一的key
      }));
    }
  `
  
  try {
    // 执行Web Worker
    const orders = await runInWorker(generateOrdersWorker, _customerId);
    // 使用scheduleVisualUpdate更新UI
    scheduleVisualUpdate(() => {
      customerOrders.value = (orders as any[]).map(order => ({
        orderNo: order.orderNo,
        amount: order.amount,
        createTime: order.createTime,
        key: order.orderNo
      }));
    });
  } catch (err) {
    console.error('Error generating customer orders:', err);
  }
};

// 编辑客户
const handleEdit = (row: CustomerRecord) => {
  router.push(`/customer/edit/${row.id}`);
};

// 删除客户
const handleDelete = (row: CustomerRecord) => {
  // 显示加载状态
  loading.value = true;
  
  // 模拟删除操作
  setTimeout(() => {
    try {
      // 先从原始数据中删除
      console.log('删除前数据长度:', allCustomerData.value.length);
      console.log('删除的客户ID:', row.id);
      
      // 使用filter删除指定客户
      allCustomerData.value = allCustomerData.value.filter(item => item.id !== row.id);
      
      console.log('删除后数据长度:', allCustomerData.value.length);
      
      // 使用refreshTableData函数刷新表格数据
      refreshTableData();
      
      // 显示成功提示
      MessagePlugin.success('删除成功');
    } catch (error) {
      console.error('删除客户时出错:', error);
      MessagePlugin.error('删除失败，请重试');
    } finally {
      loading.value = false;
    }
  }, 300);
};

onMounted(() => {
  // 增加延迟时间，确保组件完全挂载后再加载数据
  setTimeout(() => {
    console.log('开始加载客户数据...');
    fetchCustomerList();
  }, 300);
});
</script>

<style scoped>
.customer-list {
  padding: 24px;
}
.filter-card {
  margin-bottom: 24px;
}
.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
/* 表格容器样式 */
:deep(.t-table) {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}
:deep(.t-table__row) {
  transition: none; /* 禁用行高变化的过渡效果 */
}
:deep(.t-table__cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>