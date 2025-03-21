<template>
  <div class="payment-edit">
    <h2>编辑收款</h2>
    <t-card :bordered="false">
      <t-form 
        :data="formState" 
        :rules="rules" 
        :label-width="120"
        @submit="onFinish"
      >
        <t-form-item label="收款金额" name="amount">
          <t-input-number
            v-model="formState.amount"
            :min="0"
            :decimal-places="2"
            style="width: 200px"
            placeholder="请输入收款金额"
          />
        </t-form-item>

        <!-- 收款方式表单区域 -->
        <div class="payment-methods-container">
          <h3 class="section-title">收款方式</h3>
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
                    v-model="formState[methodName].amount" 
                    :decimal-places="2" 
                    class="amount-input"
                    :placeholder="`输入${method}金额`" 
                  />
                  <t-upload
                    v-model="formState[methodName].screenshots"
                    theme="image"
                    multiple
                    :show-upload-progress="false"
                    accept="image/*"
                    class="upload-button"
                  >
                    <t-button variant="outline" size="small">上传截图</t-button>
                  </t-upload>
                </div>
              </div>
            </template>
          </div>

          <!-- 截图预览区域 -->
          <div v-if="hasAnyScreenshots" class="screenshots-preview-area">
            <h4 class="section-title">截图预览</h4>
            <div class="screenshots-container">
              <template v-for="(method, methodName) in {
                deposit: '定金',
                meituan: '美团',
                qrcode: '收款码',
                mapScan: '地图扫码',
                cash: '现金'
              }" :key="methodName">
                <div v-if="formState[methodName].screenshots.length > 0" class="method-screenshots">
                  <div class="method-screenshots-header">{{ method }}截图</div>
                  <div class="screenshots-grid">
                    <div v-for="(item, index) in formState[methodName].screenshots" 
                        :key="index" 
                        class="screenshot-item">
                      <img :src="item.url" class="preview-image" />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <t-form-item label="收款店铺" name="shopId">
          <t-select v-model="formState.shopId" style="width: 200px">
            <t-option value="1">总店</t-option>
            <t-option value="2">分店1</t-option>
            <t-option value="3">分店2</t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="收款员工" name="employeeId">
          <t-select v-model="formState.employeeId" style="width: 200px">
            <t-option v-for="(employee, index) in employees" :key="index + 1" :value="(index + 1).toString()">
              {{ employee }}
            </t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="收款时间" name="paymentTime">
          <t-date-picker
            v-model="formState.paymentTime"
            enable-time-picker
            :format="'YYYY-MM-DD HH:mm'"
            style="width: 200px"
          />
        </t-form-item>

        <t-form-item label="状态" name="status">
          <t-radio-group v-model="formState.status">
            <t-radio value="processing">进行中</t-radio>
            <t-radio value="completed">已完成</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="备注" name="remark">
          <t-textarea
            v-model="formState.remark"
            :rows="4"
            placeholder="请输入备注信息"
          />
        </t-form-item>
        
        <t-form-item :label-width="0">
          <t-button theme="primary" :loading="submitting" @click="onFinish">保存</t-button>
          <t-button style="margin-left: 8px" @click="goBack">取消</t-button>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import dayjs from 'dayjs';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

// 获取支付方式列表
usePaymentMethods();

const router = useRouter();
const route = useRoute();
const paymentId = route.params.id as string;
const submitting = ref(false);

// 员工列表
const employees = [
  '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
  '郑一', '王二', '李三', '赵四', '钱五', '孙六', '周七', '吴八',
  '郑九', '王十', '李十一', '赵十二', '钱十三', '孙十四', '周十五',
  '吴十六', '郑十七', '王十八', '李十九', '赵二十', '钱二十一', '孙二十二'
];

// 支付方式项目接口
interface PaymentMethodItem {
  amount: number;
  screenshots: Array<{url: string; name: string; status: string}>;
}

// 支付方式类型
type PaymentMethodKey = 'deposit' | 'meituan' | 'qrcode' | 'mapScan' | 'cash';

// 修改 FormState 接口
interface FormState {
  id: string;
  amount: number;
  shopId: string;
  employeeId: string;
  paymentTime: dayjs.Dayjs | null;
  status: string;
  remark: string;
  deposit: PaymentMethodItem;
  meituan: PaymentMethodItem;
  qrcode: PaymentMethodItem;
  mapScan: PaymentMethodItem;
  cash: PaymentMethodItem;
}

const formState = reactive<FormState>({
  id: '',
  amount: 0,
  shopId: '',
  employeeId: '',
  paymentTime: null,
  status: 'processing',
  remark: '',
  deposit: { amount: 0, screenshots: [] },
  meituan: { amount: 0, screenshots: [] },
  qrcode: { amount: 0, screenshots: [] },
  mapScan: { amount: 0, screenshots: [] },
  cash: { amount: 0, screenshots: [] }
});

// 添加计算属性：是否有任何截图
const hasAnyScreenshots = computed(() => {
  const methods: PaymentMethodKey[] = ['deposit', 'meituan', 'qrcode', 'mapScan', 'cash'];
  return methods.some((method) => formState[method].screenshots.length > 0);
});

// 添加计算属性：计算总金额
const totalAmount = computed(() => {
  const methods: PaymentMethodKey[] = ['deposit', 'meituan', 'qrcode', 'mapScan', 'cash'];
  return methods.reduce((sum, method) => sum + (formState[method].amount || 0), 0);
});

// 监听总金额变化，自动更新收款金额
watch(totalAmount, (newTotal) => {
  formState.amount = newTotal;
});

// 表单验证规则
const rules = {
  amount: [{ required: true, message: '请输入收款金额' }],
  shopId: [{ required: true, message: '请选择收款店铺' }],
  employeeId: [{ required: true, message: '请选择收款员工' }],
  paymentTime: [{ required: true, message: '请选择收款时间' }]
};

// 获取收款详情
const fetchPaymentDetail = async (id: string) => {
  submitting.value = true;
  try {
    // 模拟API请求
    setTimeout(() => {
      // 模拟数据
      const paymentData = {
        id,
        amount: 1000,
        shopId: '1',
        employeeId: '1',
        paymentTime: dayjs(),
        status: 'processing',
        remark: '这是一条测试收款记录',
        // 添加收款方式数据
        deposit: { amount: 500, screenshots: [] },
        meituan: { amount: 300, screenshots: [] },
        qrcode: { amount: 0, screenshots: [] },
        mapScan: { amount: 0, screenshots: [] },
        cash: { amount: 200, screenshots: [] }
      };
      
      // 填充表单
      Object.assign(formState, paymentData);
      submitting.value = false;
    }, 1000);
  } catch (error) {
    MessagePlugin.error('获取收款信息失败');
    submitting.value = false;
  }
};

// 表单提交
const onFinish = async () => {
  submitting.value = true;
  try {
    // 计算总金额
    const totalAmount = [
      formState.deposit.amount,
      formState.meituan.amount,
      formState.qrcode.amount,
      formState.mapScan.amount,
      formState.cash.amount
    ].reduce((sum, amount) => sum + (amount || 0), 0);

    // 验证总金额是否等于收款金额
    if (totalAmount !== formState.amount) {
      MessagePlugin.error('各收款方式金额之和必须等于总收款金额');
      return;
    }

    // 模拟API请求
    setTimeout(() => {
      console.log('提交的数据:', formState);
      MessagePlugin.success('收款信息更新成功');
      router.push('/payment');
    }, 1000);
  } catch (error) {
    MessagePlugin.error('更新失败');
  } finally {
    submitting.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  console.log('Edit page mounted, ID:', paymentId);
  fetchPaymentDetail(paymentId);
});
</script>

<style scoped>
.payment-edit {
  padding: 24px;
}

.payment-methods-container {
  margin: 24px 0;
  padding: 24px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--td-text-color-primary);
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.payment-method-item {
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 16px;
}

.method-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--td-text-color-primary);
}

.method-content {
  display: flex;
  gap: 8px;
  align-items: center;
}

.amount-input {
  flex: 1;
}

.upload-button {
  flex-shrink: 0;
}

.screenshots-preview-area {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--td-component-border);
}

.screenshots-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-screenshots {
  margin-bottom: 16px;
}

.method-screenshots-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--td-text-color-secondary);
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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
</style>