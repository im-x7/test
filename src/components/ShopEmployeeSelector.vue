<template>
  <div class="shop-employee-selector">
    <t-select 
      v-model="selectedShopId" 
      :placeholder="shopPlaceholder" 
      :style="shopStyle"
      :loading="shopLoading"
      clearable
      @change="handleShopChange"
    >
      <template #prefixIcon v-if="showPrefixIcon">
        <t-icon name="shop" />
      </template>
      <t-option v-for="shop in shops" :key="shop.id" :value="shop.id" :label="shop.name" />
    </t-select>
    
    <t-select 
      v-if="showEmployee" 
      v-model="selectedEmployeeId" 
      :placeholder="employeePlaceholder"
      :style="employeeStyle"
      :loading="employeeLoading"
      :disabled="!selectedShopId"
      clearable
      class="employee-select"
      @change="handleEmployeeChange"
    >
      <template #prefixIcon v-if="showPrefixIcon">
        <t-icon name="user" />
      </template>
      <t-option 
        v-for="employee in filteredEmployees" 
        :key="employee.id" 
        :value="employee.id"
        :label="employee.name"
      />
    </t-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
// 使用相对路径导入，避免路径别名问题
import { getStoreList } from '../api/store';
import { getEmployeeList } from '../api/employee';

// 定义更完整的接口
interface Shop {
  id: string;
  name: string;
  [key: string]: any; // 允许其他属性
}

interface Employee {
  id: string;
  name: string;
  shopId: string;
  [key: string]: any; // 允许其他属性
}

// 定义API响应类型
interface ApiResponse<T> {
  code?: number;
  data: T;
  msg?: string;
}

const props = withDefaults(defineProps<{
  shopId?: string | null;
  employeeId?: string | null;
  shopLabel?: string;
  employeeLabel?: string;
  shopPlaceholder?: string;
  employeePlaceholder?: string;
  showEmployee?: boolean;
  shopStyle?: string;
  employeeStyle?: string;
  showPrefixIcon?: boolean;
  disabled?: boolean;
}>(), {
  shopId: null,
  employeeId: null,
  shopLabel: '店铺',
  employeeLabel: '员工',
  shopPlaceholder: '选择店铺',
  employeePlaceholder: '选择员工',
  showEmployee: true,
  shopStyle: 'width: 200px',
  employeeStyle: 'width: 200px',
  showPrefixIcon: false,
  disabled: false
});

const emit = defineEmits<{
  'update:shopId': [value: string | null];
  'update:employeeId': [value: string | null];
  'change': [shopId: string | null, employeeId: string | null];
}>();

// 状态管理
const shops = ref<Shop[]>([]);
const employees = ref<Employee[]>([]);
const selectedShopId = ref<string | null>(props.shopId);
const selectedEmployeeId = ref<string | null>(props.employeeId);
const shopLoading = ref<boolean>(false);
const employeeLoading = ref<boolean>(false);

// 监听外部传入的shopId变化
watch(() => props.shopId, (newValue) => {
  if (newValue !== selectedShopId.value) {
    selectedShopId.value = newValue;
  }
}, { immediate: true });

// 监听外部传入的employeeId变化
watch(() => props.employeeId, (newValue) => {
  if (newValue !== selectedEmployeeId.value) {
    selectedEmployeeId.value = newValue;
  }
}, { immediate: true });

// 处理店铺选择变化
const handleShopChange = (value: string | null) => {
  emit('update:shopId', value);
  
  if (props.showEmployee) {
    selectedEmployeeId.value = null;
    emit('update:employeeId', null);
  }
  
  emit('change', value, null);
};

// 处理员工选择变化
const handleEmployeeChange = (value: string | null) => {
  emit('update:employeeId', value);
  emit('change', selectedShopId.value, value);
};

// 获取过滤后的员工列表
const filteredEmployees = computed(() => {
  if (!selectedShopId.value) return [];
  return employees.value.filter(e => e.shopId === selectedShopId.value);
});

// 安全地解析API响应
const safeParseResponse = <T>(response: any): T[] => {
  if (!response) return [];
  
  try {
    // 处理标准响应格式 {code, data, msg}
    if (response.data) {
      if (response.data.code === 200 && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
    } else if (Array.isArray(response)) {
      return response;
    }
    
    // 如果响应本身就是数据
    if (response.code === 200 && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    return [];
  } catch (error) {
    console.error('解析响应数据失败:', error);
    return [];
  }
};

// 获取店铺列表
const fetchShops = async () => {
  if (shopLoading.value) return;
  
  shopLoading.value = true;
  try {
    const response = await getStoreList();
    shops.value = safeParseResponse<Shop>(response);
  } catch (error) {
    console.error('获取店铺列表失败:', error);
    MessagePlugin.error('获取店铺列表失败');
    shops.value = [];
  } finally {
    shopLoading.value = false;
  }
};

// 获取员工列表
const fetchEmployees = async () => {
  if (!props.showEmployee || employeeLoading.value) return;
  
  employeeLoading.value = true;
  try {
    const response = await getEmployeeList();
    employees.value = safeParseResponse<Employee>(response);
  } catch (error) {
    console.error('获取员工列表失败:', error);
    MessagePlugin.error('获取员工列表失败');
    employees.value = [];
  } finally {
    employeeLoading.value = false;
  }
};

// 初始化数据
const initData = async () => {
  try {
    await Promise.all([
      fetchShops(),
      props.showEmployee ? fetchEmployees() : Promise.resolve()
    ]);
    
    // 如果初始值无效，重置选择
    if (selectedShopId.value && !shops.value.some(shop => shop.id === selectedShopId.value)) {
      selectedShopId.value = null;
      emit('update:shopId', null);
    }
    
    if (selectedEmployeeId.value && !filteredEmployees.value.some(emp => emp.id === selectedEmployeeId.value)) {
      selectedEmployeeId.value = null;
      emit('update:employeeId', null);
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

// 组件挂载时初始化数据
onMounted(initData);
</script>

<style scoped>
.shop-employee-selector {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.employee-select {
  transition: opacity 0.3s ease;
}

:deep(.t-select) {
  width: 100%;
}

:deep(.t-form__item) {
  margin-bottom: 0;
}
</style>