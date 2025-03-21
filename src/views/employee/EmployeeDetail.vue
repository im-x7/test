<template>
  <div class="employee-detail-container">
    <t-breadcrumb>
      <t-breadcrumb-item @click="goBack">
        <t-icon name="chevron-left" />
        返回
      </t-breadcrumb-item>
      <t-breadcrumb-item>{{ employeeInfo.name }}</t-breadcrumb-item>
      <t-breadcrumb-item>收款详情</t-breadcrumb-item>
    </t-breadcrumb>
    
    <t-card :bordered="false" class="card-container">
      <template #title>
        <div class="card-title">
          <span>收款订单列表</span>
          <t-date-range-picker
            v-model="dateRange"
            :disabled-date="disabledDate"
            enable-time-picker
            format="YYYY-MM-DD HH:mm"
            @change="handleDateChange"
            style="width: 320px"
          />
        </div>
      </template>
      
      <t-table 
        :columns="columns"
        :data="paymentList"
        :loading="loading"
        :pagination="null"
        row-key="id"
      >
        <template #cell="{ col, record }">
          <template v-if="col.key === 'amount'">
            ¥{{ record.amount.toFixed(2) }}
          </template>
          <template v-if="col.key === 'status'">
            <t-tag :theme="record.status === '已完成' ? 'success' : 'primary'">
              {{ record.status }}
            </t-tag>
          </template>
          <template v-if="col.key === 'action'">
            <t-button theme="primary" variant="text" size="small" @click="showDetailModal(record)">查看</t-button>
          </template>
        </template>
      </t-table>
      
      <!-- 详情弹窗 -->
      <t-dialog
        v-model:visible="detailModalVisible"
        header="收款详情"
        :footer="false"
        width="500"
      >
        <t-descriptions bordered :column="1">
          <t-descriptions-item label="订单号">{{ currentRecord.orderNo }}</t-descriptions-item>
          <t-descriptions-item label="收款金额">¥{{ currentRecord.amount?.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="支付方式">{{ currentRecord.paymentMethod }}</t-descriptions-item>
          <t-descriptions-item label="收款店铺">{{ currentRecord.shopName }}</t-descriptions-item>
          <t-descriptions-item label="收款员工">{{ currentRecord.employeeName }}</t-descriptions-item>
          <t-descriptions-item label="收款时间">{{ currentRecord.paymentTime }}</t-descriptions-item>
          <t-descriptions-item label="客户">{{ currentRecord.customer }}</t-descriptions-item>
          <t-descriptions-item label="收款截图">
            <img 
              v-if="currentRecord.screenshot" 
              :src="currentRecord.screenshot" 
              alt="收款截图" 
              style="max-width: 100%; max-height: 200px; cursor: pointer;" 
              @click="() => { previewSrc = currentRecord.screenshot || ''; previewVisible = true; }"
            />
            <span v-else>无截图</span>
          </t-descriptions-item>
        </t-descriptions>
        <div style="margin-top: 24px; text-align: right;">
          <t-button theme="default" @click="detailModalVisible = false">关闭</t-button>
        </div>
      </t-dialog>

      <!-- 图片预览 -->
      <t-image
        :src="previewSrc"
        :visible="previewVisible"
        @close="previewVisible = false"
      />
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import dayjs, { Dayjs } from 'dayjs';
import { getEmployeeNameById } from '../../constants/employees';

// 定义接口
interface EmployeeInfo {
  id: string;
  name: string;
}

interface PaymentInfo {
  id: string;
  orderNo: string;
  amount: number;
  paymentMethod: string;
  paymentTime: string;
  customer: string;
  status: string;
  shopName?: string;
  employeeName?: string;
  screenshot?: string;
}

const router = useRouter();
const route = useRoute();
const employeeId = route.params.employeeId as string;
const loading = ref(false);
const employeeInfo = ref<EmployeeInfo>({ id: '', name: '' });
const paymentList = ref<PaymentInfo[]>([]);
const dateRange = ref<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);

// 表格列定义
const columns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '支付方式', dataIndex: 'paymentMethod', key: 'paymentMethod' },
  { title: '收款时间', dataIndex: 'paymentTime', key: 'paymentTime' },
  { title: '客户', dataIndex: 'customer', key: 'customer' },

  { title: '操作', key: 'action' }
];

// 日期选择器禁用未来日期
const disabledDate = (current: Dayjs) => {
  return current && current > dayjs().endOf('day');
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 日期变化处理
const handleDateChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates) {
    fetchData();
  }
};

// 详情弹窗相关状态
const detailModalVisible = ref(false);
const currentRecord = ref<PaymentInfo>({} as PaymentInfo);

// 图片预览相关状态
const previewVisible = ref(false);
const previewSrc = ref('');

// 显示详情弹窗
const showDetailModal = (record: PaymentInfo) => {
  currentRecord.value = record;
  detailModalVisible.value = true;
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    setTimeout(() => {
      employeeInfo.value = { 
        id: employeeId, 
        name: getEmployeeNameById(employeeId)
      };
      
      // 模拟收款订单数据
      paymentList.value = [
        { 
          id: '1', 
          orderNo: 'ORD20231101', 
          amount: 1000, 
          paymentMethod: '微信支付', 
          paymentTime: '2023-11-01 10:00:00',
          customer: '客户A',
          status: '已完成',
          shopName: '总店',
          employeeName: '张三',
          screenshot: 'https://picsum.photos/id/101/300/200'
        },
        { 
          id: '2', 
          orderNo: 'ORD20231102', 
          amount: 2000, 
          paymentMethod: '支付宝', 
          paymentTime: '2023-11-02 11:00:00',
          customer: '客户B',
          status: '已完成',
          shopName: '分店1',
          employeeName: '李四',
          screenshot: ''
        },
        { 
          id: '3', 
          orderNo: 'ORD20231103', 
          amount: 3000, 
          paymentMethod: '银行卡', 
          paymentTime: '2023-11-03 12:00:00',
          customer: '客户C',
          status: '处理中',
          shopName: '分店2',
          employeeName: '王五',
          screenshot: 'https://picsum.photos/id/103/300/200'
        },
      ];
      
      loading.value = false;
    }, 1000);
  } catch (error) {
    MessagePlugin.error('获取数据失败');
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.employee-detail-container {
  padding: 24px;
}
.card-container {
  width: 100%;
  margin-top: 24px;
}
.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>