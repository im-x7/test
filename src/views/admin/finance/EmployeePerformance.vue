<template>
  <div class="employee-performance">
    <div class="filter-section">
      <t-form :data="filterData" layout="inline">
        <t-form-item label="时间范围">
          <t-date-range-picker
            v-model="filterData.dateRange"
            mode="date"
            :default-value="defaultDateRange"
          />
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" @click="handleSearch">查询</t-button>
          <t-button theme="default" @click="handleReset">重置</t-button>
        </t-form-item>
      </t-form>
    </div>

    <!-- 人员维度表格 -->
    <t-table
      v-if="filterData.dimension === 'employee'"
      :columns="employeeColumns"
      :data="employeeData"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      @page-change="handleTableChange"
      bordered
      :row-class-name="employeeRowClass"
    >
      <!-- 合计行 -->
    </t-table>

    <!-- 店铺详情弹窗 -->
    <t-dialog
      v-model:visible="shopDetailVisible"
      header="店铺详细信息"
      :width="800"
      :footer="false"
    >
      <template v-if="currentShop">
        <t-tabs default-value="employee">
          <t-tab-panel value="employee" label="员工信息">
            <t-table
              :data="currentShop.employees"
              :columns="employeeDetailColumns"
              :pagination="{ pageSize: 5 }"
              size="small"
            />
          </t-tab-panel>
          <t-tab-panel value="revenue" label="收入分析">
            <div class="revenue-chart" ref="revenueChart"></div>
          </t-tab-panel>
        </t-tabs>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import dayjs from 'dayjs'
import { getEmployeePerformance } from '@/api/finance'
import * as echarts from 'echarts'

// 定义详细的类型
interface SalaryStructure {
  base: number;
  commission: number;
  profit: number;
}

interface IncomeStructure {
  base: number;
  commission: number;
  profit: number;
  total: number;
}

interface EmployeeInfo {
  id: string;
  name: string;
  role: 'employee' | 'manager' | 'partner';
  salary: SalaryStructure;
  income: IncomeStructure;
  performance?: number;
  shops: Array<{
    id: string;
    name: string;
    services?: {
      tattoo: number;
      piercing: number;
      electronic: number;
    };
  }>;
}

interface ShopRecord {
  id: string;
  name: string;
  employees: EmployeeInfo[];
  totalRevenue: number;
  tattooRevenue: number;
  piercingRevenue: number;
  electronicRevenue: number;
  employeeCount: number;
}

// 筛选数据
const filterData = reactive({
  dateRange: [] as string[],
  dimension: 'employee' as 'employee'
})

// 默认时间范围（当前月至今日）
const defaultDateRange = [
  dayjs().startOf('month').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
]

// 加载状态
const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 人员维度表格列定义
const employeeColumns = [
  {
    colKey: 'name',
    title: '姓名',
    width: 100
  },
  {
    colKey: 'shopName',
    title: '所属店铺',
    width: 120
  },
  {
    colKey: 'tattooService',
    title: '纹身服务',
    width: 120,
    align: 'right'
  },
  {
    colKey: 'piercingService',
    title: '饰品服务',
    width: 120,
    align: 'right'
  },
  {
    colKey: 'electronicService',
    title: '电子服务',
    width: 120,
    align: 'right'
  },
  {
    colKey: 'total',
    title: '合计',
    width: 120,
    align: 'right'
  }
]

// 表格数据
const employeeData = ref<any[]>([])
const shopData = ref<ShopRecord[]>([])

// 处理员工数据，将其转换为表格所需格式
const processEmployeeData = (employees: unknown) => {
  const employeeList = employees as EmployeeInfo[];
  const result: any[] = []
  
  // 按员工ID分组的数据
  const employeeGroups: Record<string, any[]> = {}
  
  employeeList.forEach(employee => {
    // 初始化该员工的分组数据
    if (!employeeGroups[employee.id]) {
      employeeGroups[employee.id] = []
    }
    
    employee.shops.forEach(shop => {
      // 假设服务数据在shop.services中
      const tattooService = shop.services?.tattoo || 0
      const piercingService = shop.services?.piercing || 0
      const electronicService = shop.services?.electronic || 0
      const total = tattooService + piercingService + electronicService
      
      const rowData = {
        id: `${employee.id}-${shop.id}`,
        employeeId: employee.id,
        name: employee.name,
        shopId: shop.id,
        shopName: shop.name,
        tattooService,
        piercingService,
        electronicService,
        total,
        isTotal: false // 标记是否为合计行
      }
      
      // 添加到该员工的分组中
      employeeGroups[employee.id].push(rowData)
    })
  })
  
  // 为每个员工添加合计行并将所有数据添加到结果中
  Object.keys(employeeGroups).forEach(employeeId => {
    const employeeRows = employeeGroups[employeeId]
    
    // 计算该员工的所有服务合计
    let totalTattoo = 0
    let totalPiercing = 0
    let totalElectronic = 0
    let totalAmount = 0
    
    employeeRows.forEach(row => {
      totalTattoo += row.tattooService
      totalPiercing += row.piercingService
      totalElectronic += row.electronicService
      totalAmount += row.total
    })
    
    // 添加员工的所有行
    result.push(...employeeRows)
    
    // 添加该员工的合计行
    if (employeeRows.length > 0) {
      const firstRow = employeeRows[0]
      result.push({
        id: `${firstRow.employeeId}-total`,
        employeeId: firstRow.employeeId,
        name: firstRow.name,
        shopName: '合计',
        tattooService: totalTattoo,
        piercingService: totalPiercing,
        electronicService: totalElectronic,
        total: totalAmount,
        isTotal: true // 标记为合计行
      })
    }
  })
  
  return result
}

// 计算总金额

// 查询数据
const handleSearch = async () => {
  loading.value = true
  try {
    const response = await getEmployeePerformance({
      dimension: filterData.dimension,
      dateRange: filterData.dateRange
    })
    
    if (response.code === 200) {
      const { records, total } = response.data
      if (filterData.dimension === 'employee') {
        // 处理员工数据为表格所需格式
        const employeeRecords = records as unknown as EmployeeInfo[]
        employeeData.value = processEmployeeData(employeeRecords)
      } else {
        shopData.value = records as ShopRecord[]
      }
      pagination.total = total
    } else {
      MessagePlugin.error('获取数据失败')
    }
  } catch (e) {
    MessagePlugin.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选
const handleReset = () => {
  filterData.dateRange = defaultDateRange
  filterData.dimension = 'employee'
  handleSearch()
}

// 表格变化处理
const handleTableChange = (_pag: any) => {
  handleSearch()
}

onMounted(() => {
  filterData.dateRange = defaultDateRange
  handleSearch()
})

// 自定义行类名
const employeeRowClass = ({ row }: { row: any }) => {
  return row.isTotal ? 'employee-total-row' : ''
}

// 新增的数据和方法
const shopDetailVisible = ref(false)
const currentShop = ref<ShopRecord | null>(null)

const employeeDetailColumns = [
  { colKey: 'name', title: '姓名', width: 100 },
  { 
    colKey: 'role', 
    title: '角色', 
    width: 100,
    cell: ({ row }: { row: EmployeeInfo }) => {
      const roleMap = {
        employee: '员工',
        manager: '店长',
        partner: '合伙人'
      }
      return roleMap[row.role] || row.role
    }
  },
  {
    colKey: 'salary',
    title: '薪资结构',
    width: 200,
    cell: ({ row }: { row: EmployeeInfo }) => {
      if (row.role === 'employee') {
        return `底薪 ${formatAmount(row.salary.base)} + 提成 ${row.salary.commission}%`
      } else if (row.role === 'manager') {
        return `提成 ${row.salary.commission}%`
      } else {
        return `纯利润 ${row.salary.profit}%`
      }
    }
  },
  {
    colKey: 'performance',
    title: '本月业绩',
    width: 120,
    align: 'right',
    cell: ({ row }: { row: EmployeeInfo }) => formatAmount(row.performance || 0)
  }
]



const revenueChart = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!currentShop.value || !revenueChart.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(revenueChart.value)
  const options: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        name: '收入分布',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}元\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { 
            value: currentShop.value.tattooRevenue, 
            name: '纹身收入',
            itemStyle: { color: '#0052D9' }
          },
          { 
            value: currentShop.value.piercingRevenue, 
            name: '饰品收入',
            itemStyle: { color: '#0594FA' }
          },
          { 
            value: currentShop.value.electronicRevenue, 
            name: '电子收入',
            itemStyle: { color: '#00A870' }
          }
        ]
      }
    ]
  }
  
  chartInstance.setOption(options)
}

// 监听弹窗显示状态和当前店铺变化
watch([shopDetailVisible, currentShop], ([visible]) => {
  if (visible) {
    nextTick(() => {
      initChart()
    })
  }
})

// 优化窗口大小变化处理
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

// 格式化金额
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
.employee-performance {
  padding: 16px;
}

.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  font-weight: bold;
}

.footer-label {
  margin-right: 8px;
}

.employee-total-row {
  background-color: #f5f7fa;
  font-weight: bold;
}

.revenue-chart {
  height: 400px;
  margin: 16px 0;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  padding: 16px;
}

.employee-total-row {
  background-color: var(--td-bg-color-container-hover);
  font-weight: bold;
}

.t-table__footer {
  background-color: var(--td-bg-color-container-hover);
}
</style>