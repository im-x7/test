<template>
  <div class="finance-list">
    <div class="header-section">
      <h2 class="page-title">账款盘点</h2>
      <div class="operation-bar">
        <t-space>
          <t-button theme="primary" @click="showAddModal">新增盘点</t-button>
          <t-button theme="primary" variant="outline" @click="() => { router.push('/admin/finance/employee-performance') }">员工业绩</t-button>
        </t-space>
      </div>
    </div>
    
    <div class="statistics-cards">
      <t-row :gutter="16">
        <t-col :span="4">
          <t-card title="总收款金额" hover-shadow class="stat-card">
            <p class="card-value">¥{{ statistics.totalAmount.toFixed(2) }}</p>
            <p class="card-trend">较上月 <span :class="statistics.amountGrowth >= 0 ? 'increase' : 'decrease'">
              {{ statistics.amountGrowth >= 0 ? '+' : '' }}{{ statistics.amountGrowth }}%
            </span></p>
          </t-card>
        </t-col>
        <t-col :span="4">
          <t-card title="总订单数" hover-shadow class="stat-card">
            <p class="card-value">{{ statistics.totalOrders }}</p>
            <p class="card-trend">较上月 <span :class="statistics.orderGrowth >= 0 ? 'increase' : 'decrease'">
              {{ statistics.orderGrowth >= 0 ? '+' : '' }}{{ statistics.orderGrowth }}%
            </span></p>
          </t-card>
        </t-col>
        <t-col :span="4">
          <t-card title="平均客单价" hover-shadow class="stat-card">
            <p class="card-value">¥{{ statistics.averageAmount.toFixed(2) }}</p>
            <p class="card-trend">较上月 <span :class="statistics.averageGrowth >= 0 ? 'increase' : 'decrease'">
              {{ statistics.averageGrowth >= 0 ? '+' : '' }}{{ statistics.averageGrowth }}%
            </span></p>
          </t-card>
        </t-col>
      </t-row>
    </div>
    
    <t-card class="content-card">
      <t-tabs v-model="activeTab" class="finance-tabs">
        <t-tab-panel value="daily" label="每日统计">
          <div class="panel-container">
            <div class="panel-header">
              <div class="date-filter">
                <t-space>
                  <div class="date-buttons">
                    <t-button variant="outline" size="small" @click="setDateRange('today')" :class="{ 'active-date-btn': isActiveRange('today') }">今日</t-button>
                    <t-button variant="outline" size="small" @click="setDateRange('week')" :class="{ 'active-date-btn': isActiveRange('week') }">本周</t-button>
                    <t-button variant="outline" size="small" @click="setDateRange('month')" :class="{ 'active-date-btn': isActiveRange('month') }">本月</t-button>
                    <t-button variant="outline" size="small" @click="setDateRange('quarter')" :class="{ 'active-date-btn': isActiveRange('quarter') }">本季度</t-button>
                  </div>
                  <t-date-range-picker
                    v-model="dateRange"
                    format="YYYY-MM-DD"
                    @change="handleDateChange"
                    :clearable="false"
                    size="small"
                    :default-value="[dayjs().startOf('month').toDate(), dayjs().endOf('day').toDate()]"
                    class="custom-date-picker"
                  />
                </t-space>
              </div>
            </div>
            <t-table
              :columns="dailyColumns"
              :data="dailyList"
              :loading="loading"
              row-key="key"
              stripe
              hover
              class="data-table"
              :pagination="{ 
                pageSize: 10, 
                total: dailyList.length, 
                current: 1, 
                showPageSize: true, 
                showJumper: true,
                pageSizeOptions: [10, 20, 50],
                onChange(current: number, pageSize: number) {
                  // 使用current和pageSize参数更新分页
                  // 如果组件已经卸载，不执行后续操作
                  if (!isComponentMounted.valueOf()) return;
                  
                  console.log(`切换到第${current}页，每页${pageSize}条`);
                  fetchData();
                }
              }"
            >
              <template #cell="{ col, row }">
                <template v-if="['totalAmount', 'supplyCost'].includes(col.colKey)">
                  <span class="amount-value">¥{{ row[col.colKey].toFixed(2) }}</span>
                </template>
                <template v-else-if="col.colKey === 'profit'">
                  <span :class="row.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                    ¥{{ row.profit.toFixed(2) }}
                  </span>
                </template>
              </template>
            </t-table>
          </div>
        </t-tab-panel>
        <t-tab-panel value="shop" label="店铺统计">
          <div class="panel-container">
            <t-table
              :columns="shopColumns"
              :data="shopList"
              :loading="loading"
              row-key="key"
              stripe
              hover
              class="data-table"
              :pagination="{ 
                pageSize: 10, 
                total: shopList.length, 
                current: 1, 
                showPageSize: true, 
                showJumper: true,
                pageSizeOptions: [10, 20, 50],
                onChange(current: number, pageSize: number) {
                  // 使用current和pageSize参数更新分页
                  // 如果组件已经卸载，不执行后续操作
                  if (!isComponentMounted.valueOf()) return;
                  
                  console.log(`切换到第${current}页，每页${pageSize}条`);
                  fetchData();
                }
              }"
            >
              <template #cell="{ col, row }">
                <template v-if="col.colKey === 'totalAmount'">
                  <span class="amount-value">¥{{ row.totalAmount.toFixed(2) }}</span>
                </template>
                <template v-else-if="col.colKey === 'averageAmount'">
                  <span class="amount-value">¥{{ row.averageAmount.toFixed(2) }}</span>
                </template>
                <template v-else-if="col.colKey === 'totalOrders'">
                  <t-tag theme="primary" variant="light">{{ row.totalOrders }}</t-tag>
                </template>
                <template v-else-if="col.colKey === 'proportion'">
                  <t-progress :percentage="row.proportion" :color="{ from: '#0052D9', to: '#00A870' }" />
                </template>
              </template>
            </t-table>
          </div>
        </t-tab-panel>
        <t-tab-panel value="finance" label="盘点记录">
          <div class="panel-container">
            <t-table
              :columns="columns"
              :data="financeList"
              :loading="loading"
              row-key="key"
              stripe
              hover
              class="data-table"
              :pagination="{ 
                pageSize: 10, 
                total: financeList.length, 
                current: 1,
                showPageSize: true,
                showJumper: true,
                pageSizeOptions: [10, 20, 50],
                onChange(current: number, pageSize: number) {
                  // 使用current和pageSize参数更新分页
                  // 如果组件已经卸载，不执行后续操作
                  if (!isComponentMounted.valueOf()) return;
                  
                  console.log(`切换到第${current}页，每页${pageSize}条`);
                  fetchData();
                }
              }"
            >
              <template #cell="{ col, row }">
                <template v-if="['totalAmount', 'supplyCost'].includes(col.colKey)">
                  <span class="amount-value">¥{{ row[col.colKey].toFixed(2) }}</span>
                </template>
                <template v-else-if="col.colKey === 'profit'">
                  <span :class="row.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                    ¥{{ row.profit.toFixed(2) }}
                  </span>
                </template>
              </template>
              <template #operation="{ row }">
                <t-button theme="primary" size="small" @click="handleRecount(row)">
                  重新盘点
                </t-button>
              </template>
            </t-table>
          </div>
        </t-tab-panel>
      </t-tabs>
    </t-card>

    <!-- 新增盘点弹窗 -->
    <t-dialog
      :visible="countModalVisible"
      title="新增盘点"
      width="800px"
      @confirm="handleCountModalOk"
      @close="countModalVisible = false"
      class="count-dialog"
    >
      <t-form :data="countForm" :rules="countRules" ref="countFormRef" class="count-form">
        <t-form-item label="盘点月份" name="period">
          <t-date-picker
            v-model="countForm.period"
            mode="month"
            format="YYYY-MM"
            style="width: 100%"
            :disabled-date="disabledDate"
            :popup-props="{
              attach: 'body',
              placement: 'bottom-left'
            }"
          />
        </t-form-item>
        <t-form-item label="选择店铺" name="shopIds">
          <t-select
            v-model="countForm.shopIds"
            multiple
            placeholder="请选择要盘点的店铺"
            style="width: 100%"
            :options="shopOptions"
          />
        </t-form-item>
      </t-form>

      <div v-if="previewData.length > 0" class="preview-section">
        <h3 class="preview-title">盘点预览</h3>
        <t-table 
          :columns="previewColumns" 
          :data="previewData" 
          :pagination="false"
          size="small"
          stripe
          class="preview-table"
        >
          <template #cell="{ col, row }">
            <template v-if="['totalAmount', 'supplyCost'].includes(col.colKey)">
              <span class="amount-value">¥{{ row[col.colKey].toFixed(2) }}</span>
            </template>
            <template v-else-if="col.colKey === 'profit'">
              <span :class="row.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                ¥{{ row.profit.toFixed(2) }}
              </span>
            </template>
          </template>
        </t-table>
      </div>
    </t-dialog>

    <!-- 重新盘点确认弹窗 -->
    <t-dialog
      :visible="recountModalVisible"
      title="重新盘点确认"
      @confirm="handleRecountOk"
      :confirm-loading="confirmLoading"
      @close="recountModalVisible = false"
      class="recount-dialog"
    >
      <div class="recount-content">
        <t-icon name="info-circle" class="warning-icon" />
        <div class="recount-message">
          <p>确定要重新盘点 <strong>{{ currentRecord.shopName }}</strong> {{ currentRecord.period }} 的账款数据吗？</p>
          <p class="warning-text">此操作将覆盖已有的盘点数据。</p>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';
import { getFinanceList, countFinance } from '@/api/finance';

// 接口定义
interface FinanceRecord {
  key: string;
  shopId: string;
  shopName: string;
  period: string;
  totalAmount: number;
  supplyCost: number;
  profit: number;
  createdAt: string;
  operation?: string;
}

interface Statistics {
  totalAmount: number;
  amountGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  averageAmount: number;
  averageGrowth: number;
}

interface DailyRecord {
  key: string;
  date: string;
  totalAmount: number;
  totalOrders: number;
  averageAmount: number;
}

interface ShopRecord {
  key: string;
  shopName: string;
  totalAmount: number;
  totalOrders: number;
  averageAmount: number;
  proportion: number;
}

interface CountForm {
  period: any;
  shopIds: string[];
}

interface PreviewData {
  key: string;
  shopId: string;
  shopName: string;
  totalAmount: number;
  supplyCost: number;
  profit: number;
}

// 路由初始化
const router = useRouter();

// 状态定义
const loading = ref(false);
const activeTab = ref('daily');
// 初始化为当月开始到当前日期
const dateRange = ref<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('day')]);

// 组件卸载标记
// 使用显式类型声明，确保 TypeScript 能够正确识别其类型
const isComponentMounted = ref<boolean>(true);

// 统计数据
const statistics = reactive<Statistics>({
  totalAmount: 0,
  amountGrowth: 0,
  totalOrders: 0,
  orderGrowth: 0,
  averageAmount: 0,
  averageGrowth: 0
});

// 表格数据
const dailyList = ref<DailyRecord[]>([]);
const shopList = ref<ShopRecord[]>([]);
const financeList = ref<FinanceRecord[]>([]);
const previewData = ref<PreviewData[]>([]);

// 日统计表格列定义
const dailyColumns = [
  {
    title: '日期',
    colKey: 'date',
  },
  {
    title: '收款金额',
    colKey: 'totalAmount',
  },
  {
    title: '订单数',
    colKey: 'totalOrders',
  },
  {
    title: '平均客单价',
    colKey: 'averageAmount',
  },
];

// 店铺统计表格列定义
const shopColumns = [
  {
    title: '店铺名称',
    colKey: 'shopName',
  },
  {
    title: '收款金额',
    colKey: 'totalAmount',
  },
  {
    title: '订单数',
    colKey: 'totalOrders',
  },
  {
    title: '平均客单价',
    colKey: 'averageAmount',
  },
  {
    title: '占比',
    colKey: 'proportion',
  },
];

// 财务盘点表格列定义
const columns = [
  {
    title: '店铺名称',
    colKey: 'shopName',
  },
  {
    title: '盘点周期',
    colKey: 'period',
  },
  {
    title: '收款金额',
    colKey: 'totalAmount',
  },
  {
    title: '供货成本',
    colKey: 'supplyCost',
  },
  {
    title: '利润',
    colKey: 'profit',
  },
  {
    title: '盘点时间',
    colKey: 'createdAt',
  },
  {
    title: '操作',
    colKey: 'operation',
    width: 150,
    align: 'center'
  },
];

// 预览表格列定义
const previewColumns = [
  {
    title: '店铺名称',
    colKey: 'shopName',
  },
  {
    title: '收款金额',
    colKey: 'totalAmount',
  },
  {
    title: '供货成本',
    colKey: 'supplyCost',
  },
  {
    title: '利润',
    colKey: 'profit',
  },
];

// 新增盘点相关的状态定义
const countModalVisible = ref(false);
const countFormRef = ref(null);
const countForm = reactive<CountForm>({
  period: null,
  shopIds: [],
});

const countRules = {
  period: [{ required: true, message: '请选择盘点月份', trigger: 'blur' }],
  shopIds: [{ required: true, message: '请选择要盘点的店铺', trigger: 'blur' }]
};

// 店铺选项
const shopOptions = ref([
  { value: '1', label: '总店' },
  { value: '2', label: '分店1' },
  { value: '3', label: '分店2' },
]);

// 重新盘点相关的状态定义
const recountModalVisible = ref(false);
const currentRecord = ref<FinanceRecord>({} as FinanceRecord);
const confirmLoading = ref(false);

// 禁用未来日期
const disabledDate = (current: Dayjs) => {
  return current.isAfter(dayjs(), 'day');
};

// 显示新增盘点弹窗
const showAddModal = () => {
  countForm.period = null;
  countForm.shopIds = [];
  previewData.value = [];
  countModalVisible.value = true;
};

// 处理盘点确认
const handleCountModalOk = async () => {
  // 如果组件已经卸载，不执行后续操作
  if (!isComponentMounted.valueOf()) return;
  
  // 表单验证
  try {
    if (!countFormRef.value) {
      MessagePlugin.error('表单实例不存在');
      return;
    }
    await (countFormRef.value as any).validate();
    confirmLoading.value = true;
    
    // 调用API进行盘点
    countFinance({
      period: dayjs(countForm.period).format('YYYY-MM'),
      shopIds: countForm.shopIds
    }).then(() => {
      // 如果组件已经卸载，不执行后续操作
      if (!isComponentMounted.valueOf()) return;
      
      confirmLoading.value = false;
      countModalVisible.value = false;
      MessagePlugin.success('盘点成功');
      fetchData();
    }).catch((error) => {
      // 如果组件已经卸载，不执行后续操作
      if (!isComponentMounted.valueOf()) return;
      
      console.error('Error during count finance:', error);
      confirmLoading.value = false;
      MessagePlugin.error('盘点失败，请重试');
    });
  } catch (e) {
    // 表单验证失败
    console.log('表单验证失败', e);
  }
};

// 处理重新盘点
const handleRecount = (record: FinanceRecord) => {
  console.log('点击重新盘点按钮', record);
  currentRecord.value = record;
  recountModalVisible.value = true;
};

// 重新盘点确认处理
const handleRecountOk = () => {
  // 如果组件已经卸载，不执行后续操作
  if (!isComponentMounted.valueOf()) return;
  
  confirmLoading.value = true;
  
  // 确保shopId存在
  const shopId = currentRecord.value.shopId || '';
  
  // 调用API进行重新盘点
  countFinance({
    period: currentRecord.value.period,
    shopIds: [shopId]
  }).then(() => {
    // 如果组件已经卸载，不执行后续操作
    if (!isComponentMounted.valueOf()) return;
    
    confirmLoading.value = false;
    recountModalVisible.value = false;
    MessagePlugin.success('重新盘点成功');
    fetchData();
  }).catch((error) => {
    // 如果组件已经卸载，不执行后续操作
    if (!isComponentMounted.valueOf()) return;
    
    console.error('Error during recount finance:', error);
    confirmLoading.value = false;
    MessagePlugin.error('盘点失败，请重试');
  });
};

// 处理日期变化
const handleDateChange = (value: any) => {
  // 如果组件已经卸载，不执行后续操作
  if (!isComponentMounted.valueOf()) return;
  
  try {
    // 确保 value 是数组并且有效
    if (value && Array.isArray(value) && value.length === 2) {
      // 确保值是 Dayjs 类型
      const start = dayjs(value[0]);
      const end = dayjs(value[1]);
      if (start.isValid() && end.isValid()) {
        // 使用类型断言来确保类型正确
        dateRange.value = [start, end] as [Dayjs, Dayjs];
        fetchData();
        return;
      }
    }
    
    // 如果值无效，设置为当月开始到今天
    dateRange.value = [dayjs().startOf('month'), dayjs().endOf('day')];
    fetchData();
  } catch (error) {
    console.error('Error handling date change:', error);
    // 出错时设置为默认值
    dateRange.value = [dayjs().startOf('month'), dayjs().endOf('day')];
    fetchData();
  }
};

// 设置日期范围的快捷方式
const setDateRange = (type: 'today' | 'week' | 'month' | 'quarter') => {
  switch (type) {
    case 'today':
      dateRange.value = [dayjs().startOf('day'), dayjs().endOf('day')];
      break;
    case 'week':
      dateRange.value = [dayjs().startOf('week'), dayjs().endOf('day')];
      break;
    case 'month':
      dateRange.value = [dayjs().startOf('month'), dayjs().endOf('day')];
      break;
    case 'quarter':
      // 计算当前季度的开始日期
      const currentMonth = dayjs().month();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      dateRange.value = [dayjs().month(quarterStartMonth).startOf('month'), dayjs().endOf('day')];
      break;
  }
  fetchData();
};

// 检查当前是否为活动日期范围
const isActiveRange = (type: 'today' | 'week' | 'month' | 'quarter'): boolean => {
  const now = dayjs();
  const start = dateRange.value[0];
  const end = dateRange.value[1];
  
  if (!start || !end) return false;
  
  switch (type) {
    case 'today':
      return start.format('YYYY-MM-DD') === now.format('YYYY-MM-DD') && 
             end.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
    case 'week':
      return start.format('YYYY-MM-DD') === now.startOf('week').format('YYYY-MM-DD') && 
             end.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
    case 'month':
      return start.format('YYYY-MM-DD') === now.startOf('month').format('YYYY-MM-DD') && 
             end.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
    case 'quarter':
      const quarterStartMonth = Math.floor(now.month() / 3) * 3;
      return start.format('YYYY-MM-DD') === now.month(quarterStartMonth).startOf('month').format('YYYY-MM-DD') && 
             end.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
    default:
      return false;
  }
};

// 初始化数据
const fetchData = async () => {
  // 如果组件已经卸载，不执行后续操作
  if (!isComponentMounted.valueOf()) return;
  
  loading.value = true;
  // 调用API获取数据
  try {
    // 确保 dateRange 是有效的
    const startDate = dateRange.value && dateRange.value[0] 
      ? dayjs(dateRange.value[0]).format('YYYY-MM') 
      : dayjs().startOf('month').format('YYYY-MM');
      
    const response = await getFinanceList({
      period: startDate,
      shopIds: [],
      page: 1,
      pageSize: 10
    });
    
    // 如果组件已经卸载，不处理响应
    if (!isComponentMounted.valueOf()) return;
    
    loading.value = false;
    
    // 确保响应数据结构完整
    if (!response || !response.data) {
      MessagePlugin.error('返回数据格式不正确');
      return;
    }
    
    const { data } = response;
    // 确保 records 和 statistics 存在且格式正确
    const list = Array.isArray(data.records) ? data.records : [];
    const resStatistics = data.statistics || {
      totalAmount: 0,
      amountGrowth: 0,
      totalOrders: 0,
      orderGrowth: 0,
      averageAmount: 0,
      averageGrowth: 0
    };
    
    // 处理数据，确保每个项都有唯一的key并且字段有默认值
    dailyList.value = list.map((item: any, index: number) => ({
      key: item.key || `daily-${index}`,
      date: item.date || '',
      totalAmount: typeof item.totalAmount === 'number' ? item.totalAmount : 0,
      totalOrders: typeof item.totalOrders === 'number' ? item.totalOrders : 0,
      averageAmount: typeof item.averageAmount === 'number' ? item.averageAmount : 0,
    }));
    
    shopList.value = list.map((item: any, index: number) => ({
      key: item.key || `shop-${index}`,
      shopName: item.shopName || '',
      totalAmount: typeof item.totalAmount === 'number' ? item.totalAmount : 0,
      totalOrders: typeof item.totalOrders === 'number' ? item.totalOrders : 0,
      averageAmount: typeof item.averageAmount === 'number' ? item.averageAmount : 0,
      proportion: typeof item.proportion === 'number' ? item.proportion : 0,
    }));
    
    financeList.value = list.map((item: any, index: number) => ({
      key: item.key || `finance-${index}`,
      shopId: item.shopId || '',
      shopName: item.shopName || '',
      period: item.period || '',
      totalAmount: typeof item.totalAmount === 'number' ? item.totalAmount : 0,
      supplyCost: typeof item.supplyCost === 'number' ? item.supplyCost : 0,
      profit: typeof item.profit === 'number' ? item.profit : 0,
      createdAt: item.createdAt || '',
      operation: ''
    }));
    
    // 更新统计数据，确保数据类型正确
    statistics.totalAmount = typeof resStatistics.totalAmount === 'number' ? resStatistics.totalAmount : 0;
    statistics.amountGrowth = typeof resStatistics.amountGrowth === 'number' ? resStatistics.amountGrowth : 0;
    statistics.totalOrders = typeof resStatistics.totalOrders === 'number' ? resStatistics.totalOrders : 0;
    statistics.orderGrowth = typeof resStatistics.orderGrowth === 'number' ? resStatistics.orderGrowth : 0;
    statistics.averageAmount = typeof resStatistics.averageAmount === 'number' ? resStatistics.averageAmount : 0;
    statistics.averageGrowth = typeof resStatistics.averageGrowth === 'number' ? resStatistics.averageGrowth : 0;
  } catch (error) {
    // 如果组件已经卸载，不处理错误
    if (!isComponentMounted.valueOf()) return;
    
    console.error('Error fetching finance data:', error);
    loading.value = false;
    MessagePlugin.error('获取数据失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  isComponentMounted.value = true;
  
  console.log('组件已挂载，开始加载测试数据');
  
  // 添加盘点记录测试数据
  financeList.value = [
    {
      key: 'test-1',
      shopId: '1',
      shopName: '总店',
      period: '2023-06',
      totalAmount: 12500,
      supplyCost: 8000,
      profit: 4500,
      createdAt: '2023-06-30 15:30:00',
      operation: ''
    },
    {
      key: 'test-2',
      shopId: '2',
      shopName: '分店1',
      period: '2023-06',
      totalAmount: 8500,
      supplyCost: 5000,
      profit: 3500,
      createdAt: '2023-06-30 16:20:00',
      operation: ''
    }
  ];
  
  // 添加每日统计测试数据
  dailyList.value = [
    {
      key: 'daily-1',
      date: '2023-06-01',
      totalAmount: 3200,
      totalOrders: 28,
      averageAmount: 114.29
    },
    {
      key: 'daily-2',
      date: '2023-06-02',
      totalAmount: 4150,
      totalOrders: 35,
      averageAmount: 118.57
    },
    {
      key: 'daily-3',
      date: '2023-06-03',
      totalAmount: 3800,
      totalOrders: 30,
      averageAmount: 126.67
    },
    {
      key: 'daily-4',
      date: '2023-06-04',
      totalAmount: 4500,
      totalOrders: 38,
      averageAmount: 118.42
    },
    {
      key: 'daily-5',
      date: '2023-06-05',
      totalAmount: 5350,
      totalOrders: 42,
      averageAmount: 127.38
    }
  ];
  
  // 添加店铺统计测试数据
  shopList.value = [
    {
      key: 'shop-1',
      shopName: '总店',
      totalAmount: 12500,
      totalOrders: 98,
      averageAmount: 127.55,
      proportion: 60
    },
    {
      key: 'shop-2',
      shopName: '分店1',
      totalAmount: 8500,
      totalOrders: 75,
      averageAmount: 113.33,
      proportion: 40
    }
  ];
  
  // 更新统计数据
  statistics.totalAmount = 21000;
  statistics.amountGrowth = 15;
  statistics.totalOrders = 173;
  statistics.orderGrowth = 8;
  statistics.averageAmount = 121.39;
  statistics.averageGrowth = 5;
  
  console.log('测试数据已加载', {
    financeList: financeList.value,
    dailyList: dailyList.value,
    shopList: shopList.value
  });
  
  // 在生产环境中获取真实数据
  if (!import.meta.env.DEV) {
    fetchData();
  }
});

// 组件卸载时设置标记，防止在组件卸载后还在执行异步操作
onUnmounted(() => {
  isComponentMounted.value = false;
});
</script>

<style lang="less" scoped>
.finance-list {
  padding: 24px;
  background-color: var(--td-bg-color-page);
  min-height: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-component-stroke);
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.statistics-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card :deep(.t-card__title) {
  font-size: 15px;
  color: var(--td-text-color-secondary);
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--td-text-color-primary);
}

.card-trend {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.increase {
  color: #19be6b;
  font-weight: 500;
}

.decrease {
  color: #ed4014;
  font-weight: 500;
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  background-color: var(--td-bg-color-container);
}

.finance-tabs {
  margin-top: 0;
}

.panel-container {
  padding: 8px 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.panel-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
}

.date-filter {
  display: flex;
  align-items: center;
}

.date-buttons {
  display: flex;
  border-radius: var(--td-radius-default);
  overflow: hidden;
}

.date-buttons .t-button {
  margin: 0;
  border-radius: 0;
}

.date-buttons .t-button:first-child {
  border-top-left-radius: var(--td-radius-default);
  border-bottom-left-radius: var(--td-radius-default);
}

.date-buttons .t-button:last-child {
  border-top-right-radius: var(--td-radius-default);
  border-bottom-right-radius: var(--td-radius-default);
}

.date-buttons .t-button + .t-button {
  margin-left: -1px;
}

.active-date-btn {
  background-color: var(--td-brand-color-light);
  color: var(--td-brand-color);
  border-color: var(--td-brand-color-light);
}

.custom-date-picker {
  width: 240px;
}

.data-table {
  margin-top: 8px;
  
  // 操作列样式
  :deep(.t-table__cell--operation) {
    padding: 8px 16px;
    text-align: center;
    
    .t-button {
      margin: 0;
    }
  }
}

.amount-value {
  font-weight: 500;
  color: var(--td-brand-color);
}

.profit-positive {
  font-weight: 500;
  color: #19be6b;
}

.profit-negative {
  font-weight: 500;
  color: #ed4014;
}

.count-form {
  padding: 8px 0;
}

.preview-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed var(--td-component-stroke);
}

.preview-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--td-text-color-primary);
}

.preview-table {
  margin-top: 8px;
}

.recount-dialog :deep(.t-dialog__body) {
  padding: 24px;
}

.recount-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.warning-icon {
  font-size: 24px;
  color: #ed7b2f;
  flex-shrink: 0;
  margin-top: 2px;
}

.recount-message p {
  margin: 0 0 8px;
}

.warning-text {
  color: #ed7b2f;
}

:deep(.t-tabs__nav) {
  padding-left: 16px;
}

:deep(.t-table__header) {
  background-color: var(--td-bg-color-container-hover);
}

:deep(.t-table__row--striped) {
  background-color: rgba(0, 82, 217, 0.02);
}

:deep(.t-table__row:hover) {
  background-color: rgba(0, 82, 217, 0.05);
}

:deep(.t-card) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.t-pagination) {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>