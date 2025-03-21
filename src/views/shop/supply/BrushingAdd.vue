<template>
  <div class="brushing-add">
    <div class="header-section">
      <h2 class="page-title">新增刷单记录</h2>
      <t-button theme="default" @click="goBack">返回</t-button>
    </div>
    
    <t-card class="content-card">
      <t-form
        ref="formRef"
        :data="formData"
        :rules="rules"
        :label-width="120"
        @submit="onSubmit"
      >
        <t-form-item label="所属店铺" name="shopId">
          <t-radio-group v-model="formData.shopId">
            <div class="shop-cards">
              <div 
                v-for="shop in shopOptions" 
                :key="shop.value" 
                class="shop-card"
                :class="{ 'shop-card-active': formData.shopId === shop.value }"
                @click="formData.shopId = shop.value"
              >
                <div class="shop-card-header">
                  <t-icon name="shop" />
                  <span class="shop-name">{{ shop.label }}</span>
                  <t-radio :value="shop.value" class="shop-radio" />
                </div>
              </div>
            </div>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="支出员工" name="employeeId">
          <t-radio-group v-model="formData.employeeId">
            <div class="employee-cards">
              <div 
                v-for="employee in filteredEmployeeOptions" 
                :key="employee.value" 
                class="employee-card"
                :class="{ 'employee-card-active': formData.employeeId === employee.value }"
                @click="formData.employeeId = employee.value"
              >
                <div class="employee-card-header">
                  <t-icon name="user" />
                  <span class="employee-name">{{ employee.label }}</span>
                  <t-radio :value="employee.value" class="employee-radio" />
                </div>
              </div>
            </div>
          </t-radio-group>
        </t-form-item>
        
        <t-form-item label="支出金额" name="amount">
          <t-input-number
            v-model="formData.amount"
            :min="0"
            :step="0.01"
            style="width: 100%"
            placeholder="请输入支出金额"
          />
        </t-form-item>
        
        <t-form-item label="刷单时间" name="paymentTime">
          <t-date-picker
            v-model="formData.paymentTime"
            style="width: 100%"
            placeholder="请选择刷单时间"
            format="YYYY-MM-DD HH:mm:ss"
            enable-time-picker
          />
        </t-form-item>
        
        <t-form-item label="关联客户" name="customerId">
          <div class="customer-select-wrapper">
            <div v-if="selectedCustomer" class="selected-customer">
              <span>{{ selectedCustomer.label }}</span>
              <t-button theme="default" variant="text" @click="clearSelectedCustomer">
                <t-icon name="close" />
              </t-button>
            </div>
            <t-button v-else theme="default" @click="openCustomerModal">
              选择客户
            </t-button>
          </div>
        </t-form-item>
        
        <t-form-item label="截图" name="images">
          <t-upload
            v-model="formData.images"
            theme="image"
            accept="image/*"
            :multiple="true"
            :before-upload="beforeUpload"
            :on-remove="handleRemoveFile"
            :request-method="handleUploadRequest"
          >
            <t-button theme="default">
              <template #icon>
                <t-icon name="upload" />
              </template>
              点击上传
            </t-button>
          </t-upload>
        </t-form-item>
        
        <t-form-item label="备注" name="remark">
          <t-textarea
            v-model="formData.remark"
            :rows="4"
            placeholder="请输入备注信息"
          />
        </t-form-item>
        
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" :loading="submitting">提交</t-button>
            <t-button theme="default" variant="base" @click="goBack">取消</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>
    
    <!-- 客户选择弹窗 -->
    <t-dialog
      header="选择客户"
      :visible="customerModalVisible"
      :width="700"
      :footer="false"
      @close="closeCustomerModal"
    >
      <div class="customer-search">
        <t-input
          v-model="customerSearchKeyword"
          placeholder="搜索客户名称或电话号码"
          clearable
          style="width: 300px"
        >
          <template #suffix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
      </div>
      
      <t-table
        :data="filteredCustomers"
        :columns="customerColumns"
        row-key="value"
        hover
        stripe
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #operation="{ row }">
          <t-button theme="primary" variant="text" @click="selectCustomer(row)">
            选择
          </t-button>
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

// 添加触摸事件处理选项，解决被动事件监听器警告
// 这段代码应该在组件初始化时执行，但不会影响组件的主要功能
const setPassiveSupported = () => {
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        // 标记浏览器支持被动选项
        window.addEventListener('test', null as any, {
          get passive() {
            return true;
          }
        });
        return true;
      }
    });
    // 测试是否支持被动事件监听器
    window.addEventListener('test', null as any, opts);
    window.removeEventListener('test', null as any, opts);
  } catch (e) {
    console.log('Passive events are not supported');
  }
};

// 表单数据类型
interface FileInfo {
  url: string;
  name: string;
  size: number;
  type: string;
  raw?: File;  // 使用可选属性，因为 TDesign 上传组件可能不会提供原始文件
}

interface FormData {
  amount: number;
  paymentTime: string;
  employeeId: string;
  customerId: string;
  images: FileInfo[];
  remark: string;
  shopId: string;
}

// 客户数据类型
interface Customer {
  value: string;
  label: string;
  phone: string;
}

const router = useRouter();
const formRef = ref();
const submitting = ref(false);

// 表单数据
const formData = reactive<FormData>({
  amount: 0,
  paymentTime: '',
  employeeId: '',
  customerId: '',
  images: [],
  remark: '',
  shopId: ''
});

// 员工选项
const employeeOptions = ref([
  { value: '1', label: '张三', shopId: '1' },
  { value: '2', label: '李四', shopId: '1' },
  { value: '3', label: '王五', shopId: '2' },
  { value: '4', label: '赵六', shopId: '2' },
  { value: '5', label: '钱七', shopId: '3' }
]);

// 店铺选项
const shopOptions = ref([
  { value: '1', label: '总店' },
  { value: '2', label: '分店1' },
  { value: '3', label: '分店2' }
]);

// 表单验证规则
const rules = {
  amount: [{ required: true, message: '请输入支出金额', type: 'error' }],
  paymentTime: [{ required: true, message: '请选择刷单时间', type: 'error' }],
  employeeId: [{ required: true, message: '请选择支出员工', type: 'error' }],
  customerId: [{ required: true, message: '请选择关联客户', type: 'error' }],
  images: [{ required: true, message: '请上传截图', type: 'error' }],
  shopId: [{ required: true, message: '请选择所属店铺', type: 'error' }]
};

// 客户选择相关
const customerModalVisible = ref(false);
const customerSearchKeyword = ref('');
const selectedCustomer = ref<Customer | null>(null);

// 客户列表
const customers = ref<Customer[]>([
  { value: '1', label: '王五', phone: '13800138000' },
  { value: '2', label: '赵六', phone: '13900139000' },
  { value: '3', label: '钱七', phone: '13700137000' },
  { value: '4', label: '孙八', phone: '13600136000' },
  { value: '5', label: '周九', phone: '13500135000' }
]);

// 客户表格列定义
const customerColumns = [
  { colKey: 'label', title: '客户姓名', width: 150 },
  { colKey: 'phone', title: '联系电话', width: 150 },
  { colKey: 'operation', title: '操作', width: 100 }
];

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: computed(() => filteredCustomers.value.length),
  showTotal: true
});

// 筛选客户
const filteredCustomers = computed(() => {
  if (!customerSearchKeyword.value) return customers.value;
  
  const keyword = customerSearchKeyword.value.toLowerCase();
  return customers.value.filter(customer => 
    customer.label.toLowerCase().includes(keyword) || 
    customer.phone.includes(keyword)
  );
});

// 分页变化处理
const onPageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
};

// 打开客户选择弹窗
const openCustomerModal = () => {
  customerModalVisible.value = true;
};

// 关闭客户选择弹窗
const closeCustomerModal = () => {
  customerModalVisible.value = false;
  customerSearchKeyword.value = '';
};

// 选择客户
const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer;
  formData.customerId = customer.value;
  closeCustomerModal();
};

// 清除已选客户
const clearSelectedCustomer = () => {
  selectedCustomer.value = null;
  formData.customerId = '';
};

// 文件上传前处理
const beforeUpload = (file: File) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    MessagePlugin.error('只能上传图片文件');
    return false;
  }
  
  // 检查文件大小（限制为 5MB）
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    MessagePlugin.error('图片大小不能超过 5MB');
    return false;
  }
  
  return true;
};

// 自定义上传请求方法
const handleUploadRequest = (files: any) => {
  return new Promise((resolve) => {
    // 模拟上传过程
    setTimeout(() => {
      // 使用模拟数据，不再尝试创建对象URL
      const fileInfoList = Array.isArray(files) ? files.map((file, index) => {
        const fileUrl = 'https://tdesign.gtimg.com/site/source/figma-pc.png'; // 使用固定的示例图片
        return {
          url: fileUrl,
          name: typeof file.name === 'string' ? file.name : `文件${index + 1}`,
          size: typeof file.size === 'number' ? file.size : 1024,
          type: typeof file.type === 'string' ? file.type : 'image/jpeg',
          status: 'success',
          response: { url: fileUrl },
          uid: `upload-${Date.now()}-${index}`
        };
      }) : [];
      
      // 确保返回格式符合 TDesign 上传组件的要求
      resolve({
        status: 'success', // 添加整体上传状态
        files: fileInfoList,
        currentFiles: fileInfoList,
        response: { 
          code: 0, 
          message: '上传成功', 
          status: 'success',
          url: fileInfoList.length === 1 ? fileInfoList[0].url : undefined, // 单文件上传时提供 url
          files: fileInfoList.map(file => ({ url: file.url, name: file.name })) // 多文件上传时提供 files 数组
        }
      });
    }, 500);
  });
};

// 移除文件处理
const handleRemoveFile = (file: FileInfo) => {
  const index = formData.images.findIndex(item => item.name === file.name);
  if (index !== -1) {
    formData.images.splice(index, 1);
  }
  return true;
};

// 表单提交
const onSubmit = ({ validateResult }: any) => {
  if (validateResult === true) {
    submitting.value = true;
    
    // 模拟API请求
    setTimeout(() => {
      submitting.value = false;
      MessagePlugin.success('提交成功');
      router.push('/shop/supply/brushing');
    }, 1000);
  }
};

// 返回列表页
const goBack = () => {
  router.push('/shop/supply/brushing');
};

// 根据选择的店铺筛选员工
const filteredEmployeeOptions = computed(() => {
  if (!formData.shopId) return [];
  return employeeOptions.value.filter(employee => employee.shopId === formData.shopId);
});

// 监听店铺变化，重置员工选择
watch(() => formData.shopId, () => {
  formData.employeeId = '';
});

// 初始化
onMounted(() => {
  setPassiveSupported();
  
  // 原有的初始化逻辑
  // 如果有客户ID，设置选中的客户
  if (formData.customerId) {
    const customer = customers.value.find(c => c.value === formData.customerId);
    if (customer) {
      selectedCustomer.value = customer;
    }
  }
});
</script>

<style lang="less" scoped>
.brushing-add {
  padding:24px;
  background-color: var(--td-bg-color-page);
  min-height: 100%;
  width: 50%;
  margin: 0 auto;
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

.content-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  background-color: var(--td-bg-color-container);
}

.shop-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.shop-card {
  width: 200px;
  border: 1px solid var(--td-component-stroke);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: var(--td-brand-color-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
  
  &-active {
    border-color: var(--td-brand-color);
    background-color: var(--td-brand-color-light);
  }
  
  &-header {
    display: flex;
    align-items: center;
    
    .t-icon {
      margin-right: 8px;
      font-size: 20px;
      color: var(--td-brand-color);
    }
    
    .shop-name {
      flex: 1;
      font-weight: 500;
    }
    
    .shop-radio {
      margin-left: auto;
      display: none; /* 隐藏单选按钮 */
    }
  }
}

.customer-select-wrapper {
  display: flex;
  align-items: center;
}

.selected-customer {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: var(--td-bg-color-container-hover);
  border-radius: 4px;
  
  span {
    margin-right: 8px;
  }
}

.customer-search {
  margin-bottom: 16px;
}

.employee-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.employee-card {
  width: 200px;
  border: 1px solid var(--td-component-stroke);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: var(--td-brand-color-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
  
  &-active {
    border-color: var(--td-brand-color);
    background-color: var(--td-brand-color-light);
  }
  
  &-header {
    display: flex;
    align-items: center;
    
    .t-icon {
      margin-right: 8px;
      font-size: 20px;
      color: var(--td-brand-color);
    }
    
    .employee-name {
      flex: 1;
      font-weight: 500;
    }
    
    .employee-radio {
      margin-left: auto;
      display: none; /* 隐藏单选按钮 */
    }
  }
}

@media (max-width: 768px) {
  .shop-card {
    width: 100%;
  }
  .employee-card {
    width: 100%;
  }
}
</style> 