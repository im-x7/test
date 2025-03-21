<template>
  <div class="brushing-list">
    <h2>刷单记录</h2>
    
    <!-- 筛选条件 -->
    <t-card class="filter-card" :bordered="false">
      <t-form ref="filterFormRef" :data="filterData" layout="inline">
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
        新增刷单记录
      </t-button>
    </div>
    
    <!-- 表格区域 -->
    <t-table
      :data="brushingList"
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
      
      <template #customerName="{ row }">
        <span>{{ row.customerName }}</span>
      </template>
      
      <template #images="{ row }">
        <t-space>
          <template v-if="row.images && row.images.length > 0">
            <div class="image-preview">
              <img 
                v-for="(image, index) in row.images.slice(0, 2)"
                :key="index"
                :src="image"
                alt="截图"
                class="preview-image"
                @click="() => previewImage(image)"
              />
              <span v-if="row.images.length > 2" class="more-images">+{{ row.images.length - 2 }}</span>
            </div>
          </template>
          <template v-else>
            <span class="no-image">暂无图片</span>
          </template>
        </t-space>
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
            content="确定要删除这条刷单记录吗？"
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
      v-model:visible="detailVisible"
      header="刷单记录详情"
      :footer="false"
      width="700px"
      @close="closeDetailDialog"
    >
      <t-descriptions bordered :column="2" size="medium">
        <t-descriptions-item label="店铺">
          {{ currentRecord?.shopName }}
        </t-descriptions-item>
        <t-descriptions-item label="支出金额">
          ¥{{ currentRecord?.amount.toFixed(2) }}
        </t-descriptions-item>
        <t-descriptions-item label="支出员工">
          {{ currentRecord?.employeeName }}
        </t-descriptions-item>
        <t-descriptions-item label="刷单时间">
          {{ currentRecord?.paymentTime || '未设置' }}
        </t-descriptions-item>
        <t-descriptions-item label="关联客户">
          {{ currentRecord?.customerName }}
        </t-descriptions-item>
        <t-descriptions-item label="创建时间">
          {{ currentRecord?.createdAt }}
        </t-descriptions-item>
        <t-descriptions-item label="备注" :span="2">
          {{ currentRecord?.remark || '暂无备注' }}
        </t-descriptions-item>
      </t-descriptions>
      
      <div style="margin-top: 24px;">
        <h3>截图</h3>
        <div class="image-container">
          <t-image
            v-for="(image, index) in currentRecord?.images"
            :key="index"
            :src="image"
            :style="{ width: '120px', height: '120px', objectFit: 'cover', margin: '5px' }"
            @click="() => previewImage(image)"
            :error="defaultErrorImage"
            :loading="defaultLoadingImage"
            :lazy="true"
            @error="() => handleImageError(index)"
          />
        </div>
      </div>
    </t-dialog>
    
    <!-- 图片预览弹窗 -->
    <t-image-viewer
      v-model:visible="previewVisible"
      :images="previewImages"
      :default-index="previewIndex"
      @close="closePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';

// 定义数据类型
interface BrushingRecord {
  id: string;
  shopId: string;
  shopName: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentTime: string;
  customerId: string;
  customerName: string;
  images: string[];
  remark: string;
  createdAt: string;
}

interface FilterData {
  shopId: string;
  employeeId: string;
  timeRange: [string, string] | [];
}

const router = useRouter();
const loading = ref(false);
const detailVisible = ref(false);
const currentRecord = ref<BrushingRecord | null>(null);

// 图片预览相关
const previewVisible = ref(false);
const previewImages = ref<string[]>([]);
const previewIndex = ref(0);

// 图片加载失败和加载中的默认图片
const defaultErrorImage = 'https://tdesign.gtimg.com/site/placeholder.png';
const defaultLoadingImage = 'https://tdesign.gtimg.com/site/placeholder.png';

// 筛选表单数据
const filterFormRef = ref();
const filterData = reactive<FilterData>({
  shopId: '',
  employeeId: '',
  timeRange: [] as [string, string] | []
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

// 表格列定义
const columns = [
  { colKey: 'shopName', title: '店铺', width: '10%' },
  { colKey: 'employeeName', title: '支出员工', width: '10%' },
  { colKey: 'amount', title: '支出金额', width: '10%' },
  { colKey: 'paymentTime', title: '刷单时间', width: '15%' },
  { colKey: 'customerName', title: '关联客户', width: '10%' },
  { colKey: 'createdAt', title: '创建时间', width: '15%' },
  { colKey: 'remark', title: '备注', width: '15%', ellipsis: true },
  { colKey: 'operation', title: '操作', width: '15%' }
];

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true
});

// 刷单记录列表
const brushingList = ref<BrushingRecord[]>([]);

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

// 新增刷单记录
const handleAdd = () => {
  router.push('/shop/supply/brushing/add');
};

// 查看详情
const handleView = (row: BrushingRecord) => {
  currentRecord.value = row;
  detailVisible.value = true;
};

// 关闭详情弹窗
const closeDetailDialog = () => {
  detailVisible.value = false;
  currentRecord.value = null;
};

// 新增编辑处理函数
const handleEdit = (row: BrushingRecord) => {
  router.push(`/shop/supply/brushing/edit/${row.id}`);
};

// 新增删除处理函数
const handleDelete = async (row: BrushingRecord) => {
  try {
    loading.value = true;
    // 在实际应用中，应该调用删除API
    // await deleteApiCall(row.id);
    
    // 模拟删除操作
    setTimeout(() => {
      const index = brushingList.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        brushingList.value.splice(index, 1);
        pagination.total = brushingList.value.length;
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

// 获取数据
const fetchData = () => {
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockData: BrushingRecord[] = [
      {
        id: '1',
        shopId: '1',
        shopName: '总店',
        employeeId: '1',
        employeeName: '张三',
        amount: 100.00,
        paymentTime: '2023-05-01 10:00:00',
        customerId: '1',
        customerName: '王五',
        images: [
          'https://tdesign.gtimg.com/site/source/figma-pc.png',
          'https://tdesign.gtimg.com/site/source/figma-pc.png'
        ],
        remark: '美团刷单',
        createdAt: '2023-05-01 10:30:00'
      },
      {
        id: '2',
        shopId: '2',
        shopName: '分店1',
        employeeId: '2',
        employeeName: '李四',
        amount: 150.00,
        paymentTime: '2023-05-02 14:00:00',
        customerId: '2',
        customerName: '赵六',
        images: [
          'https://tdesign.gtimg.com/site/source/figma-pc.png'
        ],
        remark: '饿了么刷单',
        createdAt: '2023-05-02 14:30:00'
      },
      {
        id: '3',
        shopId: '3',
        shopName: '分店2',
        employeeId: '3',
        employeeName: '王五',
        amount: 200.00,
        paymentTime: '2023-05-03 16:00:00',
        customerId: '3',
        customerName: '钱七',
        images: [
          'https://tdesign.gtimg.com/site/source/figma-pc.png',
          'https://tdesign.gtimg.com/site/source/figma-pc.png',
          'https://tdesign.gtimg.com/site/source/figma-pc.png'
        ],
        remark: '美团刷单',
        createdAt: '2023-05-03 16:30:00'
      }
    ];
    
    // 应用筛选条件
    let filteredData = [...mockData];
    
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
    
    brushingList.value = filteredData;
    pagination.total = filteredData.length;
    loading.value = false;
  }, 500);
};

// 预览图片
const previewImage = (image: string) => {
  previewImages.value = [image];
  previewIndex.value = 0;
  previewVisible.value = true;
};

// 关闭预览
const closePreview = () => {
  previewVisible.value = false;
  previewImages.value = [];
};

// 处理图片加载错误
const handleImageError = (index: number) => {
  console.error(`图片加载失败: 索引 ${index}`);
  MessagePlugin.error(`第 ${index + 1} 张图片加载失败`);
};

// 初始化
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
.brushing-list {
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

.detail-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-item {
  width: calc(50% - 8px);
  
  &.full-width {
    width: 100%;
  }
}

.detail-label {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  color: var(--td-text-color-primary);
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.no-image {
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.image-preview {
  display: flex;
  align-items: center;
  
  .preview-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 4px;
    cursor: pointer;
    border: 1px solid var(--td-component-stroke);
  }
  
  .more-images {
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background-color: var(--td-bg-color-component);
    color: var(--td-text-color-primary);
    border-radius: 4px;
    font-size: 12px;
  }
}

.detail-preview-image {
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid var(--td-component-stroke);
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .detail-item {
    width: 100%;
  }
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

:deep(.t-descriptions__header) {
  margin-bottom: 16px;
}

:deep(.t-descriptions__item) {
  padding: 12px;
}

:deep(.t-descriptions__label) {
  color: var(--td-text-color-secondary);
  font-weight: normal;
}

:deep(.t-descriptions__content) {
  color: var(--td-text-color-primary);
}
</style> 