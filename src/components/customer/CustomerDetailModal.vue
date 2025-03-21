<template>
  <t-dialog
    :visible="visible"
    title="客户详情"
    width="800px"
    @confirm="handleOk"
    @cancel="handleCancel"
  >
    <t-descriptions bordered>
      <t-descriptions-item label="客户ID">
        {{ customerInfo.id }}
      </t-descriptions-item>
      <t-descriptions-item label="客户名称" :span="2">
        {{ customerInfo.name }}
      </t-descriptions-item>
      <t-descriptions-item label="微信号码">
        {{ customerInfo.wechat }}
      </t-descriptions-item>
      <t-descriptions-item label="手机号码" :span="2">
        {{ customerInfo.phone }}
      </t-descriptions-item>
      <t-descriptions-item label="录入员工">
        {{ customerInfo.employeeName }}
      </t-descriptions-item>
      <t-descriptions-item label="创建时间" :span="3">
        {{ customerInfo.createTime }}
      </t-descriptions-item>
      <t-descriptions-item label="备注信息" :span="3">
        {{ customerInfo.remark || '暂无备注' }}
      </t-descriptions-item>
    </t-descriptions>

    <div class="detail-section">
      <h3>消费记录</h3>
      <t-table
        :columns="consumptionColumns"
        :data-source="consumptionRecords"
        :pagination="{ pageSize: 5 }"
        size="small"
      >
        <template #amount="{ text }">
          ¥{{ text.toFixed(2) }}
        </template>
      </t-table>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';

interface CustomerInfo {
  id: string;
  name: string;
  wechat: string;
  phone: string;
  employeeName: string;
  createTime: string;
  remark?: string;
}

interface ConsumptionRecord {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: string;
}

const props = defineProps<{
  visible: boolean;
  customerId: string;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const handleOk = () => {
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('update:visible', false);
};

const customerInfo = ref<CustomerInfo>({
  id: '',
  name: '',
  wechat: '',
  phone: '',
  employeeName: '',
  createTime: '',
});

const consumptionRecords = ref<ConsumptionRecord[]>([]);

const consumptionColumns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '服务项目',
    dataIndex: 'service',
    key: 'service',
  },
  {
    title: '消费金额',
    dataIndex: 'amount',
    key: 'amount',
    slots: { customRender: 'amount' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
];

// 监听customerId变化，获取客户详情
watch(
  () => props.customerId,
  async (newId) => {
    if (newId && props.visible) {
      await fetchCustomerDetail(newId);
    }
  }
);

// 获取客户详情
const fetchCustomerDetail = async (id: string) => {
  try {
    // 这里应该调用后端API获取客户详情
    // 目前使用模拟数据
    customerInfo.value = {
      id,
      name: '张三',
      wechat: 'zhangsan888',
      phone: '13800138000',
      employeeName: '李四',
      createTime: '2023-01-01 12:00:00',
      remark: '重要客户',
    };

    // 模拟消费记录数据
    consumptionRecords.value = [
      {
        id: '1',
        date: '2023-06-01',
        service: '纹身设计',
        amount: 1500,
        status: '已完成',
      },
      {
        id: '2',
        date: '2023-07-15',
        service: '纹身修改',
        amount: 800,
        status: '已完成',
      },
    ];
  } catch (error) {
    console.error('获取客户详情失败:', error);
  }
};
</script>

<style scoped>
.detail-section {
  margin-top: 24px;
}

.detail-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}
</style>