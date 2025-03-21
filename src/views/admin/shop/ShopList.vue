<template>
  <div class="shop-list">
    <h2>店铺管理</h2>
    
    <div class="operation-bar">
      <t-button theme="primary" @click="showAddModal">新增店铺</t-button>
    </div>
    
    <t-table 
      :columns="columns" 
      :data="tableData" 
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      @page-change="handleTableChange"
      @close="modalVisible = false"
    >
      <template #status="{ row }">
        <t-tag :theme="row.status === 'open' ? 'success' : 'danger'" variant="light">
          {{ row.status === 'open' ? '营业中' : '已关闭' }}
        </t-tag>
      </template>
      <template #albumCategories="{ row }">
        <t-space wrap>
          <t-tag
            v-for="category in row.albumCategories"
            :key="category"
            :theme="getCategoryTheme(category)"
          >
            {{ getCategoryName(category) }}
          </t-tag>
        </t-space>
      </template>
      <template #channels="{ row }">
        <t-space wrap>
          <t-tag
            v-for="channel in row.channels"
            :key="channel"
            theme="primary"
            variant="light"
          >
            {{ channel }}
          </t-tag>
        </t-space>
      </template>
      <template #action="{ row }">
        <t-space>
          <t-button theme="primary" variant="text" @click="handleEdit(row)">编辑</t-button>
          <t-button 
            theme="primary" 
            variant="text" 
            @click="handleToggleStatus(row)"
            @close="modalVisible = false"
          >
            {{ row.status === 'open' ? '关闭' : '营业' }}
          </t-button>
        </t-space>
      </template>
    </t-table>
    
    <!-- 新增/编辑店铺弹窗 -->
    <t-dialog
      :visible="modalVisible"
      :title="modalTitle"
      width="600px"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
      @close="handleModalCancel"
    >
      <t-form :data="formState" :rules="rules" ref="formRef">
        <t-form-item label="店铺名称" name="name">
          <t-input v-model="formState.name" placeholder="请输入店铺名称" />
        </t-form-item>
        <t-form-item label="店铺地址" name="address">
          <t-input v-model="formState.address" placeholder="请输入店铺地址" />
        </t-form-item>
        <t-form-item label="联系电话" name="phone">
          <t-input v-model="formState.phone" placeholder="请输入联系电话" />
        </t-form-item>
        <t-form-item label="服务类型" name="serviceTypes">
          <t-checkbox-group v-model="formState.serviceTypes">
            <t-checkbox value="tattoo">纹身服务</t-checkbox>
            <t-checkbox value="accessory">饰品服务</t-checkbox>
            <t-checkbox value="electronic">电子服务</t-checkbox>
          </t-checkbox-group>
        </t-form-item>
        <t-form-item label="店铺状态" name="status">
          <t-switch v-model="isStoreOpen" />
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="formState.remark" :rows="3" placeholder="请输入备注信息" />
        </t-form-item>
        <t-form-item label="相册分类" name="albumCategories">
          <t-checkbox-group v-model="formState.albumCategories">
            <t-checkbox value="graffiti_tattoo">涂鸦背景纹身</t-checkbox>
            <t-checkbox value="black_tattoo">黑色背景纹身</t-checkbox>
            <t-checkbox value="graffiti_accessory">涂鸦背景饰品</t-checkbox>
            <t-checkbox value="black_accessory">黑色背景饰品</t-checkbox>
          </t-checkbox-group>
        </t-form-item>
        <t-form-item label="渠道" name="channels">
          <t-select
            v-model="formState.channels"
            :options="channelOptions"
            placeholder="请选择或输入渠道"
            multiple
            creatable
            filterable
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useStores, type Store } from '../../../hooks/useStores';
import { toggleStoreStatus } from '../../../api/store';
import { MessagePlugin } from 'tdesign-vue-next';

// 使用店铺钩子
const { stores, loading, fetchStores } = useStores();

// 添加模拟数据
const mockStores = [
  {
    id: 'store-1',
    name: '示例店铺1',
    address: '北京市朝阳区xxx街道',
    phone: '13800138000',
    status: 'open' as const,
    remark: '这是一个示例店铺',
    albumCategories: ['graffiti_tattoo', 'black_tattoo'],
    channels: ['美团', '抖音', '小红书'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'store-2',
    name: '示例店铺2',
    address: '上海市浦东新区xxx路',
    phone: '13900139000',
    status: 'closed' as const,
    remark: '这是另一个示例店铺',
    albumCategories: ['graffiti_accessory', 'black_accessory'],
    channels: ['饿了么', '快手'],
    createdAt: '2024-03-19T15:30:00Z',
    updatedAt: '2024-03-19T15:30:00Z'
  },
  {
    id: 'store-3',
    name: '示例店铺3',
    address: '广州市天河区xxx广场',
    phone: '13700137000',
    status: 'open' as const,
    remark: '这是第三个示例店铺',
    albumCategories: ['graffiti_tattoo', 'black_accessory'],
    channels: ['美团', '饿了么', '抖音', '快手', '小红书'],
    createdAt: '2024-03-18T09:15:00Z',
    updatedAt: '2024-03-18T09:15:00Z'
  }
] as unknown as Store[];

// 组件挂载时获取数据
onMounted(() => {
  // 使用模拟数据
  stores.value = mockStores;
  console.log('模拟数据已加载:', stores.value); // 添加调试日志
});

// 表单数据类型
interface FormState {
  id?: string;
  name: string;
  address: string;
  phone: string;
  status: 'open' | 'closed';
  remark: string;
  albumCategories: string[];
  channels: string[];
  serviceTypes: string[];
}

// 表格列定义
const columns = [
  {
    colKey: 'name',
    title: '店铺名称',
    width: 150,
  },
  {
    colKey: 'address',
    title: '店铺地址',
    width: 200,
  },
  {
    colKey: 'phone',
    title: '联系电话',
    width: 150,
  },
  {
    colKey: 'albumCategories',
    title: '相册分类',
    width: 300,
    cell: 'albumCategories',
  },
  {
    colKey: 'channels',
    title: '渠道',
    width: 200,
    cell: 'channels',
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: 'status',
  },
  {
    colKey: 'createdAt',
    title: '创建时间',
    width: 180,
  },
  {
    colKey: 'action',
    title: '操作',
    width: 160,
    fixed: 'right',
    cell: 'action',
  },
];

// 状态定义
const tableData = computed(() => {
  return stores.value.map(store => ({
    ...store,
    key: store.id
  }));
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: computed(() => stores.value.length),
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
});

// 弹窗相关状态
const modalVisible = ref(false);
const modalTitle = ref('新增店铺');
const formRef = ref();
const formState = reactive<FormState>({
  name: '',
  address: '',
  phone: '',
  status: 'open',
  remark: '',
  albumCategories: [],
  channels: [],
  serviceTypes: []
});

// 店铺状态开关的计算属性
const isStoreOpen = computed({
  get: () => formState.status === 'open',
  set: (val) => {
    formState.status = val ? 'open' : 'closed';
  }
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入店铺名称' }],
  address: [{ required: true, message: '请输入店铺地址' }],
  phone: [{ required: true, message: '请输入联系电话' }],
  albumCategories: [{ required: true, message: '请至少选择一个相册分类' }],
  serviceTypes: [{ required: true, message: '请至少选择一个服务类型' }]
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

// 显示新增店铺弹窗
const showAddModal = () => {
  modalTitle.value = '新增店铺';
  // 重置表单
  formState.id = undefined;
  formState.name = '';
  formState.address = '';
  formState.phone = '';
  formState.status = 'open';
  formState.remark = '';
  formState.albumCategories = [];
  formState.channels = [];
  formState.serviceTypes = [];
  modalVisible.value = true;
};

// 编辑店铺
const handleEdit = (record: Store) => {
  modalTitle.value = '编辑店铺';
  // 填充表单
  formState.id = record.id;
  formState.name = record.name;
  formState.address = record.address;
  formState.phone = record.phone;
  formState.status = record.status;
  formState.remark = (record as any).remark || '';
  formState.albumCategories = (record as any).albumCategories || [];
  formState.channels = (record as any).channels || [];
  formState.serviceTypes = (record as any).serviceTypes || [];
  modalVisible.value = true;
};

// 切换店铺状态
const handleToggleStatus = async (record: Store) => {
  try {
    const newStatus = record.status === 'open' ? 'closed' : 'open';
    await toggleStoreStatus(record.id, newStatus);
    MessagePlugin.success(`${record.name}已${newStatus === 'open' ? '营业' : '关闭'}`);
    // 更新本地状态
    const updatedStore = stores.value.find(store => store.id === record.id);
    if (updatedStore) {
      updatedStore.status = newStatus;
    }
    // 触发重新渲染
    stores.value = [...stores.value];
  } catch (e) {
MessagePlugin.error('操作失败');
  }
};

// 弹窗确认
const handleModalConfirm = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (valid) {
      // 如果是编辑模式
      if (formState.id) {
        // 调用更新店铺 API
        const updatedStore = stores.value.find(store => store.id === formState.id);
        if (updatedStore) {
          updatedStore.name = formState.name;
          updatedStore.address = formState.address;
          updatedStore.phone = formState.phone;
          updatedStore.status = isStoreOpen.value ? 'open' as const : 'closed' as const;
          updatedStore.remark = formState.remark;
          (updatedStore as any).albumCategories = formState.albumCategories;
          (updatedStore as any).channels = formState.channels;
          (updatedStore as any).serviceTypes = formState.serviceTypes;
        }
      } else {
        // 新增店铺
        const newStore = {
          id: `store-${Date.now()}`,
          name: formState.name,
          address: formState.address,
          phone: formState.phone,
          status: isStoreOpen.value ? 'open' as const : 'closed' as const,
          remark: formState.remark,
          albumCategories: formState.albumCategories,
          channels: formState.channels,
          serviceTypes: formState.serviceTypes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        stores.value.unshift(newStore);
      }
      
      // 关闭弹窗
      modalVisible.value = false;
      MessagePlugin.success('保存成功');
      fetchStores();
    }
  } catch (e) {
    MessagePlugin.error('表单验证失败');
  }
};

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
  formRef.value?.reset();
};

// 添加分类相关的工具函数
const getCategoryTheme = (category: string) => {
  const themes: Record<string, string> = {
    graffiti_tattoo: 'primary',
    black_tattoo: 'warning',
    graffiti_accessory: 'success',
    black_accessory: 'danger'
  }
  return themes[category] || 'default'
}

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    graffiti_tattoo: '涂鸦背景纹身',
    black_tattoo: '黑色背景纹身',
    graffiti_accessory: '涂鸦背景饰品',
    black_accessory: '黑色背景饰品'
  }
  return names[category] || category
}

// 渠道选项
const channelOptions = ref([]);
</script>

<style scoped>
.shop-list {
  padding: 0 12px;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>