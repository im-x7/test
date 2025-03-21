<template>
  <div class="customer-select">
    <!-- 搜索区域 -->
    <div class="search-area">
      <t-input
        v-model="searchKeyword"
        placeholder="请输入客户姓名/手机号/微信号"
        clearable
        style="width: 300px"
      >
        <template #suffix>
          <t-icon name="search" @click="handleSearch" />
        </template>
      </t-input>
      <t-button theme="primary" @click="handleSearch" style="margin-left: 8px">搜索</t-button>
    </div>

    <!-- 客户列表 -->
    <t-table
      :data="customerList"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      row-key="id"
      style="margin-top: 16px"
    >
      <template #action="{ row }">
        <t-button variant="text" theme="primary" @click="handleSelect(row)">选择</t-button>
      </template>
    </t-table>

    <!-- 底部按钮 -->
    <div class="footer-actions" style="margin-top: 16px; text-align: right">
      <t-button @click="handleCancel">取消</t-button>
      <t-button theme="primary" style="margin-left: 8px" @click="handleAddNew">新增客户</t-button>
    </div>

    <!-- 新增客户弹窗 -->
    <t-dialog
      v-model:visible="addCustomerVisible"
      header="新增客户"
      :footer="false"
      width="600px"
    >
      <t-form
        ref="formRef"
        :data="formData"
        :rules="rules"
        :label-width="120"
        @submit="onSubmit"
      >
        <t-form-item label="客户姓名" name="name">
          <t-input v-model="formData.name" placeholder="请输入客户姓名" />
        </t-form-item>
        
        <t-form-item label="微信" name="wechat">
          <t-input v-model="formData.wechat" placeholder="请输入客户微信号" />
        </t-form-item>
        
        <t-form-item label="手机号码" name="phone">
          <t-input v-model="formData.phone" placeholder="请输入客户手机号码" />
        </t-form-item>
        
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="formData.remark" :rows="4" placeholder="请输入备注信息" />
        </t-form-item>
        
        <t-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <t-space>
            <t-button theme="primary" type="submit" :loading="submitting">提交</t-button>
            <t-button theme="default" variant="base" @click="addCustomerVisible = false">取消</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { getCustomerList, createCustomer } from '../api/customer';

// 定义组件事件
const emit = defineEmits<{
  select: [customer: any];
  cancel: [];
}>();

// 搜索关键词
const searchKeyword = ref('');
const loading = ref(false);
const customerList = ref<any[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
});

// 表格列定义
const columns = [
  { colKey: 'name', title: '客户姓名', width: 120 },
  { colKey: 'phone', title: '手机号码', width: 150 },
  { colKey: 'wechat', title: '微信号', width: 150 },
  { colKey: 'createTime', title: '创建时间', width: 180 },
  { colKey: 'action', title: '操作', width: 100, fixed: 'right' },
];

// 新增客户相关
const addCustomerVisible = ref(false);
const formRef = ref();
const submitting = ref(false);

// 表单数据
const formData = reactive({
  name: '',
  wechat: '',
  phone: '',
  remark: '',
  shopId: '',
  serviceType: 'tattoo',
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入客户姓名', type: 'error' }],
  phone: [
    { required: true, message: '请输入手机号码', type: 'error' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', type: 'error' }
  ]
};

// 获取客户列表
const fetchCustomerList = async () => {
  loading.value = true;
  try {
    const params = {
      keyword: searchKeyword.value,
      page: pagination.current,
      pageSize: pagination.pageSize
    };
    
    const response = await getCustomerList(params);
    if (response.code === 200) {
      customerList.value = response.data.list;
      pagination.total = response.data.total;
    } else {
      MessagePlugin.error('获取客户列表失败');
    }
  } catch (error) {
    console.error('获取客户列表失败:', error);
    MessagePlugin.error('获取客户列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 搜索客户
const handleSearch = () => {
  pagination.current = 1;
  fetchCustomerList();
};

// 分页变化
const onPageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchCustomerList();
};

// 选择客户
const handleSelect = (customer: any) => {
  emit('select', customer);
};

// 取消选择
const handleCancel = () => {
  emit('cancel');
};

// 新增客户
const handleAddNew = () => {
  addCustomerVisible.value = true;
};

// 提交新增客户表单
const onSubmit = async (context: { validateResult: boolean; firstError?: string }) => {
  if (!context.validateResult) {
    return;
  }
  
  submitting.value = true;
  try {
    const response = await createCustomer({
      name: formData.name,
      wechat: formData.wechat,
      phone: formData.phone,
      remark: formData.remark,
      shopId: formData.shopId,
      // 确保 serviceType 的值符合 CustomerCreateParams 接口定义
      serviceType: formData.serviceType as 'tattoo'
    });
    if (response.code === 200) {
      MessagePlugin.success('客户创建成功');
      addCustomerVisible.value = false;
      // 重置表单
      formData.name = '';
      formData.wechat = '';
      formData.phone = '';
      formData.remark = '';
      // 刷新客户列表
      fetchCustomerList();
    } else {
      MessagePlugin.error(response.msg || '客户创建失败');
    }
  } catch (error) {
    console.error('客户创建失败:', error);
    MessagePlugin.error('客户创建失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchCustomerList();
});
</script>

<style scoped>
.customer-select {
  padding: 16px;
}

.search-area {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>