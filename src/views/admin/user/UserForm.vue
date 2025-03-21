<template>
  <div class="user-form">
    <t-form
      ref="formRef"
      :data="formData"
      :rules="rules"
      label-width="100px"
      @submit="submit"
      @reset="reset"
    >
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <div class="form-row">
          <t-form-item label="姓名" name="name">
            <t-input v-model="formData.name" placeholder="请输入姓名" />
          </t-form-item>

          <t-form-item label="联系电话" name="phone">
            <t-input v-model="formData.phone" placeholder="请输入联系电话" />
          </t-form-item>
        </div>

        <div class="form-row">
          <t-form-item label="系统角色" name="systemRole">
            <t-select
              v-model="formData.systemRole"
              :options="systemRoleOptions"
              placeholder="请选择系统角色"
              :loading="loadingSystemRoles"
            />
          </t-form-item>

          <t-form-item label="电话客服" name="isReceptionist">
            <t-switch v-model="formData.isReceptionist" />
          </t-form-item>
        </div>

        <div class="form-row">
          <t-form-item 
            v-if="formData.isReceptionist" 
            label="接待费" 
            name="receptionFee"
          >
            <t-input-number 
              v-model="formData.receptionFee" 
              :min="0" 
              placeholder="请输入接待费" 
            />
          </t-form-item>
        </div>

        <t-form-item label="备注" name="remark">
          <t-textarea v-model="formData.remark" :rows="2" placeholder="请输入备注信息" />
        </t-form-item>
      </div>

      <div class="form-section">
        <div class="section-title">店铺设置</div>
        <t-form-item label="所属店铺" name="shops">
          <t-select
            v-model="selectedShopIds"
            :options="shopOptions"
            multiple
            placeholder="请选择所属店铺"
            :loading="loading"
            @change="handleShopChange"
          />
        </t-form-item>

        <div v-if="formData.shops.length > 0" class="shop-roles-container">
          <t-tabs v-model="activeShopId" class="shop-tabs">
            <t-tab-panel 
              v-for="(shop, index) in formData.shops" 
              :key="shop.id" 
              :value="shop.id.toString()"
              :label="shop.name"
            >
              <div class="shop-role-content">
                <t-form-item label="角色" :name="`shops.${index}.role`">
                  <t-select v-model="shop.role" :options="roleOptions" placeholder="请选择角色" />
                </t-form-item>

                <div class="salary-settings">
                  <template v-if="shop.role === 'employee'">
                    <t-form-item :label="'底薪'" :name="`shops.${index}.salary.base`">
                      <t-input-number v-model="shop.salary.base" :min="0" placeholder="请输入底薪" />
                    </t-form-item>
                    <div class="commission-section">
                      <div class="commission-title">服务提成比例</div>
                      <t-form-item :label="'纹身服务'" :name="`shops.${index}.salary.tattooCommission`">
                        <t-input-number v-model="shop.salary.tattooCommission" :min="0" :max="100" placeholder="请输入纹身服务提成比例" />
                      </t-form-item>
                      <t-form-item :label="'饰品服务'" :name="`shops.${index}.salary.piercingCommission`">
                        <t-input-number v-model="shop.salary.piercingCommission" :min="0" :max="100" placeholder="请输入饰品服务提成比例" />
                      </t-form-item>
                      <t-form-item :label="'电子服务'" :name="`shops.${index}.salary.electronicCommission`">
                        <t-input-number v-model="shop.salary.electronicCommission" :min="0" :max="100" placeholder="请输入电子服务提成比例" />
                      </t-form-item>
                    </div>
                  </template>
                  <template v-else-if="shop.role === 'manager'">
                    <div class="commission-section">
                      <div class="commission-title">服务提成比例</div>
                      <t-form-item :label="'纹身服务'" :name="`shops.${index}.salary.tattooCommission`">
                        <t-input-number v-model="shop.salary.tattooCommission" :min="0" :max="100" placeholder="请输入纹身服务提成比例" />
                      </t-form-item>
                      <t-form-item :label="'饰品服务'" :name="`shops.${index}.salary.piercingCommission`">
                        <t-input-number v-model="shop.salary.piercingCommission" :min="0" :max="100" placeholder="请输入饰品服务提成比例" />
                      </t-form-item>
                      <t-form-item :label="'电子服务'" :name="`shops.${index}.salary.electronicCommission`">
                        <t-input-number v-model="shop.salary.electronicCommission" :min="0" :max="100" placeholder="请输入电子服务提成比例" />
                      </t-form-item>
                    </div>
                  </template>
                  <template v-else-if="shop.role === 'partner'">
                    <t-form-item :label="'利润比例'" :name="`shops.${index}.salary.profit`">
                      <t-input-number v-model="shop.salary.profit" :min="0" :max="100" placeholder="请输入利润比例" />
                    </t-form-item>
                  </template>
                </div>
              </div>
            </t-tab-panel>
          </t-tabs>
        </div>
      </div>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { FormInstanceFunctions } from 'tdesign-vue-next/es/form/type'
import { useStores } from '../../../hooks/useStores'
import { MessagePlugin } from 'tdesign-vue-next'
import { getSystemRoles, getStoreList, createUser, updateUser, type ShopRole, type UserData } from '@/api/user'

interface Store {
  id: string;
  name: string;
}

const props = defineProps<{
  userData?: UserData | null;
}>();

const emit = defineEmits<{
  (e: 'submit', data: UserData): void;
}>();

const formRef = ref<FormInstanceFunctions>()
const { stores, loading, fetchStores } = useStores()
const activeShopId = ref('')
const selectedShopIds = ref<string[]>([])

// 店铺列表
const storeList = ref<Array<{ id: string; name: string }>>([])

// 系统角色选项
const systemRoleOptions = ref<Array<{ label: string; value: string }>>([])
const loadingSystemRoles = ref(false)

// 获取系统角色列表
const fetchSystemRoles = async () => {
  loadingSystemRoles.value = true
  try {
    const { data } = await getSystemRoles()
    systemRoleOptions.value = data
  } catch (error) {
    console.error('获取系统角色列表失败:', error)
    MessagePlugin.error('获取系统角色列表失败')
  } finally {
    loadingSystemRoles.value = false
  }
}

// 获取店铺列表
const fetchStoreList = async () => {
  try {
    const data = await getStoreList();
    storeList.value = data;
  } catch (error) {
    console.error('获取店铺列表失败:', error);
    MessagePlugin.error('获取店铺列表失败');
  }
}

// 店铺选项
const shopOptions = computed(() => {
  if (!stores.value) return []
  return (stores.value as Store[]).map(store => ({
    label: store.name,
    value: store.id
  }))
})

// 角色选项
const roleOptions = [
  { label: '员工', value: 'employee' },
  { label: '店长', value: 'manager' },
  { label: '股东', value: 'partner' }
]

const formData = reactive<UserData>({
  username: '',
  name: '',
  phone: '',
  email: '',
  systemRole: '',
  status: '启用',
  remark: '',
  isReceptionist: false,
  receptionFee: 0,
  shops: [],
  salary: {
    base: 0,
    commission: 0,
    bonus: 0
  }
})

// 重置表单
const reset = () => {
  formRef.value?.reset()
  Object.assign(formData, {
    username: '',
    name: '',
    phone: '',
    email: '',
    systemRole: '',
    status: '启用',
    remark: '',
    isReceptionist: false,
    receptionFee: 0,
    shops: [],
    salary: {
      base: 0,
      commission: 0,
      bonus: 0
    }
  })
}

// 提交表单
const submit = async () => {
  try {
    await formRef.value?.validate()
    if (props.userData?.id) {
      await updateUser(props.userData.id, formData)
    } else {
      await createUser(formData)
    }
    emit('submit', formData)
  } catch (error) {
    console.error('保存用户失败:', error)
    MessagePlugin.error('保存失败')
    throw error
  }
}

// 修复角色类型错误
const updateShopSalary = (shop: ShopRole, currentSalary: ShopRole['salary']): ShopRole['salary'] => {
  return {
    base: shop.role === 'employee' ? (currentSalary.base || 0) : 0,
    commission: ['employee', 'manager'].includes(shop.role) ? (currentSalary.commission || 0) : 0,
    profit: shop.role === 'partner' ? (currentSalary.profit || 0) : 0,
    tattooCommission: currentSalary.tattooCommission || 0,
    piercingCommission: currentSalary.piercingCommission || 0,
    electronicCommission: currentSalary.electronicCommission || 0
  }
}

// 处理店铺选择变化
const handleShopChange = (value: string[]) => {
  selectedShopIds.value = value;
  // 将店铺ID转换为完整的店铺对象
  const updatedShops = value.map(shopId => {
    const shop = stores.value?.find(s => s.id === shopId);
    if (!shop) return null;
    const newShop: ShopRole = {
      id: shopId,
      name: shop.name,
      role: 'employee',
      salary: {
        base: 0,
        commission: 0,
        profit: 0,
        tattooCommission: 0,
        piercingCommission: 0,
        electronicCommission: 0
      }
    };
    return newShop;
  }).filter((shop): shop is ShopRole => shop !== null);
  
  formData.shops = updatedShops;
  
  // 设置默认激活的店铺
  if (formData.shops.length > 0 && !activeShopId.value) {
    activeShopId.value = formData.shops[0].id;
  }
};

// 监听 props 变化，初始化表单数据
watch(() => props.userData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal);
    selectedShopIds.value = newVal.shops.map(shop => shop.id);
  } else {
    reset();
  }
}, { immediate: true });

// 监听店铺选择变化，初始化角色设置
watch(() => formData.shops, (newShops) => {
  // 只在店铺列表发生变化时更新
  if (newShops.length !== formData.shops.length) {
    // 将店铺ID转换为完整的店铺对象
    const updatedShops = newShops.map(shopId => {
      const shop = stores.value?.find(s => s.id === shopId.toString());
      if (!shop) return null;
      const newShop: ShopRole = {
        id: shop.id,
        name: shop.name,
        role: 'employee',
        salary: {
          base: 0,
          commission: 0,
          profit: 0,
          tattooCommission: 0,
          piercingCommission: 0,
          electronicCommission: 0
        }
      };
      return newShop;
    }).filter((shop): shop is ShopRole => shop !== null);
    
    formData.shops = updatedShops;
    
    // 设置默认激活的店铺
    if (formData.shops.length > 0 && !activeShopId.value) {
      activeShopId.value = formData.shops[0].id;
    }
  }
}, { immediate: true });

// 监听每个店铺的角色变化，重置工资设置
watch(() => formData.shops, (newShops) => {
  newShops.forEach(shop => {
    const currentSalary = shop.salary;
    const newSalary = updateShopSalary(shop, currentSalary);
    
    // 只在值真正改变时才更新
    if (JSON.stringify(currentSalary) !== JSON.stringify(newSalary)) {
      shop.salary = newSalary;
    }
  });
}, { deep: true });

// 动态生成店铺相关的验证规则
const generateShopRules = (shopId: string) => {
  return {
    [`shops.${shopId}.role`]: [{ required: true, message: '请选择角色' }],
    [`shops.${shopId}.salary.base`]: [{ 
      required: true, 
      message: '请输入底薪',
      validator: (val: any, context: any) => {
        return context.form.shops[shopId].role === 'employee' ? !!val : true
      }
    }],
    [`shops.${shopId}.salary.commission`]: [{ 
      required: true, 
      message: '请输入提成比例',
      validator: (val: any, context: any) => {
        return ['employee', 'manager'].includes(context.form.shops[shopId].role) ? !!val : true
      }
    }],
    [`shops.${shopId}.salary.profit`]: [{ 
      required: true, 
      message: '请输入利润比例',
      validator: (val: any, context: any) => {
        return context.form.shops[shopId].role === 'partner' ? !!val : true
      }
    }],
    [`shops.${shopId}.salary.tattooCommission`]: [{ 
      required: false, 
      message: '请输入纹身服务提成比例'
    }],
    [`shops.${shopId}.salary.piercingCommission`]: [{ 
      required: false, 
      message: '请输入饰品服务提成比例'
    }],
    [`shops.${shopId}.salary.electronicCommission`]: [{ 
      required: false, 
      message: '请输入电子服务提成比例'
    }]
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  name: [{ required: true, message: '请输入姓名' }],
  phone: [{ required: true, message: '请输入手机号' }],
  email: [{ required: true, message: '请输入邮箱' }],
  systemRole: [{ required: true, message: '请选择系统角色' }],
  status: [{ required: true, message: '请选择状态' }],
  shops: [{ required: true, message: '请至少选择一个店铺' }],
  receptionFee: [{ 
    required: true, 
    message: '请输入接待费',
    validator: (val: any) => {
      return !formData.isReceptionist || (val !== undefined && val >= 0)
    }
  }]
}

// 监听店铺选择变化，更新验证规则
watch(() => formData.shops, (newShops) => {
  newShops.forEach(shop => {
    Object.assign(rules, generateShopRules(shop.id))
  })
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  submit,
  reset
});

// 添加店铺
const handleAddShop = () => {
  formData.shops.push({
    id: '',
    name: '',
    role: 'employee',
    salary: {
      base: 0,
      commission: 0,
      profit: 0,
      tattooCommission: 0,
      piercingCommission: 0,
      electronicCommission: 0
    }
  });
};

// 删除店铺
const handleRemoveShop = (index: number) => {
  formData.shops.splice(index, 1);
};

onMounted(() => {
  fetchStoreList();
  fetchSystemRoles();
});
</script>

<style scoped>
.user-form {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--td-component-stroke);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.shop-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.shop-roles-container {
  margin-top: 16px;
}

.shop-tabs {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
}

.shop-role-content {
  padding: 16px;
}

.role-radio-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.salary-settings {
  background: var(--td-bg-color-container-hover);
  padding: 16px;
  border-radius: var(--td-radius-small);
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

:deep(.t-tabs__nav) {
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium) var(--td-radius-medium) 0 0;
  padding: 8px 8px 0;
}

:deep(.t-tabs__content) {
  background: var(--td-bg-color-container);
  border-radius: 0 0 var(--td-radius-medium) var(--td-radius-medium);
}

:deep(.t-radio-button) {
  min-width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:deep(.t-radio-button__icon) {
  font-size: 18px;
}

:deep(.t-radio-button__label) {
  font-size: 14px;
}

.commission-section {
  margin-top: 16px;
  padding: 16px;
  background: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-small);
}

.commission-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--td-component-stroke);
}
</style> 