<template>
  <div class="customer-add">
    <div class="page-header">
      <h2>新增客户</h2>
      <t-button theme="default" @click="goBack">返回</t-button>
    </div>
    
    <t-card class="edit-card">
      <customer-form
          ref="formRef"
          :initial-values="formState"
          @submit="handleSubmit"
          @cancel="goBack"
        />
        
        <!-- 修改关联订单部分 -->
        <t-form-item label="关联订单">
          <div class="order-section">
            <div class="order-header">
              <span class="section-title">已关联订单列表</span>
              <t-button theme="primary" size="small" @click="showOrderModal">添加关联订单</t-button>
            </div>
            <div class="order-table-container">
              <t-table 
                :columns="orderColumns" 
                :data-source="relatedOrders"
                :pagination="{ disabled: true }"
                size="small"
                row-key="id"
                bordered
              >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'amount'">
                ¥{{ record.amount.toFixed(2) }}
              </template>
              <template v-if="column.key === 'action'">
                <t-button theme="danger" variant="text" size="small" @click="removeRelatedOrder(record)">
                  解除关联
                </t-button>
              </template>
            </template>
              </t-table>
            </div>
          </div>
        </t-form-item>
        

    </t-card>
    
    <!-- 添加关联订单选择弹窗 -->
    <t-dialog
      v-model:visible="orderModalVisible"
      header="选择关联订单"
      width="800"
      @confirm="handleOrderModalOk"
      @close="handleOrderModalCancel"
    >
      <t-input
        v-model="orderSearchKeyword"
        placeholder="搜索订单号"
        style="width: 300px; margin-bottom: 16px"
        clearable
        @enter="searchOrders"
      >
        <template #suffix-icon>
          <t-icon name="search" @click="searchOrders" />
        </template>
      </t-input>
      
      <t-table
        :columns="orderSelectColumns"
        :data-source="availableOrders"
        :pagination="{ pageSize: 5 }"
        :loading="orderLoading"
        row-key="id"
        :row-selection="{ 
          selectedRowKeys: selectedOrderIds,
          onChange: onSelectChange,
          getCheckboxProps: getCheckboxProps
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            ¥{{ record.amount.toFixed(2) }}
          </template>
          <template v-if="column.key === 'status'">
            <t-tag :theme="record.isLinked ? 'default' : 'success'">
              {{ record.isLinked ? '已被关联' : '可关联' }}
            </t-tag>
          </template>
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted } from 'vue';
import CustomerForm from './CustomerForm.vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

// 表单数据类型
interface FormState {
  name: string;
  wechat: string;
  gender: number;
  phone: string;
  remark: string;
  channels: string[]; // 添加渠道来源字段
}

// 定义订单接口
interface Order {
  id: string;
  orderNo: string;
  amount: number;
  paymentTime: string;
  employeeName?: string;
  isLinked?: boolean;
}

const router = useRouter();

// 表单数据
const formState = reactive<FormState>({
  name: '',
  wechat: '',
  gender: 1, // 默认为男性
  phone: '',
  remark: '',
  channels: [] // 初始化渠道来源为空数组
});

// 关联订单相关状态
const relatedOrders = ref<Order[]>([]);
const orderModalVisible = ref(false);
const orderLoading = ref(false);
const orderSearchKeyword = ref('');
const availableOrders = ref<Order[]>([]);
const selectedOrderIds = ref<string[]>([]);
const tempSelectedOrders = ref<Order[]>([]);

// 订单表格列定义
const orderColumns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '支付时间', dataIndex: 'paymentTime', key: 'paymentTime' },
  { title: '操作', key: 'action' }
];

// 订单选择表格列定义
const orderSelectColumns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '收款时间', dataIndex: 'paymentTime', key: 'paymentTime' },
  { title: '收款员工', dataIndex: 'employeeName', key: 'employeeName' },
  { title: '状态', key: 'status' }
];

// 表单验证规则

// 显示订单选择弹窗
const showOrderModal = () => {
  orderModalVisible.value = true;
  orderSearchKeyword.value = '';
  selectedOrderIds.value = [];
  tempSelectedOrders.value = [];
  fetchAvailableOrders();
};

// 获取可关联的订单列表
const fetchAvailableOrders = () => {
  orderLoading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 模拟订单数据 - 只展示未被关联的订单
    availableOrders.value = [
      { 
        id: '1', 
        orderNo: 'ORD202311010001', 
        amount: 1000, 
        paymentTime: '2023-11-01 10:00:00',
        employeeName: '张三',
        isLinked: false
      },
      { 
        id: '2', 
        orderNo: 'ORD202311020001', 
        amount: 2000, 
        paymentTime: '2023-11-02 11:00:00',
        employeeName: '李四',
        isLinked: false
      },
      { 
        id: '3', 
        orderNo: 'ORD202311030001', 
        amount: 3000, 
        paymentTime: '2023-11-03 12:00:00',
        employeeName: '王五',
        isLinked: true  // 已被其他客户关联，置灰展示
      },
      { 
        id: '4', 
        orderNo: 'ORD202311040001', 
        amount: 4000, 
        paymentTime: '2023-11-04 13:00:00',
        employeeName: '赵六',
        isLinked: false
      }
    ];
    
    // 已关联的订单不能再次选择
    const relatedOrderIds = relatedOrders.value.map((order: { id: any; }) => order.id);
    selectedOrderIds.value = relatedOrderIds.filter((id: any) => 
      availableOrders.value.some((order: Order) => order.id === id && order.isLinked === false)
    );
    
    orderLoading.value = false;
  }, 1000);
};

// 搜索订单
const searchOrders = () => {
  if (!orderSearchKeyword.value) {
    fetchAvailableOrders();
    return;
  }
  
  orderLoading.value = true;
  // 模拟搜索API请求
  setTimeout(() => {
    availableOrders.value = availableOrders.value.filter((order: { orderNo: string | any[]; }) => 
      order.orderNo.includes(orderSearchKeyword.value)
    );
    orderLoading.value = false;
  }, 500);
};

// 选择变更处理
const onSelectChange = (selectedRowKeys: string[]) => {
  selectedOrderIds.value = selectedRowKeys;
  tempSelectedOrders.value = availableOrders.value.filter(
(    order: { id: string; }) => selectedRowKeys.includes(order.id)
  );
};

// 获取复选框属性
const getCheckboxProps = (record: Order) => ({
  disabled: record.isLinked,
  name: record.orderNo,
});

// 确认选择订单
const handleOrderModalOk = () => {
  // 将选中的订单添加到关联订单列表
  const newOrders = tempSelectedOrders.value.filter(
(    order: { id: any; }) => !relatedOrders.value.some((o: { id: any; }) => o.id === order.id)
  );
  
  relatedOrders.value = [...relatedOrders.value, ...newOrders];
  MessagePlugin.success(`成功关联 ${newOrders.length} 个订单`);
  orderModalVisible.value = false;
};

// 取消选择订单
const handleOrderModalCancel = () => {
  orderModalVisible.value = false;
};

// 移除关联订单
const removeRelatedOrder = (record: Order) => {
  relatedOrders.value = relatedOrders.value.filter((order: { id: string; }) => order.id !== record.id);
  MessagePlugin.success('已解除关联');
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 表单提交
const handleSubmit = (values: FormState) => {
  // 合并表单数据和关联订单
  const customerData = {
    ...values,
    relatedOrderIds: relatedOrders.value.map(order => order.id)
  };
  
  // 这里添加提交API的逻辑
  console.log('提交的客户数据:', customerData);
  
  // 模拟API提交成功
  MessagePlugin.success('客户添加成功');
  
  // 提交成功后返回列表页
  setTimeout(() => {
    goBack();
  }, 1000);
};

onMounted(() => {
  // 初始化页面数据
});
</script>

<style scoped>
.customer-add {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.edit-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.order-section {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #eaeaea;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-weight: 500;
  font-size: 15px;
  color: #333;
}

.order-table-container {
  background-color: #fff;
  border-radius: 4px;
  overflow: auto; /* 允许表格在小屏幕上滚动 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .customer-add {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h2 {
    margin-bottom: 12px;
  }
}

@media screen and (max-width: 480px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-title {
    margin-bottom: 8px;
  }
}
</style>