<template>
  <div class="page-container">
    <div class="shop-detail-container">
      <t-card :bordered="false" class="card-container">
        <template #header>
          <div class="card-title">
            <t-date-range-picker
              v-model="dateRange"
              :disabled-date="disabledDate"
              enable-time-picker
              format="YYYY-MM-DD HH:mm"
              @change="handleDateChange"
              style="width: 350px"
            />
          </div>
        </template>
        
        <t-table 
          :columns="columns"
          :data="employeeList"
          :loading="loading"
          :pagination="null"
          row-key="id"
          :empty="'暂无数据'"
        >
          <template #name="{ row }">
            {{ row.name }}
          </template>
          <template #amount="{ row }">
            ¥{{ row.totalAmount.toFixed(2) }}
          </template>
          <template #op="{ row }">
            <t-button 
              theme="primary" 
              variant="text" 
              @click="showOrderDetail(row)"
              :class="{ active: selectedEmployeeId === row.id }"
            >
              详情
            </t-button>
          </template>
        </t-table>
      </t-card>
    </div>

    <transition name="slide-left">
      <div v-if="showOrderList" class="order-detail-container">
        <t-card :bordered="false" class="card-container">
          <template #header>
            <div class="card-title">
              <div class="employee-info">
                <span class="employee-name">{{ selectedEmployee?.name }}</span>
                <span class="order-title">的订单详情</span>
              </div>
              <t-button theme="default" variant="text" @click="closeOrderDetail">
                <t-icon name="close" size="28px"/>
              </t-button>
            </div>
          </template>

          <t-table
            :columns="orderColumns"
            :data="orderList"
            :loading="orderLoading"
            :pagination="null"
            row-key="id"
            :empty="'暂无订单数据'"
          >
            <template #amount="{ row }">
              ¥{{ row.amount.toFixed(2) }}
            </template>
            <template #status="{ row }">
              <t-tag :theme="row.status === 'completed' ? 'success' : 'warning'">
                {{ row.status === 'completed' ? '已完成' : '处理中' }}
              </t-tag>
            </template>
          </t-table>
        </t-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import dayjs, { Dayjs } from 'dayjs';
import type { ShopInfo, EmployeePayment, OrderDetail } from '@/types/shop';
import { getShopDetail } from '@/api/shop';

const route = useRoute();
const shopId = route.params.shopId as string;

// 状态定义
const loading = ref(false);
const orderLoading = ref(false);
const showOrderList = ref(false);
const selectedEmployeeId = ref('');
const shopInfo = ref<ShopInfo>({ id: '', name: '', status: 'active' });
const employeeList = ref<EmployeePayment[]>([]);
const orderList = ref<OrderDetail[]>([]);
const dateRange = ref<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);

// 计算当前选中的员工信息
const selectedEmployee = computed(() => 
  employeeList.value.find(emp => emp.id === selectedEmployeeId.value)
);

// 表格列定义
const columns = [
  { title: '员工姓名', colKey: 'name', cell: { col: 'name' } },
  { title: '当月收款金额', colKey: 'totalAmount', cell: { col: 'amount' } },
  { title: '收款笔数', colKey: 'paymentCount' },
  { title: '操作', colKey: 'op', cell: { col: 'op' } },
];

const orderColumns = [
  { title: '订单号', colKey: 'orderNo' },
  { title: '收款金额', colKey: 'amount', cell: { col: 'amount' } },
  { title: '收款店铺', colKey: 'shopName' },
  { title: '收款员工', colKey: 'employeeName' },
  { title: '收款时间', colKey: 'createTime' },
  { title: '状态', colKey: 'status', cell: { col: 'status' } },
];

// 日期选择器禁用未来日期
const disabledDate = (date: Dayjs) => {
  return date && date > dayjs().endOf('day');
};

// 日期变化处理
const handleDateChange = async (value: [Dayjs, Dayjs] | null) => {
  if (value) {
    await fetchEmployeePaymentData();
  }
};

// 获取店铺数据
const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getShopDetail(shopId);
    if (!data) {
      throw new Error('获取店铺数据失败');
    }
    
    if (data.status === 'closed') {
      MessagePlugin.warning('该店铺已关闭，仅显示历史数据');
    }
    
    shopInfo.value = data;
    await fetchEmployeePaymentData();
  } catch (error: any) {
    console.error('获取店铺详情失败:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params
    });
    MessagePlugin.error('获取店铺数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取员工收款数据
const fetchEmployeePaymentData = async () => {
  try {
    // 模拟数据
    const mockData = [
      { id: '1', name: '张三', totalAmount: 15680.50, paymentCount: 45 },
      { id: '2', name: '李四', totalAmount: 23450.75, paymentCount: 62 },
      { id: '3', name: '王五', totalAmount: 18920.25, paymentCount: 53 },
      { id: '4', name: '赵六', totalAmount: 31280.00, paymentCount: 78 },
      { id: '5', name: '钱七', totalAmount: 12680.50, paymentCount: 38 },
      { id: '6', name: '孙八', totalAmount: 28450.75, paymentCount: 65 },
      { id: '7', name: '周九', totalAmount: 19920.25, paymentCount: 48 },
      { id: '8', name: '吴十', totalAmount: 22280.00, paymentCount: 58 }
    ];
    employeeList.value = mockData;
  } catch (error) {
    console.error('获取员工收款数据失败:', error);
    MessagePlugin.error('获取员工收款数据失败');
    employeeList.value = [];
  }
};

// 显示订单详情
const showOrderDetail = async (employee: EmployeePayment) => {
  selectedEmployeeId.value = employee.id;
  showOrderList.value = true;
  orderLoading.value = true;
  try {
    // 模拟订单数据
    const mockOrders: OrderDetail[] = [
      {
        id: '1',
        orderNo: 'DD' + Date.now() + '001',
        amount: 328.50,
        shopName: '北京朝阳店',
        employeeName: employee.name,
        createTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed' as const
      },
      {
        id: '2',
        orderNo: 'DD' + Date.now() + '002',
        amount: 156.00,
        shopName: '北京朝阳店',
        employeeName: employee.name,
        createTime: dayjs().subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed' as const
      },
      {
        id: '3',
        orderNo: 'DD' + Date.now() + '003',
        amount: 699.00,
        shopName: '北京朝阳店',
        employeeName: employee.name,
        createTime: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        status: 'processing' as const
      },
      {
        id: '4',
        orderNo: 'DD' + Date.now() + '004',
        amount: 1288.00,
        shopName: '北京朝阳店',
        employeeName: employee.name,
        createTime: dayjs().subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed' as const
      },
      {
        id: '5',
        orderNo: 'DD' + Date.now() + '005',
        amount: 459.90,
        shopName: '北京朝阳店',
        employeeName: employee.name,
        createTime: dayjs().subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        status: 'completed' as const
      },
      {
        id: '6',
        orderNo: 'DD' + Date.now() + '006',
        amount: 899.00,
        shopName: '北京朝阳店',
        employeeName: employee.name,
        createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        status: 'processing' as const
      }
    ];
    orderList.value = mockOrders;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    MessagePlugin.error('获取订单详情失败');
    orderList.value = [];
  } finally {
    orderLoading.value = false;
  }
};

// 关闭订单详情
const closeOrderDetail = () => {
  showOrderList.value = false;
  selectedEmployeeId.value = '';
  orderList.value = [];
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: calc(100vh - 48px); /* 减去上下padding */
  box-sizing: border-box;
  position: relative;
  width: 100%;
}

.shop-detail-container {
  width: calc(40% - 12px);
  display: flex;
  flex-direction: column;
}

.order-detail-container {
  position: absolute;
  right: 24px;
  top: 24px;
  width: calc(58% - 12px);
  display: flex;
  flex-direction: column;
  height: calc(100% - 48px);
}

.card-container {
  flex: 1;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-container :deep(.t-card__body) {
  flex: 1;
  overflow: auto;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.card-title .t-button {
  margin-left: 16px;
}

.employee-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.order-title {
  color: var(--td-text-color-secondary);
}

.t-button.active {
  color: var(--td-brand-color);
  background-color: var(--td-brand-color-1);
}

/* 动画效果 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>