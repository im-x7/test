<template>
  <div class="brushing-edit">
    <t-card title="刷单记录编辑">
      <t-form
        ref="form"
        :data="formData"
        :rules="rules"
        :label-width="100"
        @submit="onSubmit"
      >
        <t-form-item label="店铺" name="shopId">
          <t-select
            v-model="formData.shopId"
            :options="shopOptions"
            placeholder="请选择店铺"
            clearable
          />
        </t-form-item>

        <t-form-item label="支出员工" name="employeeId">
          <t-select
            v-model="formData.employeeId"
            :options="employeeOptions"
            placeholder="请选择支出员工"
            clearable
          />
        </t-form-item>

        <t-form-item label="支出金额" name="amount">
          <t-input-number
            v-model="formData.amount"
            :min="0"
            :max="999999"
            :step="0.01"
            placeholder="请输入支出金额"
          />
        </t-form-item>

        <t-form-item label="刷单时间" name="paymentTime">
          <t-date-picker
            v-model="formData.paymentTime"
            enable-time-picker
            placeholder="请选择刷单时间"
            clearable
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

        <t-form-item label="备注" name="remark">
          <t-textarea
            v-model="formData.remark"
            :maxlength="200"
            :autosize="{ minRows: 3, maxRows: 5 }"
            placeholder="请输入备注信息"
          />
        </t-form-item>

        <t-form-item label="截图" name="images">
          <t-upload
            v-model="formData.images"
            theme="image"
            accept="image/*"
            :multiple="true"
            :max="5"
            :size-limit="{ size: 5, unit: 'MB' }"
            :auto-upload="false"
            @change="handleImagesChange"
          >
            <t-button theme="default">
              <template #icon>
                <t-icon name="upload" />
              </template>
              点击上传
            </t-button>
          </t-upload>
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">保存</t-button>
            <t-button theme="default" @click="onCancel">取消</t-button>
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
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

interface SubmitContext {
  validateResult: boolean;
  firstError: string;
}

// 文件上传类型定义
interface UploadFile {
  _url?: string;
  raw?: File;
  name: string;
  size: number;
  type: string;
  status?: string;
}

const route = useRoute();
const router = useRouter();
const form = ref();

// 表单数据
const formData = reactive({
  id: '',
  shopId: '',
  employeeId: '',
  amount: 0,
  paymentTime: '',
  customerId: '',
  remark: '',
  images: [] as any[],
});

// 表单验证规则
const rules = {
  shopId: [{ required: true, message: '请选择店铺', type: 'error' }],
  employeeId: [{ required: true, message: '请选择支出员工', type: 'error' }],
  amount: [
    { required: true, message: '请输入支出金额', type: 'error' },
    { validator: (val: number) => val > 0, message: '金额必须大于0', type: 'error' },
  ],
  paymentTime: [{ required: true, message: '请选择刷单时间', type: 'error' }],
  customerId: [{ required: true, message: '请选择关联客户', type: 'error' }],
  images: [{ required: true, message: '请上传截图', type: 'error' }],
};

// 店铺选项
const shopOptions = [
  { value: '1', label: '总店' },
  { value: '2', label: '分店1' },
  { value: '3', label: '分店2' },
];

// 员工选项
const employeeOptions = [
  { value: '1', label: '张三' },
  { value: '2', label: '李四' },
  { value: '3', label: '王五' },
];

// 客户数据类型
interface Customer {
  value: string;
  label: string;
  phone: string;
}

// 客户选择相关
const customerModalVisible = ref(false);
const customerSearchKeyword = ref('');
const selectedCustomer = ref<Customer | null>(null);

// 客户列表（实际项目中应该从API获取）
const customerList = ref<Customer[]>([
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
  total: 0,
  showTotal: true
});

// 更新总数的方法
const updateTotal = () => {
  pagination.total = filteredCustomers.value.length;
};

// 筛选客户
const filteredCustomers = computed(() => {
  if (!customerSearchKeyword.value) return customerList.value;
  
  const keyword = customerSearchKeyword.value.toLowerCase();
  const filtered = customerList.value.filter(customer => 
    customer.label.toLowerCase().includes(keyword) || 
    customer.phone.includes(keyword)
  );
  
  // 当筛选结果变化时更新总数
  updateTotal();
  return filtered;
});

// 分页变化处理
const onPageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
};

// 打开客户选择弹窗
const openCustomerModal = () => {
  customerModalVisible.value = true;
  updateTotal();
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

// 初始化已选客户
const initSelectedCustomer = () => {
  if (formData.customerId) {
    const customer = customerList.value.find(c => c.value === formData.customerId);
    if (customer) {
      selectedCustomer.value = customer;
    }
  }
};

// 处理图片变化
const handleImagesChange = (files: UploadFile | UploadFile[]) => {
  try {
    if (!Array.isArray(files)) {
      files = [files];
    }
    
    // 处理新增的文件
    files.forEach((file: UploadFile) => {
      if (!file._url && file.raw) {
        file._url = URL.createObjectURL(file.raw);
      }
    });
    
    formData.images = files;
  } catch (error) {
    console.error('处理图片失败:', error);
    MessagePlugin.error('处理图片失败，请重试');
  }
};

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理所有创建的对象URL
  formData.images.forEach(image => {
    if (image._url?.startsWith('blob:')) {
      URL.revokeObjectURL(image._url);
    }
  });
});

// 获取详情数据
const fetchDetail = async (id: string) => {
  try {
    // 这里替换为实际的API调用
    const response = {
      id: id,
      shopId: '1',
      employeeId: '1',
      amount: 100,
      paymentTime: '2024-03-20 10:00:00',
      customerId: '1',
      remark: '测试备注',
      images: ['https://tdesign.gtimg.com/site/source/figma-pc.png'],
    };

    Object.assign(formData, response);
  } catch (error) {
    console.error('获取详情失败:', error);
    MessagePlugin.error('获取详情失败');
  }
};

// 表单提交
const onSubmit = async ({ validateResult, firstError }: SubmitContext) => {
  if (validateResult === true) {
    try {
      // 这里替换为实际的API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      MessagePlugin.success('保存成功');
      router.back();
    } catch (error) {
      console.error('保存失败:', error);
      MessagePlugin.error('保存失败');
    }
  } else {
    MessagePlugin.warning(firstError);
  }
};

// 取消编辑
const onCancel = () => {
  router.back();
};

onMounted(() => {
  const id = route.params.id;
  if (id) {
    fetchDetail(id as string);
  }
  initSelectedCustomer();
  // 初始化时更新总数
  updateTotal();
});
</script>

<style lang="less" scoped>
.brushing-edit {
  padding: 24px;
  width: 50%;
  margin: 0 auto;
  :deep(.t-upload__tips) {
    margin-top: 12px;
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
</style> 