<template>
  <div class="role-list">
    <h2>角色管理</h2>
    
    <div class="operation-bar">
      <t-button theme="primary" @click="showAddModal">新增角色</t-button>
    </div>
    
    <t-table
      :columns="columns"
      :data="roleList"
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      @page-change="handleTableChange"
      @close="modalVisible = false"
    >
      <template #permissions="{ row }">
        <div class="permission-tags-container">
          <t-tag v-for="permission in row.permissions" :key="permission" theme="primary" class="permission-tag" style="margin: 2px;">
            {{ permissionMap[permission] || permission }}
          </t-tag>
        </div>
      </template>
      <template #action="{ row }">
        <t-space>
          <t-button variant="text" @click="handleEdit(row)">编辑</t-button>
          <t-popconfirm
            content="确定要删除这个角色吗？"
            @confirm="handleDelete(row)"
            @close="modalVisible = false"
          >
            <t-button variant="text" theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    
    <!-- 新增/编辑角色弹窗 -->
    <t-dialog
      :visible="modalVisible"
      :title="modalTitle"
      width="800px"
      @confirm="handleModalOk"
      :confirm-loading="confirmLoading"
      @close="modalVisible = false"
    >
      <t-form :data="formState" :rules="rules" ref="formRef" label-width="100px">
        <t-form-item label="角色名称" name="name">
          <t-input v-model="formState.name" placeholder="请输入角色名称" />
        </t-form-item>
        <t-form-item label="角色描述" name="description">
          <t-textarea v-model="formState.description" placeholder="请输入角色描述" :rows="3" />
        </t-form-item>
        <t-form-item label="权限设置" name="permissions">
          <div class="permission-container">
            <!-- 系统管理 -->
            <div class="permission-group">
              <div class="permission-group-header" @click="toggleGroup('system')">
                <t-icon name="chevron-down" :class="{'icon-rotate': !groupVisible.system}" />
                <div class="group-title">系统管理</div>
                <t-checkbox class="group-select-all" @change="(checked: boolean) => selectGroupAll('system', checked)" :checked="isGroupAllSelected('system')" :indeterminate="isGroupIndeterminate('system')">全选</t-checkbox>
              </div>
              <transition name="fade-slide">
                <div class="permission-group-content" v-show="groupVisible.system">
                  <t-checkbox-group v-model="formState.permissions" class="permission-checkbox-group">
                    <t-row :gutter="[16, 8]">
                      <t-col :span="6" :xs="12" :sm="8" :md="6" v-for="(permission, index) in permissionGroups.system" :key="index">
                        <t-checkbox :value="permission">{{ permissionMap[permission] || permission }}</t-checkbox>
                      </t-col>
                    </t-row>
                  </t-checkbox-group>
                </div>
              </transition>
            </div>

            <!-- 财务管理 -->
            <div class="permission-group">
              <div class="permission-group-header" @click="toggleGroup('finance')">
                <t-icon name="chevron-down" :class="{'icon-rotate': !groupVisible.finance}" />
                <div class="group-title">财务管理</div>
                <t-checkbox class="group-select-all" @change="(checked: boolean) => selectGroupAll('finance', checked)" :checked="isGroupAllSelected('finance')" :indeterminate="isGroupIndeterminate('finance')">全选</t-checkbox>
              </div>
              <transition name="fade-slide">
                <div class="permission-group-content" v-show="groupVisible.finance">
                  <t-checkbox-group v-model="formState.permissions" class="permission-checkbox-group">
                    <t-row :gutter="[16, 8]">
                      <t-col :span="6" :xs="12" :sm="8" :md="6" v-for="(permission, index) in permissionGroups.finance" :key="index">
                        <t-checkbox :value="permission">{{ permissionMap[permission] || permission }}</t-checkbox>
                      </t-col>
                    </t-row>
                  </t-checkbox-group>
                </div>
              </transition>
            </div>

            <!-- 店铺管理 -->
            <div class="permission-group">
              <div class="permission-group-header" @click="toggleGroup('shop')">
                <t-icon name="chevron-down" :class="{'icon-rotate': !groupVisible.shop}" />
                <div class="group-title">店铺管理</div>
                <t-checkbox class="group-select-all" @change="(checked: boolean) => selectGroupAll('shop', checked)" :checked="isGroupAllSelected('shop')" :indeterminate="isGroupIndeterminate('shop')">全选</t-checkbox>
              </div>
              <transition name="fade-slide">
                <div class="permission-group-content" v-show="groupVisible.shop">
                  <t-checkbox-group v-model="formState.permissions" class="permission-checkbox-group">
                    <t-row :gutter="[16, 8]">
                      <t-col :span="6" :xs="12" :sm="8" :md="6" v-for="(permission, index) in permissionGroups.shop" :key="index">
                        <t-checkbox :value="permission">{{ permissionMap[permission] || permission }}</t-checkbox>
                      </t-col>
                    </t-row>
                  </t-checkbox-group>
                </div>
              </transition>
            </div>

            <!-- 工资管理 -->
            <div class="permission-group">
              <div class="permission-group-header" @click="toggleGroup('salary')">
                <t-icon name="chevron-down" :class="{'icon-rotate': !groupVisible.salary}" />
                <div class="group-title">工资管理</div>
                <t-checkbox class="group-select-all" @change="(checked: boolean) => selectGroupAll('salary', checked)" :checked="isGroupAllSelected('salary')" :indeterminate="isGroupIndeterminate('salary')">全选</t-checkbox>
              </div>
              <transition name="fade-slide">
                <div class="permission-group-content" v-show="groupVisible.salary">
                  <t-checkbox-group v-model="formState.permissions" class="permission-checkbox-group">
                    <t-row :gutter="[16, 8]">
                      <t-col :span="6" :xs="12" :sm="8" :md="6" v-for="(permission, index) in permissionGroups.salary" :key="index">
                        <t-checkbox :value="permission">{{ permissionMap[permission] || permission }}</t-checkbox>
                      </t-col>
                    </t-row>
                  </t-checkbox-group>
                </div>
              </transition>
            </div>

            <!-- 客户管理 -->
            <div class="permission-group">
              <div class="permission-group-header" @click="toggleGroup('customer')">
                <t-icon name="chevron-down" :class="{'icon-rotate': !groupVisible.customer}" />
                <div class="group-title">客户管理</div>
                <t-checkbox class="group-select-all" @change="(checked: boolean) => selectGroupAll('customer', checked)" :checked="isGroupAllSelected('customer')" :indeterminate="isGroupIndeterminate('customer')">全选</t-checkbox>
              </div>
              <transition name="fade-slide">
                <div class="permission-group-content" v-show="groupVisible.customer">
                  <t-checkbox-group v-model="formState.permissions" class="permission-checkbox-group">
                    <t-row :gutter="[16, 8]">
                      <t-col :span="6" :xs="12" :sm="8" :md="6" v-for="(permission, index) in permissionGroups.customer" :key="index">
                        <t-checkbox :value="permission">{{ permissionMap[permission] || permission }}</t-checkbox>
                      </t-col>
                    </t-row>
                  </t-checkbox-group>
                </div>
              </transition>
            </div>

            <!-- 数据统计 -->
            <div class="permission-group">
              <div class="permission-group-header" @click="toggleGroup('stats')">
                <t-icon name="chevron-down" :class="{'icon-rotate': !groupVisible.stats}" />
                <div class="group-title">数据统计</div>
                <t-checkbox class="group-select-all" @change="(checked: boolean) => selectGroupAll('stats', checked)" :checked="isGroupAllSelected('stats')" :indeterminate="isGroupIndeterminate('stats')">全选</t-checkbox>
              </div>
              <transition name="fade-slide">
                <div class="permission-group-content" v-show="groupVisible.stats">
                  <t-checkbox-group v-model="formState.permissions" class="permission-checkbox-group">
                    <t-row :gutter="[16, 8]">
                      <t-col :span="6" :xs="12" :sm="8" :md="6" v-for="(permission, index) in permissionGroups.stats" :key="index">
                        <t-checkbox :value="permission">{{ permissionMap[permission] || permission }}</t-checkbox>
                      </t-col>
                    </t-row>
                  </t-checkbox-group>
                </div>
              </transition>
            </div>
          </div>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 权限映射表
const permissionMap: Record<string, string> = {
  // 系统管理权限
  'system:user:view': '查看用户',
  'system:user:add': '添加用户',
  'system:user:edit': '编辑用户',
  'system:user:delete': '删除用户',
  'system:role:view': '查看角色',
  'system:role:manage': '管理角色',
  
  // 财务管理权限
  'finance:payment:view': '查看收款',
  'finance:payment:add': '添加收款',
  'finance:payment:edit': '编辑收款',
  'finance:payment:delete': '删除收款',
  'finance:payment:export': '导出收款',
  'finance:expense:view': '查看支出',
  'finance:expense:add': '添加支出',
  'finance:expense:edit': '编辑支出',
  'finance:expense:delete': '删除支出',
  'finance:expense:export': '导出支出',
  
  // 店铺管理权限
  'shop:view': '查看店铺',
  'shop:add': '添加店铺',
  'shop:edit': '编辑店铺',
  'shop:delete': '删除店铺',
  'shop:stats': '店铺统计',
  'shop:manage': '店铺管理',
  
  // 工资管理权限
  'salary:view': '查看工资',
  'salary:add': '添加工资',
  'salary:edit': '编辑工资',
  'salary:delete': '删除工资',
  'salary:export': '导出工资',
  'salary:manage': '工资管理',
  
  // 客户管理权限
  'customer:view': '查看客户',
  'customer:add': '添加客户',
  'customer:edit': '编辑客户',
  'customer:delete': '删除客户',
  'customer:export': '导出客户',
  
  // 数据统计权限
  'stats:overview': '总览统计',
  'stats:shop': '店铺统计',
  'stats:employee': '员工统计',
  'stats:customer': '客户统计',
  'stats:finance': '财务统计',
  
  // 后台 - 用户管理权限
  'user:view': '查看用户',
  'user:add': '添加用户',
  'user:edit': '编辑用户',
  'user:delete': '删除用户',
  
  // 后台 - 收款管理权限
  'payment:view': '查看收款',
  'payment:add': '添加收款',
  'payment:edit': '编辑收款',
  'payment:delete': '删除收款',
  
  // 后台 - 支出管理权限
  'expense:view': '查看支出',
  'expense:add': '新增支出',
  'expense:edit': '编辑支出',
  'expense:delete': '删除支出',
  'expense:manage': '支出管理',
  
  // 后台 - 账款盘点权限
  'account:view': '查看账款',
  'account:add': '新增账款',
  'account:edit': '编辑账款',
  'account:delete': '删除账款',
  'finance:view': '查看账款',
  
  // 前台 - 收款管理权限
  'frontend:payment:view': '查看收款',
  'frontend:payment:add': '添加收款',
  'frontend:payment:edit': '编辑收款',
  'frontend:payment:delete': '删除收款',
  'frontend:payment:export': '导出数据',
  
  // 前台 - 店铺管理权限
  'frontend:shop:view': '查看店铺',
  'frontend:shop:detail': '店铺详情',
  'frontend:shop:stats': '店铺统计',
};

// 权限组定义
const permissionGroups = {
  system: ['system:user:view', 'system:user:add', 'system:user:edit', 'system:user:delete', 'system:role:view', 'system:role:manage'],
  finance: ['finance:payment:view', 'finance:payment:add', 'finance:payment:edit', 'finance:payment:delete', 'finance:payment:export', 'finance:expense:view', 'finance:expense:add', 'finance:expense:edit', 'finance:expense:delete', 'finance:expense:export'],
  shop: ['shop:view', 'shop:add', 'shop:edit', 'shop:delete', 'shop:stats'],
  salary: ['salary:view', 'salary:add', 'salary:edit', 'salary:delete', 'salary:export'],
  customer: ['customer:view', 'customer:add', 'customer:edit', 'customer:delete', 'customer:export'],
  stats: ['stats:overview', 'stats:shop', 'stats:employee', 'stats:customer', 'stats:finance']
};

// 权限组展开/折叠状态
const groupVisible = reactive({
  system: true,
  finance: true,
  shop: true,
  salary: true,
  customer: true,
  stats: true
});

// 切换权限组展开/折叠状态
const toggleGroup = (group: string) => {
  groupVisible[group as keyof typeof groupVisible] = !groupVisible[group as keyof typeof groupVisible];
};

// 全选所有权限

// 取消全选所有权限

// 判断权限组是否全部选中
const isGroupAllSelected = (group: string) => {
  const groupPermissions = permissionGroups[group as keyof typeof permissionGroups] || [];
  return groupPermissions.length > 0 && groupPermissions.every(permission => formState.permissions.includes(permission));
};

// 判断权限组是否部分选中
const isGroupIndeterminate = (group: string) => {
  const groupPermissions = permissionGroups[group as keyof typeof permissionGroups] || [];
  const selectedCount = groupPermissions.filter(permission => formState.permissions.includes(permission)).length;
  return selectedCount > 0 && selectedCount < groupPermissions.length;
};

// 选择/取消选择整个权限组
const selectGroupAll = (group: string, checked?: boolean) => {
  const groupPermissions = permissionGroups[group as keyof typeof permissionGroups] || [];
  // 使用传入的 checked 参数，如果未传入则根据当前状态取反
  const isChecked = checked !== undefined ? checked : !isGroupAllSelected(group);
  
  if (isChecked) {
    // 添加组内所有权限
    const newPermissions = [...formState.permissions];
    groupPermissions.forEach(permission => {
      if (!newPermissions.includes(permission)) {
        newPermissions.push(permission);
      }
    });
    formState.permissions = newPermissions;
  } else {
    // 移除组内所有权限
    formState.permissions = formState.permissions.filter(
      permission => !groupPermissions.includes(permission)
    );
  }
};

// 角色数据类型
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

// 表单数据类型
interface FormState {
  name: string;
  description: string;
  permissions: string[];
}

// 表格列定义
const columns = [
  {
    title: '角色名称',
    colKey: 'name',
    width: 120,
  },
  {
    title: '描述',
    colKey: 'description',
    width: 200,
  },
  {
    title: '权限',
    colKey: 'permissions',
    width: 300,
    cell: 'permissions',
  },
  {
    title: '创建时间',
    colKey: 'createdAt',
    width: 160,
  },
  {
    title: '操作',
    colKey: 'action',
    width: 120,
    cell: 'action',
  },
];

// 状态定义
const loading = ref(false);
const roleList = ref<Role[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
});

// 弹窗相关状态
const modalVisible = ref(false);
const modalTitle = ref('新增角色');
const formRef = ref();
const confirmLoading = ref(false);
// 表单数据
const formState = reactive<FormState>({
  name: '',
  description: '',
  permissions: []
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入角色名称' }],
  permissions: [{ required: true, message: '请至少选择一个权限' }]
};

// 获取角色列表
const fetchRoleList = () => {
  console.log('开始获取角色列表数据');
  loading.value = true;
  
  // 模拟API请求
  setTimeout(() => {
    console.log('模拟角色列表数据返回');
    const roles = [
      {
        id: '1',
        name: '超级管理员',
        description: '拥有所有权限',
        permissions: ['user:view', 'user:add', 'user:edit', 'user:delete', 'payment:view', 'payment:add', 'payment:edit', 'payment:delete', 'shop:manage', 'expense:manage', 'finance:view'],
        createdAt: '2023-11-01 10:00:00'
      },
      {
        id: '2',
        name: '店铺管理员',
        description: '管理店铺和收款',
        permissions: ['payment:view', 'payment:add', 'payment:edit', 'shop:manage'],
        createdAt: '2023-11-02 14:30:00'
      },
      {
        id: '3',
        name: '财务人员',
        description: '查看财务数据',
        permissions: ['payment:view', 'finance:view'],
        createdAt: '2023-11-03 09:15:00'
      }
    ];
    
    console.log('角色列表数据:', roles);
    roleList.value = roles;
    console.log('角色列表组件数据已设置:', roleList.value);
    
    pagination.total = roles.length;
    console.log('角色列表总条数:', pagination.total);
    
    loading.value = false;
    console.log('角色列表加载状态:', loading.value ? '加载中' : '已完成');
  }, 500);
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchRoleList();
};

// 显示新增角色弹窗
const showAddModal = () => {
  modalTitle.value = '新增角色';
  // 重置表单
  formState.name = '';
  formState.description = '';
  formState.permissions = [];
  modalVisible.value = true;
};

// 编辑角色
const handleEdit = (record: Role) => {
  modalTitle.value = '编辑角色';
  // 填充表单
  formState.name = record.name;
  formState.description = record.description;
  formState.permissions = [...record.permissions];
  modalVisible.value = true;
};

// 删除角色
const handleDelete = (record: Role) => {
  // 模拟API请求
  MessagePlugin.success(`删除角色：${record.name}`);
  fetchRoleList();
};

// 弹窗确认
const handleModalOk = () => {
  formRef.value?.validate().then(() => {
    confirmLoading.value = true;
    // 模拟API请求
    setTimeout(() => {
      MessagePlugin.success(modalTitle.value === '新增角色' ? '新增角色成功' : '编辑角色成功');
      modalVisible.value = false;
      fetchRoleList();
      confirmLoading.value = false;
    }, 500);
  }).catch((error: any) => {
    console.log('验证失败:', error);
  });
};

onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped>
.permission-tags-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  overflow: visible;
}

.permission-tag {
  margin: 2px;
  white-space: nowrap;
}

.role-list {
  padding: 0 12px;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.permission-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  overflow: hidden;
}

.permission-group {
  margin-bottom: 0;
  border: 1px solid var(--td-component-stroke);
  border-radius: var(--td-radius-medium);
  background: var(--td-bg-color-container);
  transition: all 0.3s;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.permission-group:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border-color: var(--td-brand-color-light);
}

.permission-group-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.01);
  border-bottom: 1px solid var(--td-component-stroke);
  transition: all 0.3s;
  position: relative;
}

.permission-group-header:hover {
  background-color: rgba(var(--td-brand-color-rgb), 0.05);
}

.permission-group-header:active {
  background-color: rgba(var(--td-brand-color-rgb), 0.1);
}

.permission-group-header::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: transparent;
  transition: all 0.3s;
}

.permission-group-header:hover::after {
  background-color: var(--td-brand-color);
}

.group-title {
  font-weight: 600;
  margin: 0 12px;
  color: var(--td-text-color-primary);
  font-size: 14px;
  flex: 1;
  transition: all 0.3s;
}

.permission-group-header:hover .group-title {
  color: var(--td-brand-color);
}

.icon-rotate {
  transform: rotate(-90deg);
  transition: transform 0.3s;
  color: var(--td-text-color-secondary);
}

.group-select-all {
  margin-left: auto;
  transition: all 0.3s;
}

.permission-group-content {
  padding: 12px 16px;
  transition: all 0.3s;
  background-color: var(--td-bg-color-container);
  border-radius: 0 0 var(--td-radius-medium) var(--td-radius-medium);
  overflow: hidden;
}

.permission-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  width: 100%;
}

:deep(.t-checkbox) {
  margin-right: 0;
  transition: all 0.2s;
  white-space: normal;
  line-height: 1.5;
  padding: 4px 0;
}

:deep(.t-checkbox:hover) {
  color: var(--td-brand-color);
}

:deep(.t-checkbox__label) {
  font-size: 13px;
  transition: all 0.2s;
  word-break: break-word;
  white-space: normal;
  line-height: 1.5;
}

:deep(.t-form__item) {
  margin-bottom: 24px;
}

:deep(.t-form__label) {
  font-weight: 600;
}

:deep(.t-row) {
  margin-bottom: -4px;
  flex-wrap: wrap;
  width: 100%;
}

:deep(.t-col) {
  margin-bottom: 4px;
  overflow: hidden;
}

/* 动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  overflow: hidden;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  :deep(.t-col) {
    width: 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>