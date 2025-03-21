<template>
  <div class="materials-list">
    <h2>耗材支出</h2>
    
    <!-- 筛选条件 -->
    <t-card class="filter-card" :bordered="false">
      <t-form ref="filterFormRef" :data="filterData" layout="inline">
        <t-form-item label="耗材名称" name="name">
          <t-input
            v-model="filterData.name"
            placeholder="请输入耗材名称"
            clearable
            style="width: 180px"
          />
        </t-form-item>
        
        <t-form-item label="耗材分类" name="category">
          <t-select
            v-model="filterData.category"
            placeholder="请选择耗材分类"
            clearable
            style="width: 180px"
          >
            <t-option v-for="category in categoryOptions" :key="category.value" :value="category.value">
              {{ category.label }}
            </t-option>
          </t-select>
        </t-form-item>
        
        <t-form-item label="店铺" name="shopId">
          <t-select
            v-model="filterData.shopId"
            placeholder="请选择店铺"
            clearable
            style="width: 180px"
          >
            <t-option v-for="shop in shopOptions" :key="shop.value" :value="shop.value">
              {{ shop.label }}
            </t-option>
          </t-select>
        </t-form-item>
        
        <t-form-item label="员工" name="employeeId">
          <t-select
            v-model="filterData.employeeId"
            placeholder="请选择员工"
            clearable
            style="width: 180px"
          >
            <t-option v-for="employee in employeeOptions" :key="employee.value" :value="employee.value">
              {{ employee.label }}
            </t-option>
          </t-select>
        </t-form-item>
        
        <t-form-item label="时间范围" name="timeRange">
          <t-date-range-picker
            v-model="filterData.timeRange"
            placeholder="请选择时间范围"
            clearable
            style="width: 300px"
          />
        </t-form-item>
        
        <t-form-item>
          <t-space>
            <t-button theme="primary" @click="handleSearch">
              <template #icon>
                <t-icon name="search" />
              </template>
              查询
            </t-button>
            <t-button theme="default" @click="handleReset">
              <template #icon>
                <t-icon name="refresh" />
              </template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>
    
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <t-button theme="primary" @click="handleAdd">
        <template #icon>
          <t-icon name="add" />
        </template>
        新增耗材支出
      </t-button>
    </div>
    
    <!-- 表格区域 -->
    <t-table
      :data="materialsList"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      hover
      stripe
      @page-change="onPageChange"
    >
      <template #shopName="{ row }">
        <div class="shop-name">
          <t-icon name="shop" />
          <span>{{ row.shopName }}</span>
        </div>
      </template>
      
      <template #amount="{ row }">
        <span class="amount">¥{{ formatAmount(row.amount) }}</span>
      </template>
      
      <template #paymentTime="{ row }">
        <span>{{ formatDate(row.paymentTime) }}</span>
      </template>
      
      <template #category="{ row }">
        <t-tag theme="primary" variant="light">
          {{ categoryOptions.find(item => item.value === row.category)?.label || '-' }}
        </t-tag>
      </template>
      
      <template #operation="{ row }">
        <t-space>
          <t-button theme="primary" variant="text" @click="handleView(row)">
            查看
          </t-button>
          <t-button theme="primary" variant="text" @click="handleEdit(row)">
            编辑
          </t-button>
          <t-popconfirm
            content="确定要删除这条耗材支出记录吗？"
            confirm-btn="确定"
            cancel-btn="取消"
            @confirm="handleDelete(row)"
          >
            <t-button theme="danger" variant="text">删除</t-button>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    
    <!-- 查看详情弹窗 -->
    <t-dialog
      header="耗材支出详情"
      :visible="detailVisible"
      :width="700"
      :footer="false"
      @close="closeDetailDialog"
      class="detail-dialog"
    >
      <template v-if="currentRecord">
        <div class="detail-content">
          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <div class="section-content">
              <div class="detail-item">
                <div class="detail-label">耗材名称</div>
                <div class="detail-value">{{ currentRecord.name }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">耗材分类</div>
                <div class="detail-value">
                  {{ categoryOptions.find(item => item.value === (currentRecord as MaterialsRecord).category)?.label || '-' }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">店铺名称</div>
                <div class="detail-value">{{ currentRecord.shopName }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">支出员工</div>
                <div class="detail-value">{{ currentRecord.employeeName }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">支出金额</div>
                <div class="detail-value amount">¥{{ formatAmount(currentRecord.amount) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">支出时间</div>
                <div class="detail-value">{{ formatDate(currentRecord.paymentTime) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">备注</div>
                <div class="detail-value">{{ currentRecord.remark || '无' }}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="section-title">截图信息</div>
            <div class="section-content">
              <div class="images-container">
                <template v-if="currentRecord.images && currentRecord.images.length > 0">
                  <img 
                    v-for="(image, index) in currentRecord.images"
                    :key="index"
                    :src="image"
                    class="detail-preview-image"
                    @click="() => previewImage(image)"
                  />
                </template>
                <template v-else>
                  <div class="no-image">暂无图片</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </t-dialog>
    
    <!-- 添加图片预览弹窗 -->
    <t-dialog
      :visible="previewVisible"
      header="图片预览"
      :footer="false"
      width="80%"
      @close="closePreview"
    >
      <img :src="previewSrc" alt="图片预览" style="max-width: 100%; max-height: 80vh;" />
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义数据类型
interface MaterialsRecord {
  id: string;
  name: string;
  shopId: string;
  shopName: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentTime: string;
  images: string[];
  remark: string;
  createdAt: string;
  category: string;
}

interface FilterData {
  name: string;
  shopId: string;
  employeeId: string;
  timeRange: [string, string] | [];
  category: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

const router = useRouter();
const loading = ref(false);
const detailVisible = ref(false);
const currentRecord = ref<MaterialsRecord | null>(null);
// 图片预览相关
const previewVisible = ref(false);
const previewSrc = ref('');

// 筛选表单数据
const filterFormRef = ref();
const filterData = reactive<FilterData>({
  name: '',
  shopId: '',
  employeeId: '',
  timeRange: [] as [string, string] | [],
  category: ''
});

// 店铺选项
const shopOptions = ref([
  { value: '1', label: '总店' },
  { value: '2', label: '分店1' },
  { value: '3', label: '分店2' }
]);

// 员工选项
const employeeOptions = ref([
  { value: '1', label: '张三' },
  { value: '2', label: '李四' },
  { value: '3', label: '王五' }
]);

// 耗材分类选项
const categoryOptions = ref<CategoryOption[]>([
  { value: 'tattoo', label: '纹身耗材' },
  { value: 'accessory', label: '饰品耗材' }
]);

// 表格列定义
const columns = [
  { colKey: 'name', title: '耗材名称', width: 150 },
  { colKey: 'category', title: '耗材分类', width: 120 },
  { colKey: 'shopName', title: '店铺', width: 120 },
  { colKey: 'employeeName', title: '支出员工', width: 120 },
  { colKey: 'amount', title: '支出金额', width: 120 },
  { colKey: 'paymentTime', title: '支出时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' }
];

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true
});

// 耗材支出列表
const materialsList = ref<MaterialsRecord[]>([]);

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2);
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 分页变化处理
const onPageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchData();
};

// 查询处理
const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

// 重置筛选条件
const handleReset = () => {
  filterFormRef.value.reset();
  pagination.current = 1;
  fetchData();
};

// 新增耗材支出
const handleAdd = () => {
  router.push('/shop/supply/materials/add');
};

// 查看详情
const handleView = (row: MaterialsRecord) => {
  currentRecord.value = row;
  detailVisible.value = true;
};

// 编辑耗材支出
const handleEdit = (row: MaterialsRecord) => {
  router.push(`/shop/supply/materials/edit/${row.id}`);
};

// 删除耗材支出
const handleDelete = async (row: MaterialsRecord) => {
  try {
    loading.value = true;
    // 在实际应用中，应该调用删除API
    // await deleteApiCall(row.id);
    
    // 模拟删除操作
    setTimeout(() => {
      const index = materialsList.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        materialsList.value.splice(index, 1);
        pagination.total = materialsList.value.length;
      }
      loading.value = false;
      
      // 显示成功消息
      MessagePlugin.success('删除成功');
    }, 500);
  } catch (error) {
    console.error('删除失败:', error);
    loading.value = false;
    
    // 显示错误消息
    MessagePlugin.error('删除失败');
  }
};

// 关闭详情弹窗
const closeDetailDialog = () => {
  detailVisible.value = false;
  currentRecord.value = null;
};

// 预览图片
const previewImage = (src: string) => {
  previewSrc.value = src;
  previewVisible.value = true;
};

// 关闭预览
const closePreview = () => {
  previewVisible.value = false;
  previewSrc.value = '';
};

// 获取数据
const fetchData = () => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockData: MaterialsRecord[] = [
      {
        id: '1',
        name: '打印纸',
        shopId: '1',
        shopName: '总店',
        employeeId: '1',
        employeeName: '张三',
        amount: 50.00,
        paymentTime: '2023-05-01 10:00:00',
        images: [
          'https://tdesign.gtimg.com/site/source/figma-pc.png',
          'https://tdesign.gtimg.com/site/source/figma-pc.png'
        ],
        remark: '购买A4打印纸5包',
        createdAt: '2023-05-01 10:30:00',
        category: 'tattoo'
      },
      {
        id: '2',
        name: '墨盒',
        shopId: '2',
        shopName: '分店1',
        employeeId: '2',
        employeeName: '李四',
        amount: 120.00,
        paymentTime: '2023-05-02 14:00:00',
        images: [
          'https://tdesign.gtimg.com/site/source/figma-pc.png'
        ],
        remark: '购买打印机墨盒2个',
        createdAt: '2023-05-02 14:30:00',
        category: 'tattoo'
      },
      {
        id: '3',
        name: '清洁用品',
        shopId: '3',
        shopName: '分店2',
        employeeId: '3',
        employeeName: '王五',
        amount: 80.00,
        paymentTime: '2023-05-03 16:00:00',
        images: [
          'https://tdesign.gtimg.com/site/source/figma-pc.png',
          'https://tdesign.gtimg.com/site/source/figma-pc.png'
        ],
        remark: '购买清洁用品一批',
        createdAt: '2023-05-03 16:30:00',
        category: 'accessory'
      }
    ];
    
    // 应用筛选条件
    let filteredData = [...mockData];
    
    if (filterData.name) {
      const keyword = filterData.name.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(keyword)
      );
    }
    
    if (filterData.shopId) {
      filteredData = filteredData.filter(item => item.shopId === filterData.shopId);
    }
    
    if (filterData.employeeId) {
      filteredData = filteredData.filter(item => item.employeeId === filterData.employeeId);
    }
    
    if (filterData.timeRange && Array.isArray(filterData.timeRange) && filterData.timeRange.length === 2 && filterData.timeRange[0] && filterData.timeRange[1]) {
      const startTime = dayjs(filterData.timeRange[0]).startOf('day');
      const endTime = dayjs(filterData.timeRange[1]).endOf('day');
      
      filteredData = filteredData.filter(item => {
        const itemTime = dayjs(item.paymentTime);
        return itemTime.isAfter(startTime) && itemTime.isBefore(endTime);
      });
    }
    
    if (filterData.category) {
      filteredData = filteredData.filter(item => item.category === filterData.category);
    }
    
    materialsList.value = filteredData;
    pagination.total = filteredData.length;
    loading.value = false;
  }, 500);
};

// 初始化
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
.materials-list {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.list-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: var(--td-bg-color-container);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--td-component-stroke);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.shop-name {
  display: flex;
  align-items: center;
  
  .t-icon {
    margin-right: 4px;
    color: var(--td-brand-color);
  }
}

.amount {
  font-weight: 600;
  color: var(--td-error-color);
}

.detail-dialog {
  :deep(.t-dialog__body) {
    padding: 0;
  }
}

.detail-content {
  padding: 0;
}

.detail-section {
  & + .detail-section {
    border-top: 1px solid var(--td-component-stroke);
  }
}

.section-title {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-component-stroke);
}

.section-content {
  padding: 24px;
  background-color: var(--td-bg-color-container);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-item {
  width: calc(50% - 8px);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.detail-value {
  font-size: 14px;
  color: var(--td-text-color-primary);
  
  &.amount {
    color: var(--td-error-color);
    font-weight: 600;
  }
}

.images-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--td-component-stroke);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--td-brand-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
}

.no-image {
  width: 100%;
  padding: 32px;
  text-align: center;
  color: var(--td-text-color-secondary);
  background-color: var(--td-bg-color-page);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .detail-item {
    width: 100%;
  }
}
</style> 