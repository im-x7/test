<template>
  <div class="payment-add">
    <h2>新增收款</h2>
    <t-card :bordered="false">
      <t-form 
        :data="formState" 
        :rules="rules" 
        :label-width="120"
        @submit="handleFinish"
      >
        <t-form-item label="客户名称" name="customerId">
          <t-space>
            <t-input v-model="customerName" disabled style="width: 200px" placeholder="请选择客户" />
            <t-button variant="outline" @click="handleSelectCustomer">选择客户</t-button>
          </t-space>
        </t-form-item>

        <t-form-item label="签署协议">
          <t-space>
            <span>{{ formState.agreementStatus ? '已签署' : '未签署' }}</span>
            <t-button variant="text" @click="handleViewAgreement" :disabled="!formState.agreementId">查看</t-button>
          </t-space>
        </t-form-item>

        <t-form-item label="个人声明视频">
          <t-space>
            <span>{{ formState.videoStatus ? '已上传' : '未上传' }}</span>
            <t-button variant="text" @click="handleViewVideo" :disabled="!formState.videoUrl">查看</t-button>
          </t-space>
        </t-form-item>
        
        <t-form-item label="收款店铺" name="shopId">
          <t-select v-model="formState.shopId" placeholder="请选择收款店铺" @change="handleShopChange">
            <t-option v-for="shop in shops" :key="shop.id" :value="shop.id" :label="shop.name" />
          </t-select>
        </t-form-item>
        
        <t-form-item label="收款员工" name="employeeId">
          <t-select
            v-model="formState.employeeId"
            placeholder="请选择收款员工"
            :disabled="!formState.shopId"
            @change="handleEmployeeChange"
          >
            <t-option
              v-for="employee in storeEmployees"
              :key="employee.id"
              :value="employee.id"
              :label="employee.name"
            />
          </t-select>
        </t-form-item>
        
        <t-form-item label="净收款金额">
          <t-input-number 
            :value="totalReceivedAmount" 
            :decimal-places="2" 
            disabled 
            style="width: 100%" 
          />
        </t-form-item>

        <t-form-item label="状态">
          <t-tag theme="primary" variant="light">
            {{ formState.status === 'completed' ? '已完成' : '进行中' }}
          </t-tag>
        </t-form-item>
        
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="formState.remark" :rows="4" placeholder="请输入备注信息" />
        </t-form-item>

        <t-form-item :label-width="0">
          <t-button theme="primary" @click="showPaymentMethods = !showPaymentMethods">
            {{ showPaymentMethods ? '取消新增' : '新增收款' }}
          </t-button>
        </t-form-item>

        <!-- 收款方式表单区域 -->
        <div v-if="showPaymentMethods" class="payment-methods-container">
          <h3 class="section-title">新增收款</h3>
          <div class="payment-methods-grid">
            <template v-for="(method, methodName) in {
              deposit: '定金',
              meituan: '美团',
              qrcode: '收款码',
              mapScan: '地图扫码',
              cash: '现金'
            }" :key="methodName">
              <div class="payment-method-item">
                <div class="method-header">{{ method }}</div>
                <div class="method-content">
                  <t-input-number 
                    v-model="paymentFormState[methodName].amount" 
                    :decimal-places="2" 
                    class="amount-input"
                    :placeholder="`输入${method}金额`" 
                  />
                  <t-upload
                    v-model="paymentFormState[methodName].screenshots"
                    theme="image"
                    multiple
                    :show-upload-progress="false"
                    accept="image/*"
                    :auto-upload="false"
                    :before-upload="handleBeforeUpload"
                    :format-response="formatResponse"
                    class="upload-button"
                  >
                    <t-button variant="outline" size="small">上传截图</t-button>
                  </t-upload>
                </div>
              </div>
            </template>
          </div>
          
          <!-- 确认收款按钮 -->
          <div class="confirm-payment-container">
            <t-button theme="primary" @click="handleConfirmPayment" :loading="confirmLoading">
              确认收款
            </t-button>
          </div>
        </div>

        <!-- 已收款记录 -->
        <div v-if="paymentRecords.length > 0" class="payment-history-container">
          <h3 class="section-title">已收款记录</h3>
          <t-table
            :data="paymentRecords"
            :columns="paymentHistoryColumns"
            :pagination="{ pageSize: 5 }"
            size="small"
            bordered
            stripe
            row-key="paymentTime"
          >
            <template #amount="{ row }">
              ¥{{ row.amount.toFixed(2) }}
            </template>
            <template #paymentTime="{ row }">
              {{ row.paymentTime }}
            </template>
            <template #paymentMethods="{ row }">
              <t-space>
                <template v-for="(method, methodName) in {
                  deposit: '定金',
                  meituan: '美团',
                  qrcode: '收款码',
                  mapScan: '地图扫码',
                  cash: '现金'
                }" :key="methodName">
                  <t-tag v-if="row[methodName]?.amount > 0" :theme="getTagTheme(methodName)">
                    {{ method }}: ¥{{ row[methodName].amount }}
                  </t-tag>
                </template>
              </t-space>
            </template>
            <template #screenshots="{ row }">
              <t-space>
                <template v-for="(methodName) in {
                  deposit: '定金',
                  meituan: '美团',
                  qrcode: '收款码',
                  mapScan: '地图扫码',
                  cash: '现金'
                }" :key="methodName">
                  <template v-if="row[methodName]?.screenshots?.length > 0">
                    <div v-for="(screenshot, index) in row[methodName].screenshots" :key="index" class="history-screenshot-item">
                      <img 
                        :src="screenshot.url" 
                        alt="收款截图" 
                        class="history-screenshot-thumbnail"
                        @click="() => previewScreenshot(screenshot.url)"
                      />
                    </div>
                  </template>
                </template>
              </t-space>
            </template>
          </t-table>
        </div>

        <t-form-item :label-width="0">
          <t-button theme="primary" @click="handleFinish">完成</t-button>
          <t-button style="margin-left: 8px" @click="goBack">取消</t-button>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 客户选择弹窗 -->
    <t-dialog
      v-model:visible="customerModalVisible"
      header="选择客户"
      :footer="false"
      width="800px"
    >
      <customer-select @select="handleCustomerSelected" @cancel="customerModalVisible = false" />
    </t-dialog>

    <!-- 协议查看弹窗 -->
    <t-dialog
      v-model:visible="agreementModalVisible"
      header="查看协议"
      :footer="false"
      width="800px"
    >
      <div class="agreement-content">
        <!-- 这里放协议内容组件 -->
      </div>
    </t-dialog>

    <!-- 视频查看弹窗 -->
    <t-dialog
      v-model:visible="videoModalVisible"
      header="查看视频"
      :footer="false"
      width="800px"
    >
      <div class="video-content">
        <video v-if="formState.videoUrl" :src="formState.videoUrl" controls style="width: 100%"></video>
      </div>
    </t-dialog>

    <!-- 图片预览弹窗 -->
    <t-dialog
      v-model:visible="previewVisible"
      header="图片预览"
      :footer="false"
      width="80%"
    >
      <img :src="previewSrc" alt="图片预览" style="max-width: 100%; max-height: 80vh;" />
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import dayjs from 'dayjs';
import { Dialog as TDialog, Form as TForm, FormItem as TFormItem, Select as TSelect, Button as TButton, Space as TSpace, Card as TCard, Table as TTable } from 'tdesign-vue-next';
import { useUserStore } from '@/store/user';
import { getStoreList, getStoreEmployees } from '@/api/store';
import { createPayment } from '@/api/payment';
import CustomerSelect from '@/components/CustomerSelect.vue';

// 店铺员工接口
interface StoreEmployee {
  id: string;
  name: string;
  position: string;
  status: boolean;
}

// 定义表单状态接口
interface FormState {
  orderNo: string;
  customerId?: string;
  agreementId?: string;
  agreementStatus: boolean;
  videoUrl?: string;
  videoStatus: boolean;
  shopId?: string;
  employeeId?: string;
  employeeName?: string;
  status: 'processing' | 'completed';
  remark: string;
  amount: number;
}

// 定义店铺接口
interface Shop {
  id: string;
  name: string;
  code: string;
}

const router = useRouter();
const userStore = useUserStore();
const shops = ref<Shop[]>([]);
const storeEmployees = ref<StoreEmployee[]>([]);
const customerName = ref('');
const customerModalVisible = ref(false);
const agreementModalVisible = ref(false);
const videoModalVisible = ref(false);
const showPaymentMethods = ref(false);

// 表单数据
const formState = reactive<FormState>({
  orderNo: '',
  agreementStatus: false,
  videoStatus: false,
  status: 'processing',
  remark: '',
  amount: 0
});

// 支付方式表单数据
interface PaymentMethodItem {
  amount: number;
  screenshots: Array<{url: string; name: string; status: string}>;
}

type PaymentMethodKey = 'deposit' | 'meituan' | 'qrcode' | 'mapScan' | 'cash';

interface PaymentFormState {
  deposit: PaymentMethodItem;
  meituan: PaymentMethodItem;
  qrcode: PaymentMethodItem;
  mapScan: PaymentMethodItem;
  cash: PaymentMethodItem;
  remark: string;
  index?: string;
  paymentTime?: string;
  amount?: number;
  employeeName?: string;
}

const paymentFormState = reactive<PaymentFormState>({
  deposit: { amount: 0, screenshots: [] },
  meituan: { amount: 0, screenshots: [] },
  qrcode: { amount: 0, screenshots: [] },
  mapScan: { amount: 0, screenshots: [] },
  cash: { amount: 0, screenshots: [] },
  remark: ''
});

// 表单验证规则
const rules = {
  shopId: [
    { required: true, message: '请选择收款店铺', trigger: 'change' }
  ]
};

// 获取店铺列表
const fetchShops = async () => {
  try {
    const response = await getStoreList();
    shops.value = (response.data || []).map((item: { id: any; name: any; }) => ({
      id: item.id,
      name: item.name,
      code: item.id
    }));
  } catch (error: any) {
    console.error('店铺获取失败:', error);
    MessagePlugin.error('获取店铺数据失败，请联系管理员');
    shops.value = [];
  }
};

// 获取店铺员工列表
const fetchStoreEmployees = async (shopId: string) => {
  try {
    const response = await getStoreEmployees(shopId);
    if (response?.data) {
      storeEmployees.value = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        position: item.position,
        status: item.status
      }));
    }
  } catch (error) {
    console.error('获取店铺员工失败:', error);
    MessagePlugin.error('获取店铺员工失败');
    storeEmployees.value = [];
  }
};

// 选择客户
const handleSelectCustomer = () => {
  customerModalVisible.value = true;
};

// 客户选择回调
const handleCustomerSelected = (customer: any) => {
  formState.customerId = customer.id;
  customerName.value = customer.name;
  customerModalVisible.value = false;
};

// 查看协议
const handleViewAgreement = () => {
  if (formState.agreementId) {
    agreementModalVisible.value = true;
  }
};

// 查看视频
const handleViewVideo = () => {
  if (formState.videoUrl) {
    videoModalVisible.value = true;
  }
};

// 处理店铺变化
const handleShopChange = async (value: string) => {
  formState.shopId = value;
  formState.employeeId = '';
  formState.employeeName = '';
  if (value) {
    await fetchStoreEmployees(value);
  } else {
    storeEmployees.value = [];
  }
};

// 处理员工变化
const handleEmployeeChange = (value: string) => {
  formState.employeeId = value;
  const selectedEmployee = storeEmployees.value.find(emp => emp.id === value);
  formState.employeeName = selectedEmployee?.name || '';
};

const generateOrderNo = () => {
  const dateStr = dayjs().format('YYYYMMDD');
  const randomSeq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${dateStr}${randomSeq}`;
};

const goBack = () => {
  router.back();
};

// 收款记录列表
const paymentRecords = ref<PaymentFormState[]>([]);

// 收款记录表格列定义
const paymentHistoryColumns = [
  { colKey: 'paymentTime', title: '收款时间', width: 180 },
  { colKey: 'amount', title: '收款金额', width: 120 },
  { colKey: 'paymentMethods', title: '收款方式', minWidth: 200 },
  { colKey: 'screenshots', title: '收款截图', minWidth: 200 },
  { colKey: 'employeeName', title: '收款人', width: 120 }
];

// 计算总收款金额
const totalReceivedAmount = computed(() => {
  return paymentRecords.value.reduce((total, record) => {
    return total + calculateTotalAmount(record);
  }, 0);
});

// 计算单条收款记录的总金额
const calculateTotalAmount = (record: PaymentFormState) => {
  return [
    record.deposit.amount,
    record.meituan.amount,
    record.qrcode.amount,
    record.mapScan.amount,
    record.cash.amount
  ].reduce((sum, amount) => sum + (amount || 0), 0);
};

// 获取标签主题
const getTagTheme = (methodName: PaymentMethodKey): string => {
  const themes: Record<PaymentMethodKey, string> = {
    deposit: 'primary',
    meituan: 'success',
    qrcode: 'warning',
    mapScan: 'danger',
    cash: 'default'
  };
  return themes[methodName];
};

// 预览截图
const previewSrc = ref('');
const previewVisible = ref(false);
const confirmLoading = ref(false);

// 预览截图
const previewScreenshot = (url: string) => {
  if (!url) {
    console.error('无效的图片URL');
    MessagePlugin.warning('无法预览图片');
    return;
  }
  
  console.log('预览图片:', url);
  previewSrc.value = url;
  previewVisible.value = true;
};

// 处理上传图片前的逻辑
const handleBeforeUpload = (file: any) => {
  console.log('接收到的文件对象:', file);
  
  // 检查文件对象结构 - TDesign上传组件传递的是包装对象
  // 实际File对象在raw属性中
  const fileObj = file.raw ? file.raw : file;
  
  // 检查参数是否为有效的File或Blob对象
  if (!(fileObj instanceof File || fileObj instanceof Blob)) {
    console.error('无效的文件对象:', file);
    MessagePlugin.warning('上传文件类型错误');
    return false;
  }

  // 验证文件类型
  const isImage = /image\/.*/.test(fileObj.type);
  if (!isImage) {
    MessagePlugin.warning('只能上传图片文件');
    return false;
  }
  
  // 验证文件大小，限制在2MB以内
  const isLt2M = fileObj.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    MessagePlugin.warning('图片必须小于2MB');
    return false;
  }
  
  // 直接读取文件作为DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      // 创建一个模拟的上传结果对象
      const result = {
        response: {
          url: event.target?.result as string,
          name: file.name || (fileObj instanceof File ? fileObj.name : '截图'),
          status: 'success',
        },
        file: fileObj,
      };
      resolve(result);
    };
    reader.readAsDataURL(fileObj);
  });
};

// 格式化上传响应
const formatResponse = (response: any) => {
  console.log('格式化上传响应:', response);
  
  // 检查response是否有效
  if (!response) {
    console.error('无效的上传响应:', response);
    return {
      url: '',
      name: '截图',
      status: 'success',
    };
  }

  // 如果是通过handleBeforeUpload处理的本地文件
  if (response.response) {
    return {
      url: response.response.url,
      name: response.response.name,
      status: response.response.status,
    };
  }
  
  // 如果response包含url属性
  if (response.url) {
    return {
      url: response.url,
      name: response.name || '截图',
      status: response.status || 'success',
    };
  }
  
  // 处理真实API返回的响应
  return {
    url: response.data?.url || '',
    name: response.data?.name || response.name || '截图',
    status: response.data?.status || response.status || 'success',
  };
};

// 确认收款
const handleConfirmPayment = async () => {
  // 检查是否有至少一个收款方式有金额
  const paymentMethods: PaymentMethodKey[] = ['deposit', 'meituan', 'qrcode', 'mapScan', 'cash'];
  const hasAmount = paymentMethods.some(method => 
    paymentFormState[method].amount > 0
  );
  
  if (!hasAmount) {
    MessagePlugin.warning('请至少输入一个收款方式的金额');
    return;
  }

  // 计算总金额
  const totalAmount = paymentMethods.reduce(
    (sum, method) => sum + (paymentFormState[method].amount || 0), 
    0
  );
  
  try {
    confirmLoading.value = true;
    
    // 创建新的收款记录
    const newPaymentRecord: PaymentFormState = {
      paymentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      amount: totalAmount,
      employeeName: formState.employeeName || storeEmployees.value.find(emp => emp.id === formState.employeeId)?.name || '',
      deposit: { ...paymentFormState.deposit },
      meituan: { ...paymentFormState.meituan },
      qrcode: { ...paymentFormState.qrcode },
      mapScan: { ...paymentFormState.mapScan },
      cash: { ...paymentFormState.cash },
      index: `payment-${Date.now()}-${paymentRecords.value.length}`,
      remark: formState.remark || ''
    };
    
    // 添加到收款记录列表
    paymentRecords.value.push(newPaymentRecord);
    
    // 更新总金额
    formState.amount = totalAmount;
    
    MessagePlugin.success('收款成功');
    showPaymentMethods.value = false;
    
    // 重置收款表单
    paymentMethods.forEach(method => {
      paymentFormState[method].amount = 0;
      paymentFormState[method].screenshots = [];
    });
  } catch (error) {
    console.error('确认收款失败:', error);
    MessagePlugin.error('确认收款失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 提交表单时的处理
const handleFinish = async () => {
  
  try {
    // 提交订单和收款记录
    const orderNo = generateOrderNo();
    const data = {
      orderNo,
      amount: formState.amount,
      shopId: formState.shopId,
      shopName: shops.value.find(shop => shop.id === formState.shopId)?.name || '',
      employeeId: formState.employeeId,
      employeeName: userStore.userInfo.name,
      customerId: formState.customerId,
      customerName: customerName.value,
      paymentMethod: paymentRecords.value.map(record => {
        const methods = [];
        if (record.deposit.amount > 0) methods.push('定金');
        if (record.meituan.amount > 0) methods.push('美团');
        if (record.qrcode.amount > 0) methods.push('收款码');
        if (record.mapScan.amount > 0) methods.push('地图扫码');
        if (record.cash.amount > 0) methods.push('现金');
        return methods.join('、');
      }).join('；'),
      paymentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: totalReceivedAmount.value === formState.amount ? 'completed' : 'processing',
      remark: formState.remark,
      payments: paymentRecords.value.map(record => ({
        deposit: record.deposit,
        meituan: record.meituan,
        qrcode: record.qrcode,
        mapScan: record.mapScan,
        cash: record.cash,
        totalAmount: calculateTotalAmount(record),
        paymentTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }))
    };
    
    await createPayment(data);
    MessagePlugin.success('创建收款成功');
    router.back();
  } catch (error) {
    console.error('创建收款失败:', error);
    MessagePlugin.error('创建收款失败');
  }
};

onMounted(() => {
  fetchShops();
});
</script>

<style scoped>
.payment-add {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.agreement-content,
.video-content {
  min-height: 200px;
  padding: 16px;
}

.payment-methods-container {
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  background-color: var(--td-bg-color-container);
}

.section-title {
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--td-component-border);
  color: var(--td-text-color-primary);
  font-weight: 500;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.payment-method-item {
  padding: 16px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-small);
  background: var(--td-bg-color-container-hover);
}

.method-header {
  margin-bottom: 12px;
  color: var(--td-text-color-primary);
  font-weight: 500;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount-input {
  flex: 1;
  min-width: 120px;
}

.upload-button {
  flex-shrink: 0;
}

.screenshots-preview-area {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed var(--td-component-border);
}

.screenshots-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.method-screenshots {
  margin-bottom: 16px;
}

.method-screenshots-header {
  margin-bottom: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.screenshot-item {
  aspect-ratio: 1;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-small);
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.action-buttons {
  margin: 24px 0;
  text-align: center;
}

.payment-records {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--td-component-border);
}

.payment-summary {
  margin-top: 16px;
  padding: 16px;
  background: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-small);
}

.total-amount {
  text-align: right;
  font-size: 16px;
  color: var(--td-text-color-primary);
}

.amount {
  font-size: 20px;
  font-weight: 500;
  color: var(--td-error-color);
  margin-left: 8px;
}

.confirm-payment-container {
  margin-top: 24px;
  text-align: center;
}

.payment-history-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--td-component-border);
}

.history-screenshot-item {
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
}

.history-screenshot-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
}
</style>