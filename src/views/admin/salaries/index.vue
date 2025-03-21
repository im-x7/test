<template>
  <div class="salary-manage">
    <t-card>
      <template #title>工资管理</template>
      <template #actions>
        <t-button theme="primary" @click="showAddDialog">
          <template #icon><t-icon name="add" /></template>
          新增工资记录
        </t-button>
      </template>

      <t-table :data="salaryList" :columns="columns" bordered row-key="id">
        <template #store="{ row }">
          {{ row.shopName }}
        </template>
        <template #month="{ row }">
          {{ row.month }}
        </template>
        <template #employeeCount="{ row }">
          {{ row.employeeCount || 0 }}人
        </template>
        <template #create_time="{ row }">
          {{ row.create_time }}
        </template>
        <template #op="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" @click="handleEdit(row)">
              编辑
            </t-button>
            <t-button theme="primary" variant="text" @click="showDetail(row)">
              员工工资详情
            </t-button>
            <t-button theme="danger" variant="text" @click="handleDelete(row)">
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增工资记录弹窗 -->
    <t-dialog
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      header="新增工资记录"
      width="600px"
      :footer="false"
    >
      <t-form
        ref="form"
        :data="formData"
        :rules="rules"
        label-width="100px"
        @submit="handleSubmit"
      >
        <t-form-item label="门店" name="store_id">
          <t-select
            v-model="formData.store_id"
            :options="storeOptions"
            placeholder="请选择门店"
            @change="handleStoreChange"
          />
        </t-form-item>
        <t-form-item label="工资月份" name="month">
          <t-date-picker
            v-model="formData.month"
            mode="month"
            placeholder="请选择月份"
          />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">确定</t-button>
            <t-button theme="default" @click="dialogVisible = false">取消</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 工资详情弹窗 -->
    <salary-detail-dialog
      v-model:visible="detailVisible"
      :shop-name="selectedEmployee?.store?.name || ''"
      :month="selectedMonth"
      :data="selectedDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { Dialog as TDialog, Form as TForm, FormItem as TFormItem, Select as TSelect, DatePicker as TDatePicker, Button as TButton, Space as TSpace, Card as TCard, Table as TTable, Icon as TIcon } from 'tdesign-vue-next';
import { formatDate } from '@/utils/date.ts';
import { getStoreList } from '@/api/store';
import { getEmployeeList } from '@/api/employee';
import { getSalaryList, createSalary, deleteSalary } from '@/api/salary';
import SalaryDetailDialog from '@/components/SalaryDetailDialog.vue';
import type { SalaryRecord, ApiResponse, SalaryDetailResponse } from '@/types/salary';

interface Store {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  store_id: string;
  store?: {
    id: string;
    name: string;
  };
}

interface FormData {
  store_id: string;
  month: string;
  employee_id?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

// 表格列定义
const columns = [
  { title: '门店', colKey: 'store' },
  { title: '工资月份', colKey: 'month' },
  { title: '员工人数', colKey: 'employeeCount' },
  { title: '创建时间', colKey: 'create_time' },
  { title: '操作', colKey: 'op', width: 160 },
];

// 数据列表
const salaryList = ref<SalaryRecord[]>([]);

// 门店选项
const storeOptions = ref<SelectOption[]>([]);

// 员工选项
const employeeOptions = ref<SelectOption[]>([]);

// 弹窗控制
const dialogVisible = ref(false);
const detailVisible = ref(false);
const isEdit = ref(false);

// 表单数据
const formData = ref<FormData>({
  store_id: '',
  month: '',
});

// 表单校验规则
const rules = {
  store_id: [{ required: true, message: '请选择门店' }],
  month: [{ required: true, message: '请选择月份' }],
};

// 选中的员工和月份
const selectedEmployee = ref<Employee | null>(null);
const selectedMonth = ref<string>('');
const selectedDetail = ref<SalaryDetailResponse>({
  employees: [],
  income: {
    tattoo: 0,
    accessory: 0,
    electronic: 0,
    details: []
  },
  expenses: {
    materials: 0,
    brushing: 0,
    tattoo: 0,
    details: []
  },
  payments: [],
});

// 表单引用
const form = ref();

// 状态变量定义
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});
const filterForm = reactive({
  employeeId: '',
  shopId: '',
  startDate: '',
  endDate: ''
});

// 新增工资详情表单

// 获取门店列表
const fetchStores = async () => {
  try {
    const res = await getStoreList();
    storeOptions.value = res.data.map((store: Store) => ({
      label: store.name,
      value: store.id,
    }));
  } catch (error) {
    MessagePlugin.error('获取门店列表失败');
  }
};

// 获取员工列表
const fetchEmployees = async (storeId: string) => {
  try {
    const res = await getEmployeeList();
    employeeOptions.value = res.data
      .filter((employee: Employee) => employee.store_id === storeId)
      .map((employee: Employee) => ({
        label: employee.name,
        value: employee.id,
      }));
    if (formData.value) {
      formData.value.employee_id = '';
    }
  } catch (error) {
    MessagePlugin.error('获取员工列表失败');
  }
};

// 获取工资列表
const fetchSalaryList = async () => {
  loading.value = true;
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...filterForm,
    };
    const res = await getSalaryList(params);
    console.log('Salary list response:', JSON.stringify(res, null, 2));
    if (res.data && res.data.list) {
      salaryList.value = res.data.list;
      pagination.total = res.data.total;
    } else {
      console.error('Invalid response structure:', res);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('获取工资列表失败:', error);
    MessagePlugin.error('获取工资列表失败');
  } finally {
    loading.value = false;
  }
};

// 门店变更处理
const handleStoreChange = (value: string) => {
  if (value) {
    fetchEmployees(value);
  }
};

// 显示新增弹窗
const showAddDialog = () => {
  isEdit.value = false;
  formData.value = {
    store_id: '',
    month: '',
  };
  dialogVisible.value = true;
  // 重置表单
  form.value?.reset();
};

// 处理编辑
const handleEdit = (row: SalaryRecord) => {
  isEdit.value = true;
  formData.value = {
    store_id: row.store.id,
    month: row.month,
  };
  dialogVisible.value = true;
};

// 显示详情弹窗
const showDetail = (row: SalaryRecord) => {
  selectedEmployee.value = row.employee;
  selectedMonth.value = row.month || '';
  
  // 模拟数据
  const mockData: SalaryDetailResponse = {
    employees: [
      {
        id: '1',
        name: '张三',
        baseSalary: 3000, // 底薪
        position: '纹身师', // 职位
        hireDate: '2023-01-15', // 入职时间
        workYears: '1年3个月', // 工龄
        commissionRate: '15%', // 提成比例
        income: {
          tattoo: 5000,
          accessory: 2000,
          electronic: 1500,
          details: [
            {
              date: '2024-03-05',
              serviceType: '纹身',
              amount: 2500
            },
            {
              date: '2024-03-12',
              serviceType: '纹身',
              amount: 2500
            },
            {
              date: '2024-03-18',
              serviceType: '饰品',
              amount: 1200
            },
            {
              date: '2024-03-22',
              serviceType: '饰品',
              amount: 800
            },
            {
              date: '2024-03-25',
              serviceType: '电子',
              amount: 1500
            }
          ]
        },
        expenses: {
          materials: 800,
          brushing: 500,
          tattoo: 300,
          details: [
            {
              name: '纹身颜料',
              type: 'materials',
              amount: 500,
              date: '2024-03-03'
            },
            {
              name: '纹身针',
              type: 'materials',
              amount: 300,
              date: '2024-03-10'
            },
            {
              name: '刷单费用',
              type: 'brushing',
              amount: 500,
              date: '2024-03-15'
            },
            {
              name: '纹身设计费',
              type: 'tattoo',
              amount: 300,
              date: '2024-03-20'
            }
          ]
        },
        payments: [
          {
            date: '2024-03-15',
            amount: 7200,
            type: '工资发放'
          }
        ],
        totalSalary: 6900 // 当月总薪资
      },
      {
        id: '2',
        name: '李四',
        baseSalary: 3500,
        position: '店长', // 职位
        hireDate: '2022-05-10', // 入职时间
        workYears: '1年11个月', // 工龄
        commissionRate: '20%', // 提成比例
        income: {
          tattoo: 4500,
          accessory: 1800,
          electronic: 1200,
          details: [
            {
              date: '2024-03-08',
              serviceType: '纹身',
              amount: 2200
            },
            {
              date: '2024-03-15',
              serviceType: '纹身',
              amount: 2300
            },
            {
              date: '2024-03-20',
              serviceType: '饰品',
              amount: 1800
            },
            {
              date: '2024-03-27',
              serviceType: '电子',
              amount: 1200
            }
          ]
        },
        expenses: {
          materials: 700,
          brushing: 400,
          tattoo: 200,
          details: [
            {
              name: '纹身颜料',
              type: 'materials',
              amount: 400,
              date: '2024-03-05'
            },
            {
              name: '纹身针',
              type: 'materials',
              amount: 300,
              date: '2024-03-12'
            },
            {
              name: '刷单费用',
              type: 'brushing',
              amount: 400,
              date: '2024-03-18'
            },
            {
              name: '纹身设计费',
              type: 'tattoo',
              amount: 200,
              date: '2024-03-22'
            }
          ]
        },
        payments: [
          {
            date: '2024-03-15',
            amount: 6400,
            type: '工资发放'
          }
        ],
        totalSalary: 6200
      },
      {
        id: '3',
        name: '王五',
        baseSalary: 4000,
        position: '高级纹身师', // 职位
        hireDate: '2021-08-20', // 入职时间
        workYears: '2年8个月', // 工龄
        commissionRate: '25%', // 提成比例
        income: {
          tattoo: 6000,
          accessory: 2500,
          electronic: 2000,
          details: [
            {
              date: '2024-03-03',
              serviceType: '纹身',
              amount: 3000
            },
            {
              date: '2024-03-10',
              serviceType: '纹身',
              amount: 3000
            },
            {
              date: '2024-03-17',
              serviceType: '饰品',
              amount: 1500
            },
            {
              date: '2024-03-24',
              serviceType: '饰品',
              amount: 1000
            },
            {
              date: '2024-03-28',
              serviceType: '电子',
              amount: 2000
            }
          ]
        },
        expenses: {
          materials: 1000,
          brushing: 600,
          tattoo: 400,
          details: [
            {
              name: '纹身颜料',
              type: 'materials',
              amount: 600,
              date: '2024-03-02'
            },
            {
              name: '纹身针',
              type: 'materials',
              amount: 400,
              date: '2024-03-09'
            },
            {
              name: '刷单费用',
              type: 'brushing',
              amount: 600,
              date: '2024-03-16'
            },
            {
              name: '纹身设计费',
              type: 'tattoo',
              amount: 400,
              date: '2024-03-23'
            }
          ]
        },
        payments: [
          {
            date: '2024-03-15',
            amount: 8900,
            type: '工资发放'
          }
        ],
        totalSalary: 8500
      }
    ],
    income: {
      tattoo: 15500,
      accessory: 6300,
      electronic: 4700,
      details: []
    },
    expenses: {
      materials: 2500,
      brushing: 1500,
      tattoo: 900,
      details: []
    },
    payments: [
      {
        date: '2024-03-15',
        amount: 22500,
        type: '工资发放'
      }
    ]
  };

  selectedDetail.value = mockData;
  detailVisible.value = true;
};

// 获取工资详情

// 提交表单
const handleSubmit = async ({ validateResult }: { validateResult: boolean }) => {
  if (validateResult === true) {
    try {
      const store = storeOptions.value.find(s => s.value === formData.value.store_id);
      if (!store) {
        MessagePlugin.error('门店信息不存在');
        return;
      }

      // 获取该门店所有员工
      const res = await getEmployeeList();
      const employees = res.data.filter((employee: Employee) => employee.store_id === formData.value.store_id);

      // 为每个员工创建工资记录
      const promises = employees.map(async (employee: Employee) => {
        const data = {
          store_id: formData.value.store_id,
          employee_id: employee.id,
          month: formData.value.month,
          store: {
            id: formData.value.store_id,
            name: store.label,
          },
          employee: {
            id: employee.id,
            name: employee.name,
            store_id: formData.value.store_id,
          },
          create_time: formatDate(new Date()),
          tattoo_amount: 0,
          accessory_amount: 0,
          electronic_amount: 0,
          materials_amount: 0,
          brushing_amount: 0,
          payment_date: '',
          amount: 0,
          shopId: formData.value.store_id,
          employeeId: employee.id,
          baseSalary: 0,
          commission: 0,
          bonus: 0,
          deduction: 0
        };
        return createSalary(data);
      });

      await Promise.all(promises);
      MessagePlugin.success('创建成功');
      dialogVisible.value = false;
      fetchSalaryList();
    } catch (error) {
      console.error('保存工资记录失败:', error);
      MessagePlugin.error('创建失败');
    }
  }
};

// 删除记录
const handleDelete = async (row: SalaryRecord) => {
  try {
    const res = await deleteSalary(row.id);
    const response = res.data as ApiResponse<null>;
    if (response.code === 200) {
      MessagePlugin.success('删除成功');
      fetchSalaryList();
    } else {
      MessagePlugin.error(response.message || '删除失败');
    }
  } catch (error) {
    console.error('删除失败:', error);
    MessagePlugin.error('删除失败');
  }
};

// 提交工资详情表单

// 初始化
onMounted(() => {
  fetchStores();
  fetchSalaryList();
});
</script>

<style scoped>
.salary-manage {
  padding: 16px;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: var(--td-brand-color);
}
</style>