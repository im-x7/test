<template>
  <div class="customer-edit">
    <div class="page-header">
      <h2>编辑客户</h2>
      <t-button theme="default" @click="goBack">返回</t-button>
    </div>
    <t-card class="edit-card">
      <t-form 
        :model="formState" 
        :rules="rules" 
        :label-width="96" 
        :wrapper-col="{ span: 16 }"
        @finish="onFinish"
      >
        <t-form-item label="客户名称" name="name">
          <t-input v-model="formState.name" placeholder="请输入客户名称" />
        </t-form-item>
        
        <t-form-item label="微信号码" name="wechat">
          <t-input v-model="formState.wechat" placeholder="请输入微信号码" />
        </t-form-item>
        
        <t-form-item label="性别" name="gender">
          <t-radio-group v-model="formState.gender">
            <t-radio :value="1">男</t-radio>
            <t-radio :value="2">女</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="手机号码" name="phone">
          <t-input v-model="formState.phone" placeholder="请输入手机号码" />
        </t-form-item>
        
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
        
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="formState.remark" :rows="3" placeholder="请输入备注信息" />
        </t-form-item>
        
        <t-form-item :wrapper-col="{ offset: 4, span: 16 }" class="form-actions">
          <t-button theme="primary" type="submit" :loading="submitting">保存</t-button>
          <t-button style="margin-left: 16px" @click="goBack">取消</t-button>
        </t-form-item>
      </t-form>
    </t-card>
    
    <!-- 关联订单选择弹窗 -->
    <t-dialog
      v-model:visible="orderModalVisible"
      :title="modalTitle"
      width="600px"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    >
      <t-input
        v-model="orderSearchKeyword"
        placeholder="搜索订单号"
        style="width: 300px; margin-bottom: 16px"
        clearable
        @enter="searchOrders"
      >
        <template #suffix-icon>
          <SearchIcon @click="searchOrders" />
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { SearchIcon } from 'tdesign-icons-vue-next';

// 定义表单状态接口
interface FormState {
  id: string;
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
const route = useRoute();
const customerId = route.params.id as string;
const submitting = ref(false);
const relatedOrders = ref<Order[]>([]);

// 订单选择相关状态
const orderModalVisible = ref(false);
const modalTitle = ref('选择关联订单');
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

// 表单数据
const formState = reactive<FormState>({
  id: '',
  name: '',
  wechat: '',
  gender: 1, // 默认为男性
  phone: '',
  remark: '',
  channels: [] // 初始化渠道来源为空数组
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

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
    // 模拟订单数据
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
        isLinked: true
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
      availableOrders.value.some((order: Order) => order.id === id && !order.isLinked)
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
    availableOrders.value = availableOrders.value.filter((order: { orderNo: { includes: (arg0: string) => any; }; }) => 
      order.orderNo.includes(orderSearchKeyword.value)
    );
    orderLoading.value = false;
  }, 500);
};

// 选择变更处理
const onSelectChange = (selectedRowKeys: string[]) => {
  selectedOrderIds.value = selectedRowKeys;
  tempSelectedOrders.value = availableOrders.value.filter(
(    order: { id: any; }) => selectedRowKeys.includes(order.id)
  );
};

// 获取复选框属性
const getCheckboxProps = (record: Order) => ({
  disabled: record.isLinked,
  name: record.orderNo,
});

// 确认选择订单
const handleModalConfirm = () => {
  relatedOrders.value = [...relatedOrders.value, ...tempSelectedOrders.value];
  orderModalVisible.value = false;
  MessagePlugin.success('订单关联成功');
};

// 取消选择订单
const handleModalCancel = () => {
  orderModalVisible.value = false;
  tempSelectedOrders.value = [];
  selectedOrderIds.value = [];
};

// 移除关联订单
const removeRelatedOrder = (record: Order) => {
  relatedOrders.value = relatedOrders.value.filter((order: { id: string; }) => order.id !== record.id);
  MessagePlugin.success('已解除关联');
};

// 获取客户详情
const fetchCustomerDetail = async (id: string): Promise<void> => {
  submitting.value = true;
  try {
    // 模拟API请求
    setTimeout(() => {
      // 模拟客户数据
      const customerData = {
        id,
        name: '测试客户',
        wechat: 'wxid_test123',
        gender: 1,
        phone: '13800138000',
        remark: '这是一个测试客户',
        channels: ['gaode', 'douyin'] // 添加测试渠道来源数据
      };
      
      // 模拟关联订单数据
      relatedOrders.value = [
        { id: '1', orderNo: 'ORD20231101', amount: 1000, paymentTime: '2023-11-01 10:00:00' },
        { id: '2', orderNo: 'ORD20231102', amount: 2000, paymentTime: '2023-11-02 11:00:00' }
      ];
      
      // 填充表单
      // 使用循环手动复制属性，避免使用Object.assign
      for (const key in customerData) {
        if (Object.prototype.hasOwnProperty.call(customerData, key) && key in formState) {
          // 使用类型断言确保TypeScript不会报错
          (formState as any)[key] = (customerData as any)[key];
        }
      }
      submitting.value = false;
    }, 1000);
  } catch (error) {
    MessagePlugin.error('获取客户信息失败');
    submitting.value = false;
  }
};

// 表单提交时包含关联订单
const onFinish = () => {
  submitting.value = true;
  
  // 获取关联订单ID列表
  const orderIds = relatedOrders.value.map((order: { id: any; }) => order.id);
  
  // 模拟API请求
  setTimeout(() => {
    console.log('提交的客户信息:', formState);
    console.log('关联的订单IDs:', orderIds);
    MessagePlugin.success('客户信息更新成功');
    submitting.value = false;
    router.push('/customer');
  }, 1000);
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  fetchCustomerDetail(customerId);
});
</script>

<style scoped>
.customer-edit {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.edit-card {
  margin-bottom: 24px;
}

.order-section {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-weight: 500;
  font-size: 15px;
  color: #333;
}

.order-table-container {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
</style>