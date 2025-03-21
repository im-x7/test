<template>
  <div class="supply-list">
    <h2>支出管理</h2>
    
    <div class="operation-bar">
      <t-button theme="primary" @click="showAddModal">新增记录</t-button>
    </div>
    
    <!-- 列表视图 -->
    <div v-if="!showDetail">
      <t-table 
        :columns="columns" 
        :data="supplyList" 
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @page-change="handleTableChange"
      >
        <template #rent="{ row }">
          ¥{{ row.rent.toFixed(2) }}
        </template>
        <template #supplies="{ row }">
          <t-button theme="primary" variant="text" @click="showDetailModal(row, 'supplies')">
            ¥{{ row.supplies.toFixed(2) }}
          </t-button>
        </template>
        <template #water="{ row }">
          ¥{{ row.water.toFixed(2) }}
        </template>
        <template #electricity="{ row }">
          ¥{{ row.electricity.toFixed(2) }}
        </template>
        <template #salary="{ row }">
          <t-button theme="primary" variant="text" @click="showDetailModal(row, 'salary')">
            ¥{{ row.salary.toFixed(2) }}
          </t-button>
        </template>
        <template #total="{ row }">
          ¥{{ row.total.toFixed(2) }}
        </template>
        <template #fakeOrders="{ row }">
          <t-button theme="primary" variant="text" @click="showDetailModal(row, 'fakeOrders')">
            ¥{{ row.fakeOrders.toFixed(2) }}
          </t-button>
        </template>
        <template #action="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" @click="handleDetail(row)">详情</t-button>
            <t-button theme="primary" variant="text" @click="handleEdit(row)">编辑</t-button>
            <t-popconfirm
              content="确定要删除这条记录吗？"
              confirm-btn="确定"
              cancel-btn="取消"
              @confirm="handleDelete(row)"
              @close="modalVisible = false"
            >
              <t-button theme="danger" variant="text">删除</t-button>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </div>
    
    <!-- 详情视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <t-button theme="default" @click="showDetail = false">
          <template #icon><t-icon name="arrow-left" /></template>
          返回列表
        </t-button>
        <h3>支出详情</h3>
      </div>
      
      <div class="detail-content" v-if="currentDetail">
        <div class="basic-info">
          <div class="info-item">
            <span class="label">店铺：</span>
            <span class="value">{{ currentDetail.shopName }}</span>
          </div>
          <div class="info-item">
            <span class="label">时间：</span>
            <span class="value">{{ currentDetail.period }}</span>
          </div>
          <div class="info-item">
            <span class="label">备注：</span>
            <span class="value">{{ currentDetail.remark || '无' }}</span>
          </div>
        </div>
        
        <t-table
          :columns="detailColumns"
          :data="detailData"
          :loading="false"
          row-key="id"
          :pagination="{ pageSize: 10, total: detailData.length }"
          :bordered="true"
          :hover="true"
        >
          <template #amount="{ row }">
            <template v-if="row.id === '2' || row.id === '3' || row.id === '6'">
              <t-button 
                theme="primary" 
                variant="text" 
                @click="showDetailModal(currentDetail!, row.id === '2' ? 'fakeOrders' : row.id === '3' ? 'supplies' : 'salary')"
              >
                ¥{{ row.amount.toFixed(2) }}
              </t-button>
            </template>
            <template v-else>
              ¥{{ row.amount.toFixed(2) }}
            </template>
          </template>
          <template #name="{ row }">
            {{ row.name }}
          </template>
        </t-table>
      </div>
    </div>
    
    <!-- 新增/编辑记录弹窗 -->
    <t-dialog
      v-model:visible="modalVisible"
      :header="modalTitle"
      @confirm="handleModalOk"
      :confirm-loading="confirmLoading"
      @close="modalVisible = false"
    >
      <t-form :data="formState" :rules="rules" ref="formRef">
        <t-form-item label="选择店铺" name="shopId">
          <t-select
            v-model="formState.shopId"
            placeholder="请选择店铺"
            style="width: 100%"
            @close="modalVisible = false"
          >
            <t-option v-for="shop in shopOptions" :key="shop.value" :value="shop.value">
              {{ shop.label }}
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item label="时间" name="period">
          <t-date-picker
            v-model="formState.period"
            mode="month"
            format="YYYY-MM"
            style="width: 100%"
            :popup-props="{ attach: (triggerNode: HTMLElement) => triggerNode.parentNode }"
            @close="modalVisible = false"
          />
        </t-form-item>
        <t-form-item label="租金" name="rent">
          <t-input-number v-model="formState.rent" :min="0" :step="0.01" style="width: 100%" @change="calculateTotal" />
        </t-form-item>
        <t-form-item label="刷单记录" name="fakeOrders">
          <t-input-number v-model="formState.fakeOrders" :min="0" :step="0.01" style="width: 100%" disabled />
        </t-form-item>
        <t-form-item label="耗材支出" name="supplies">
          <t-input-number v-model="formState.supplies" :min="0" :step="0.01" style="width: 100%" disabled />
        </t-form-item>
        <t-form-item label="水费" name="water">
          <t-input-number v-model="formState.water" :min="0" :step="0.01" style="width: 100%" @change="calculateTotal" />
        </t-form-item>
        <t-form-item label="电费" name="electricity">
          <t-input-number v-model="formState.electricity" :min="0" :step="0.01" style="width: 100%" @change="calculateTotal" />
        </t-form-item>
        <t-form-item label="员工工资" name="salary">
          <t-input-number v-model="formState.salary" :min="0" :step="0.01" style="width: 100%" disabled />
        </t-form-item>
        <t-form-item label="总额" name="total">
          <t-input-number v-model="formState.total" :min="0" :step="0.01" style="width: 100%" disabled />
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="formState.remark" :rows="3" placeholder="请输入备注信息" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 明细侧边栏 -->
    <t-drawer
      v-model:visible="drawerVisible"
      :header="drawerTitle"
      size="500px"
      :footer="false"
      :show-overlay="true"
      attach="body"
    >
      <div class="detail-drawer-content">
        <div class="detail-header">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">店铺名称</span>
              <span class="value">{{ currentDetail?.shopName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">记录时间</span>
              <span class="value">{{ currentDetail?.period || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">总金额</span>
              <span class="value highlight">¥{{ currentDetail?.total?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间</span>
              <span class="value">{{ currentDetail?.createdAt || '-' }}</span>
            </div>
          </div>
        </div>
        
        <t-table
          :columns="detailColumns"
          :data="currentDetailData"
          :loading="false"
          row-key="id"
          :pagination="{}"
          :bordered="true"
        >
          <template #amount="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </t-table>
      </div>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';

// 支出数据类型
interface Supply {
  id: string;
  shopId: string;
  shopName: string;
  period: string;
  rent: number;
  fakeOrders: number;
  supplies: number;
  water: number;
  electricity: number;
  salary: number;
  total: number;
  remark: string;
  createdAt: string;
}

// 表单数据类型
interface FormState {
  shopId: string;
  period: any;
  rent: number;
  fakeOrders: number;
  supplies: number;
  water: number;
  electricity: number;
  salary: number;
  total: number;
  remark: string;
}

// 表格列定义
const columns = [
  {
    title: '店铺',
    colKey: 'shopName',
    width: 120,
  },
  {
    title: '时间',
    colKey: 'period',
    width: 100,
  },
  {
    title: '租金',
    colKey: 'rent',
    width: 80,
    cell: 'rent',
  },
  {
    title: '刷单记录',
    colKey: 'fakeOrders',
    width: 100,
    cell: 'fakeOrders',
  },
  {
    title: '耗材支出',
    colKey: 'supplies',
    width: 100,
    cell: 'supplies',
  },
  {
    title: '水费',
    colKey: 'water',
    width: 80,
    cell: 'water',
  },
  {
    title: '电费',
    colKey: 'electricity',
    width: 80,
    cell: 'electricity',
  },
  {
    title: '员工工资',
    colKey: 'salary',
    width: 100,
    cell: 'salary',
  },
  {
    title: '总额',
    colKey: 'total',
    width: 100,
    cell: 'total',
  },
  {
    title: '备注',
    colKey: 'remark',
    width: 150,
    ellipsis: true,
  },
  {
    title: '操作',
    colKey: 'action',
    width: 180,
    cell: 'action',
  },
];

// 状态定义
const loading = ref(false);
const supplyList = ref<Supply[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
});

// 弹窗相关状态
const modalVisible = ref(false);
const modalTitle = ref('新增记录');
const confirmLoading = ref(false);
const formRef = ref();
const formState = reactive<FormState>({
  shopId: '',
  period: null,
  rent: 0,
  fakeOrders: 0,
  supplies: 0,
  water: 0,
  electricity: 0,
  salary: 0,
  total: 0,
  remark: ''
});

// 店铺选项
const shopOptions = ref([
  { value: '1', label: '总店' },
  { value: '2', label: '分店1' },
  { value: '3', label: '分店2' },
]);

// 表单验证规则
const rules = {
  shopId: [{ required: true, message: '请选择店铺' }],
  period: [{ required: true, message: '请选择时间' }],
  rent: [{ required: true, message: '请输入租金' }],
  water: [{ required: true, message: '请输入水费' }],
  electricity: [{ required: true, message: '请输入电费' }]
};

// 计算总额
const calculateTotal = () => {
  // 这里可以添加自动计算逻辑
  const fakeOrders = 0; // 需要根据实际业务逻辑计算
  const supplies = 0; // 需要根据实际业务逻辑计算
  const salary = 0; // 需要根据实际业务逻辑计算
  
  formState.fakeOrders = fakeOrders;
  formState.supplies = supplies;
  formState.salary = salary;
  
  formState.total = 
    formState.rent + 
    formState.fakeOrders + 
    formState.supplies + 
    formState.water + 
    formState.electricity + 
    formState.salary;
};

// 获取支出列表
const fetchSupplyList = () => {
  console.log('开始获取支出列表数据');
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    console.log('模拟支出列表数据返回');
    const expenses = [
      {
        id: '1',
        shopId: '1',
        shopName: '总店',
        period: '2023-01',
        rent: 5000,
        fakeOrders: 3000,
        supplies: 2000,
        water: 300,
        electricity: 500,
        salary: 8000,
        total: 18800,
        remark: '1月份费用',
        createdAt: '2023-01-31 10:00:00'
      },
      {
        id: '2',
        shopId: '1',
        shopName: '总店',
        period: '2023-02',
        rent: 5000,
        fakeOrders: 3500,
        supplies: 2500,
        water: 320,
        electricity: 550,
        salary: 8000,
        total: 19870,
        remark: '2月份费用',
        createdAt: '2023-02-28 14:30:00'
      },
      {
        id: '3',
        shopId: '2',
        shopName: '分店1',
        period: '2023-03',
        rent: 5000,
        fakeOrders: 4000,
        supplies: 3000,
        water: 350,
        electricity: 600,
        salary: 9000,
        total: 21950,
        remark: '3月份费用',
        createdAt: '2023-03-31 09:15:00'
      }
    ];
    
    // 检查数据项
    for (const item of expenses) {
      console.log('检查支出数据项:', item);
      if (!item.id) {
        console.warn('支出记录缺少id属性:', item);
      }
    }
    
    console.log('支出列表数据:', expenses);
    supplyList.value = expenses;
    console.log('支出列表组件数据已设置:', supplyList.value);
    
    pagination.total = expenses.length;
    console.log('支出列表总条数:', pagination.total);
    
    loading.value = false;
    console.log('支出列表加载状态:', loading.value ? '加载中' : '已完成');
  }, 500);
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchSupplyList();
};

// 显示新增记录弹窗
const showAddModal = () => {
  modalTitle.value = '新增记录';
  // 重置表单
  formState.shopId = '';
  formState.period = null;
  formState.rent = 0;
  formState.fakeOrders = 0;
  formState.supplies = 0;
  formState.water = 0;
  formState.electricity = 0;
  formState.salary = 0;
  formState.total = 0;
  formState.remark = '';
  // 触发一次计算，以获取自动计算的金额
  calculateTotal();
  modalVisible.value = true;
};

// 编辑记录
const handleEdit = (record: Supply) => {
  modalTitle.value = '编辑记录';
  // 填充表单
  formState.shopId = record.shopId;
  formState.period = dayjs(record.period);
  formState.rent = record.rent;
  formState.water = record.water;
  formState.electricity = record.electricity;
  formState.remark = record.remark;
  // 触发一次计算，以获取自动计算的金额
  calculateTotal();
  modalVisible.value = true;
};

// 删除记录
const handleDelete = (record: Supply) => {
  // 模拟API请求
  MessagePlugin.success(`删除记录：${record.period}`);
  fetchSupplyList();
};

// 详情视图状态
const showDetail = ref(false);
const currentDetail = ref<Supply | null>(null);

// 详情表格列定义
const detailColumns = [
  {
    title: '项目',
    colKey: 'name',
    width: 120,
  },
  {
    title: '金额',
    colKey: 'amount',
    width: 120,
    cell: 'amount',
  },
  {
    title: '说明',
    colKey: 'description',
    width: 200,
  }
];

// 详情数据
const detailData = computed(() => {
  if (!currentDetail.value) return [];
  
  return [
    {
      id: '1',
      name: '租金',
      amount: currentDetail.value.rent,
      description: '店铺租金费用',
      children: [
        {
          id: '1-1',
          name: '基础租金',
          amount: currentDetail.value.rent * 0.8,
          description: '店铺基础租金费用'
        },
        {
          id: '1-2',
          name: '物业费',
          amount: currentDetail.value.rent * 0.2,
          description: '店铺物业管理费用'
        }
      ]
    },
    {
      id: '2',
      name: '刷单记录',
      amount: currentDetail.value.fakeOrders,
      description: '系统自动计算的刷单费用',
      children: [
        {
          id: '2-1',
          name: '纹身刷单',
          amount: currentDetail.value.fakeOrders * 0.6,
          description: '纹身项目刷单费用',
          children: [
            {
              id: '2-1-1',
              name: '小图刷单',
              amount: currentDetail.value.fakeOrders * 0.3,
              description: '小图纹身项目刷单费用'
            },
            {
              id: '2-1-2',
              name: '大图刷单',
              amount: currentDetail.value.fakeOrders * 0.3,
              description: '大图纹身项目刷单费用'
            }
          ]
        },
        {
          id: '2-2',
          name: '饰品刷单',
          amount: currentDetail.value.fakeOrders * 0.4,
          description: '饰品项目刷单费用',
          children: [
            {
              id: '2-2-1',
              name: '耳饰刷单',
              amount: currentDetail.value.fakeOrders * 0.2,
              description: '耳饰项目刷单费用'
            },
            {
              id: '2-2-2',
              name: '项链刷单',
              amount: currentDetail.value.fakeOrders * 0.2,
              description: '项链项目刷单费用'
            }
          ]
        }
      ]
    },
    {
      id: '3',
      name: '耗材支出',
      amount: currentDetail.value.supplies,
      description: '系统自动计算的耗材费用',
      children: [
        {
          id: '3-1',
          name: '纹身耗材',
          amount: currentDetail.value.supplies * 0.7,
          description: '纹身项目耗材费用',
          children: [
            {
              id: '3-1-1',
              name: '色料',
              amount: currentDetail.value.supplies * 0.3,
              description: '纹身色料费用'
            },
            {
              id: '3-1-2',
              name: '针头',
              amount: currentDetail.value.supplies * 0.2,
              description: '纹身针头费用'
            },
            {
              id: '3-1-3',
              name: '手套',
              amount: currentDetail.value.supplies * 0.2,
              description: '一次性手套费用'
            }
          ]
        },
        {
          id: '3-2',
          name: '饰品耗材',
          amount: currentDetail.value.supplies * 0.3,
          description: '饰品项目耗材费用',
          children: [
            {
              id: '3-2-1',
              name: '耳饰配件',
              amount: currentDetail.value.supplies * 0.15,
              description: '耳饰配件费用'
            },
            {
              id: '3-2-2',
              name: '项链配件',
              amount: currentDetail.value.supplies * 0.15,
              description: '项链配件费用'
            }
          ]
        }
      ]
    },
    {
      id: '4',
      name: '水费',
      amount: currentDetail.value.water,
      description: '店铺用水费用',
      children: [
        {
          id: '4-1',
          name: '生活用水',
          amount: currentDetail.value.water * 0.6,
          description: '生活用水费用'
        },
        {
          id: '4-2',
          name: '业务用水',
          amount: currentDetail.value.water * 0.4,
          description: '业务用水费用'
        }
      ]
    },
    {
      id: '5',
      name: '电费',
      amount: currentDetail.value.electricity,
      description: '店铺用电费用',
      children: [
        {
          id: '5-1',
          name: '照明用电',
          amount: currentDetail.value.electricity * 0.3,
          description: '照明用电费用'
        },
        {
          id: '5-2',
          name: '设备用电',
          amount: currentDetail.value.electricity * 0.7,
          description: '设备用电费用'
        }
      ]
    },
    {
      id: '6',
      name: '员工工资',
      amount: currentDetail.value.salary,
      description: '系统自动计算的员工工资',
      children: [
        {
          id: '6-1',
          name: '纹身师工资',
          amount: currentDetail.value.salary * 0.6,
          description: '纹身师当月工资',
          children: [
            {
              id: '6-1-1',
              name: '基础工资',
              amount: currentDetail.value.salary * 0.3,
              description: '纹身师基础工资'
            },
            {
              id: '6-1-2',
              name: '提成工资',
              amount: currentDetail.value.salary * 0.3,
              description: '纹身师提成工资'
            }
          ]
        },
        {
          id: '6-2',
          name: '前台工资',
          amount: currentDetail.value.salary * 0.4,
          description: '前台当月工资',
          children: [
            {
              id: '6-2-1',
              name: '基础工资',
              amount: currentDetail.value.salary * 0.2,
              description: '前台基础工资'
            },
            {
              id: '6-2-2',
              name: '提成工资',
              amount: currentDetail.value.salary * 0.2,
              description: '前台提成工资'
            }
          ]
        }
      ]
    },
    {
      id: '7',
      name: '总额',
      amount: currentDetail.value.total,
      description: '所有费用总和'
    }
  ];
});

// 查看详情
const handleDetail = (record: Supply) => {
  currentDetail.value = record;
  showDetail.value = true;
};

// 弹窗确认
const handleModalOk = () => {
  // 如果是详情模式，直接关闭弹窗
  if (modalTitle.value === '支出详情') {
    modalVisible.value = false;
    return;
  }
  
  formRef.value?.validate().then(() => {
    confirmLoading.value = true;
    // 模拟API请求
    setTimeout(() => {
      // 关闭弹窗
      // 显示成功提示
      MessagePlugin.success(modalTitle.value === '新增记录' ? '新增记录成功' : '编辑记录成功');
      modalVisible.value = false;
      confirmLoading.value = false;
      fetchSupplyList();
    }, 500);
  }).catch((error: any) => {
    console.log('验证失败:', error);
  });
};

// 展开行配置

// 展开行变化处理

// 侧边栏相关状态
const drawerVisible = ref(false);
const drawerTitle = ref('');
const currentDetailData = ref<any[]>([]);

// 显示明细侧边栏
const showDetailModal = (record: Supply, type: 'fakeOrders' | 'supplies' | 'salary') => {
  currentDetail.value = record;
  drawerVisible.value = true;
  
  // 根据类型设置标题和数据
  switch (type) {
    case 'fakeOrders':
      drawerTitle.value = '刷单记录明细';
      currentDetailData.value = [
        {
          id: '1',
          name: '纹身刷单',
          amount: record.fakeOrders * 0.6,
          description: '纹身项目刷单费用',
          children: [
            {
              id: '1-1',
              name: '小图刷单',
              amount: record.fakeOrders * 0.3,
              description: '小图纹身项目刷单费用'
            },
            {
              id: '1-2',
              name: '大图刷单',
              amount: record.fakeOrders * 0.3,
              description: '大图纹身项目刷单费用'
            }
          ]
        },
        {
          id: '2',
          name: '饰品刷单',
          amount: record.fakeOrders * 0.4,
          description: '饰品项目刷单费用',
          children: [
            {
              id: '2-1',
              name: '耳饰刷单',
              amount: record.fakeOrders * 0.2,
              description: '耳饰项目刷单费用'
            },
            {
              id: '2-2',
              name: '项链刷单',
              amount: record.fakeOrders * 0.2,
              description: '项链项目刷单费用'
            }
          ]
        }
      ];
      break;
    case 'supplies':
      drawerTitle.value = '耗材支出明细';
      currentDetailData.value = [
        {
          id: '1',
          name: '纹身耗材',
          amount: record.supplies * 0.7,
          description: '纹身项目耗材费用',
          children: [
            {
              id: '1-1',
              name: '色料',
              amount: record.supplies * 0.3,
              description: '纹身色料费用'
            },
            {
              id: '1-2',
              name: '针头',
              amount: record.supplies * 0.2,
              description: '纹身针头费用'
            },
            {
              id: '1-3',
              name: '手套',
              amount: record.supplies * 0.2,
              description: '一次性手套费用'
            }
          ]
        },
        {
          id: '2',
          name: '饰品耗材',
          amount: record.supplies * 0.3,
          description: '饰品项目耗材费用',
          children: [
            {
              id: '2-1',
              name: '耳饰配件',
              amount: record.supplies * 0.15,
              description: '耳饰配件费用'
            },
            {
              id: '2-2',
              name: '项链配件',
              amount: record.supplies * 0.15,
              description: '项链配件费用'
            }
          ]
        }
      ];
      break;
    case 'salary':
      drawerTitle.value = '员工工资明细';
      currentDetailData.value = [
        {
          id: '1',
          name: '纹身师工资',
          amount: record.salary * 0.6,
          description: '纹身师当月工资',
          children: [
            {
              id: '1-1',
              name: '基础工资',
              amount: record.salary * 0.3,
              description: '纹身师基础工资'
            },
            {
              id: '1-2',
              name: '提成工资',
              amount: record.salary * 0.3,
              description: '纹身师提成工资'
            }
          ]
        },
        {
          id: '2',
          name: '前台工资',
          amount: record.salary * 0.4,
          description: '前台当月工资',
          children: [
            {
              id: '2-1',
              name: '基础工资',
              amount: record.salary * 0.2,
              description: '前台基础工资'
            },
            {
              id: '2-2',
              name: '提成工资',
              amount: record.salary * 0.2,
              description: '前台提成工资'
            }
          ]
        }
      ];
      break;
  }
};

// 处理导入文件变化

onMounted(() => {
  fetchSupplyList();
});
</script>

<style scoped>
.supply-list {
  padding: 0 12px;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.detail-view {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.detail-header h3 {
  margin: 0 0 0 16px;
  font-size: 20px;
  font-weight: 500;
}

.detail-content {
  .basic-info {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-default);
    
    .info-item {
      display: flex;
      align-items: center;
      
      .label {
        color: var(--td-text-color-secondary);
        margin-right: 8px;
      }
      
      .value {
        color: var(--td-text-color-primary);
        font-weight: 500;
      }
    }
  }

  :deep(.t-table) {
    .t-table__row {
      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }
    }
    
    .t-table__row--level-1 {
      background-color: var(--td-bg-color-container-hover);
    }

    .t-table__row--level-2 {
      background-color: var(--td-bg-color-container);
    }

    .t-icon {
      cursor: pointer;
      color: var(--td-text-color-secondary);
      transition: transform 0.2s;
      
      &:hover {
        color: var(--td-brand-color);
      }
    }
  }
}

.detail-drawer-content {
  padding: 16px;
  
  .detail-header {
    margin-bottom: 24px;
    padding: 20px;
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-default);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    
    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--td-text-color-primary);
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--td-component-stroke);
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      
      .label {
        color: var(--td-text-color-secondary);
        font-size: 13px;
        margin-bottom: 4px;
      }
      
      .value {
        color: var(--td-text-color-primary);
        font-weight: 500;
        font-size: 14px;
      }
      
      .highlight {
        color: var(--td-brand-color);
        font-size: 16px;
      }
    }
  }
}
</style>
