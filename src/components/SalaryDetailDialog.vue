<template>
  <t-dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="`${shopName} - ${month}工资详情`"
    width="900px"
    :footer="false"
  >
    <div class="salary-detail">
      <!-- 员工列表 -->
      <t-space direction="vertical" size="large" style="width: 100%">
        <div v-for="employee in props.data.employees" :key="employee.id" class="employee-card">
          <t-card :title="employee.name" class="employee-detail-card">
            <t-space direction="vertical" size="large" style="width: 100%">
              <!-- 基本信息 -->
              <div class="section">
                <div class="section-title">基本信息</div>
                <div class="basic-info-grid">
                  <div class="basic-info-item" v-for="(item, index) in getEmployeeBasicData(employee)" :key="index">
                    <div class="basic-info-label">{{ item.label }}：</div>
                    <div class="basic-info-value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 收入明细 -->
              <div class="section">
                <div class="section-title">收入明细</div>
                <t-table 
                  :data="employee.income.details || []" 
                  :columns="incomeColumns" 
                  bordered 
                  size="small" 
                  row-key="date"
                  :pagination="{ pageSize: 5, total: (employee.income.details || []).length }"
                  :loading="!employee.income.details || employee.income.details.length === 0"
                  empty="暂无收入明细数据"
                >
                  <template #amount="{ row }">
                    <span class="income">¥{{ row.amount.toLocaleString() }}</span>
                  </template>
                </t-table>
                <div class="summary-row">
                  <span>收入合计：</span>
                  <span class="income-total">¥{{ (employee.income.tattoo + employee.income.accessory + employee.income.electronic).toLocaleString() }}</span>
                </div>
              </div>
              
              <!-- 支出明细 -->
              <div class="section">
                <div class="section-title">支出明细</div>
                <t-table 
                  :data="employee.expenses.details || []" 
                  :columns="expenseColumns" 
                  bordered 
                  size="small" 
                  row-key="date"
                  :pagination="{ pageSize: 5, total: (employee.expenses.details || []).length }"
                  :loading="!employee.expenses.details || employee.expenses.details.length === 0"
                  empty="暂无支出明细数据"
                >
                  <template #type="{ row }">
                    <t-tag :theme="getExpenseTypeTheme(row.type)">
                      {{ getExpenseTypeLabel(row.type) }}
                    </t-tag>
                  </template>
                  <template #amount="{ row }">
                    <span class="expense">-¥{{ row.amount.toLocaleString() }}</span>
                  </template>
                </t-table>
                <div class="summary-row">
                  <span>支出合计：</span>
                  <span class="expense-total">-¥{{ (employee.expenses.materials + employee.expenses.brushing + employee.expenses.tattoo).toLocaleString() }}</span>
                </div>
              </div>
              
              <!-- 当月总薪资 -->
              <div class="section total-salary-section">
                <div class="total-salary-label">当月总薪资：</div>
                <div class="total-salary-value">¥{{ employee.totalSalary.toLocaleString() }}</div>
              </div>
            </t-space>
          </t-card>
        </div>

        <!-- 总计 -->
        <t-card title="总计" class="total-card">
          <div class="total-salary-summary">
            <span class="total-salary-summary-label">薪资总计：</span>
            <span class="total-salary-summary-value">¥{{ totalSalaryAmount.toLocaleString() }}</span>
          </div>
        </t-card>
      </t-space>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card as TCard, Table as TTable, Space as TSpace, Tag as TTag } from 'tdesign-vue-next';
import type { SalaryDetailResponse, EmployeeDetail } from '@/types/salary';

interface Props {
  visible: boolean;
  shopName: string;
  month: string;
  data: SalaryDetailResponse;
}

const props = defineProps<Props>();
defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

// 收入明细表格列定义
const incomeColumns = [
  { title: '时间', colKey: 'date', width: 120 },
  { title: '服务类型', colKey: 'serviceType', width: 120 },
  { title: '金额', colKey: 'amount', width: 120 }
];

// 支出明细表格列定义
const expenseColumns = [
  { title: '名称', colKey: 'name', width: 120 },
  { title: '支出类型', colKey: 'type', width: 120 },
  { title: '支出金额', colKey: 'amount', width: 120 },
  { title: '支出时间', colKey: 'date', width: 120 }
];

// 获取员工基本信息
const getEmployeeBasicData = (employee: EmployeeDetail) => [
  { label: '员工姓名', value: employee.name },
  { label: '底薪', value: `¥${employee.baseSalary.toLocaleString()}` },
  { label: '角色', value: employee.position || '店长' },
  { label: '提成比例', value: employee.commissionRate || '15%' },
  { label: '入职时间', value: employee.hireDate || '2023-01-15' },
  { label: '工龄', value: employee.workYears || '1年3个月' }
];

// 获取支出类型标签
const getExpenseTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'brushing': '刷单',
    'materials': '耗材',
    'tattoo': '纹身'
  };
  return typeMap[type] || type;
};

// 获取支出类型主题色
const getExpenseTypeTheme = (type: string) => {
  const themeMap: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = {
    'brushing': 'warning',
    'materials': 'primary',
    'tattoo': 'success'
  };
  return themeMap[type] || 'default';
};

// 总计数据

// 薪资总计数据
const totalSalaryAmount = computed(() => {
  const totalSalary = props.data.employees.reduce((sum, emp) => {
    return sum + emp.totalSalary;
  }, 0);
  return totalSalary;
});
</script>

<style scoped>
.salary-detail {
  padding: 16px;
}

.employee-card {
  margin-bottom: 24px;
}

.employee-card:last-child {
  margin-bottom: 0;
}

.employee-detail-card {
  width: 100%;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid #0052d9;
}

.summary-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-weight: 500;
}

.income-total {
  color: #00a870;
  font-weight: 600;
  margin-left: 8px;
}

.expense-total {
  color: #ff584c;
  font-weight: 600;
  margin-left: 8px;
}

.total-salary-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  background-color: #f0f5ff;
  border-radius: 6px;
  border: 1px solid #d4e3fc;
}

.total-salary-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-salary-value {
  font-size: 20px;
  font-weight: 700;
  color: #0052d9;
  margin-left: 12px;
}

.total-card {
  margin-top: 24px;
  background-color: #f5f7fa;
  border: 1px solid #e7e7e7;
}

.total-card :deep(.t-card__title) {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e7e7e7;
  padding-bottom: 12px;
}

.total-row {
  font-weight: 600;
  color: #333;
  background-color: #f0f5ff;
}

.income {
  color: #00a870;
  font-weight: 500;
}

.expense {
  color: #ff584c;
  font-weight: 500;
}

.total-income {
  color: #00a870;
  font-weight: 600;
}

.total-expense {
  color: #ff584c;
  font-weight: 600;
}

.total-salary {
  color: #0052d9;
  font-weight: 600;
  font-size: 16px;
}

.total-section {
  margin-bottom: 24px;
}

.total-section:last-child {
  margin-bottom: 0;
}

.total-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid #0052d9;
}

.total-salary-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  background-color: #f0f5ff;
  border-radius: 6px;
  border: 1px solid #d4e3fc;
}

.total-salary-summary-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-salary-summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #0052d9;
  margin-left: 12px;
}

:deep(.t-descriptions__item) {
  padding: 12px 16px;
}

:deep(.t-descriptions__item-label) {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

:deep(.t-descriptions__item-content) {
  font-weight: 500;
  color: #333;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background-color: #fff;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  padding: 16px;
}

.basic-info-item {
  display: flex;
  align-items: center;
}

.basic-info-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
  flex-shrink: 0;
}

.basic-info-value {
  font-weight: 500;
  color: #333;
}

@media (max-width: 768px) {
  .basic-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .basic-info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 