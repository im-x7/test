<template>
  <div class="user-list">
    <h2>用户管理</h2>
    
    <div class="operation-bar">
      <t-button theme="primary" @click="showAddModal">新增用户</t-button>
    </div>
    
    <t-table 
      :columns="columns" 
      :data="tableData" 
      :loading="loading"
      row-key="id"
      :pagination="pagination"
      @page-change="handleTableChange"
    >
      <template #status="{ row }">
        <t-tag :theme="row.status === '启用' ? 'success' : 'danger'" variant="light">
          {{ row.status }}
        </t-tag>
      </template>
      <template #role="{ row }">
        <t-space wrap>
          <t-tag
            v-for="shop in row.shops"
            :key="shop.id"
            :theme="getRoleTheme(shop.role)"
          >
            {{ getRoleName(shop.role) }}
          </t-tag>
        </t-space>
      </template>
      <template #isReceptionist="{ row }">
        <t-tag :theme="row.isReceptionist ? 'success' : 'default'" variant="light">
          {{ row.isReceptionist ? '是' : '否' }}
        </t-tag>
        <span v-if="row.isReceptionist" class="reception-fee">
          ({{ row.receptionFee }}元)
        </span>
      </template>
      <template #shops="{ row }">
        <t-space wrap>
          <t-tag
            v-for="shop in row.shops"
            :key="shop.id"
            theme="primary"
            variant="light"
          >
            {{ shop.name }}
          </t-tag>
        </t-space>
      </template>
      <template #salary="{ row }">
        <t-space direction="vertical" size="small">
          <div v-if="row.salary">
            <span>基本工资：{{ row.salary.base }}</span>
            <span>提成：{{ row.salary.commission }}%</span>
            <span>奖金：{{ row.salary.bonus }}</span>
          </div>
          <div v-for="shop in row.shops" :key="shop.id">
            <span>{{ shop.name }}：</span>
            <span v-if="shop.role === 'employee'">
              底薪 {{ shop.salary.base }} + 提成 {{ shop.salary.commission }}%
            </span>
            <span v-else-if="shop.role === 'manager'">
              提成 {{ shop.salary.commission }}%
            </span>
            <span v-else-if="shop.role === 'partner'">
              纯利润 {{ shop.salary.profit }}%
            </span>
          </div>
        </t-space>
      </template>
      <template #systemRole="{ row }">
        <t-tag :theme="getSystemRoleTheme(row.systemRole)">
          {{ row.systemRole }}
        </t-tag>
      </template>
      <template #action="{ row }">
        <t-space>
          <t-button theme="primary" variant="text" @click="handleEdit(row)">编辑</t-button>
          <t-button 
            theme="primary" 
            variant="text" 
            @click="handleToggleStatus(row)"
          >
            {{ row.status === '启用' ? '禁用' : '启用' }}
          </t-button>
        </t-space>
      </template>
    </t-table>
    
    <!-- 新增/编辑用户弹窗 -->
    <t-dialog
      :visible="modalVisible"
      :title="modalTitle"
      width="800px"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
      @close="handleModalCancel"
    >
      <user-form ref="userFormRef" :user-data="currentUser" />
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import UserForm from './UserForm.vue';
import { getUserList, updateUserStatus, type User, type UserData } from '@/api/user';

// 表格列定义
const columns = [
  {
    colKey: 'name',
    title: '姓名',
    width: 120,
  },
  {
    colKey: 'phone',
    title: '联系电话',
    width: 150,
  },
  {
    colKey: 'systemRole',
    title: '系统角色',
    width: 100,
    cell: 'systemRole',
  },
  {
    colKey: 'role',
    title: '店铺角色',
    width: 100,
    cell: 'role',
  },
  {
    colKey: 'isReceptionist',
    title: '接待员',
    width: 100,
    cell: 'isReceptionist',
  },
  {
    colKey: 'shops',
    title: '所属店铺',
    width: 200,
    cell: 'shops',
  },
  {
    colKey: 'salary',
    title: '工资结构',
    width: 300,
    cell: 'salary',
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: 'status',
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
const loading = ref(false);
const tableData = ref<User[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('新增用户');
const userFormRef = ref();
const currentUser = ref<UserData | null>(null);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`
});

// 获取角色主题色
const getRoleTheme = (role: string) => {
  const themes: Record<string, string> = {
    employee: 'primary',
    manager: 'warning',
    partner: 'success'
  };
  return themes[role] || 'default';
};

// 获取角色名称
const getRoleName = (role: string) => {
  const names: Record<string, string> = {
    employee: '员工',
    manager: '店长',
    partner: '股东'
  };
  return names[role] || role;
};

// 获取系统角色主题色
const getSystemRoleTheme = (role: string) => {
  const themes: Record<string, string> = {
    '系统管理员': 'danger',
    '店长': 'warning',
    '员工': 'primary'
  };
  return themes[role] || 'default';
};

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const response = await getUserList({
      current: pagination.current,
      pageSize: pagination.pageSize
    });
    
    console.log('API响应:', response);
    
    if (!response || !response.items) {
      throw new Error('Invalid response format');
    }
    
    tableData.value = response.items.map(user => ({
      ...user,
      shops: user.shops || [],
      salary: user.salary || {
        base: 0,
        commission: 0,
        bonus: 0
      }
    }));
    
    pagination.total = response.total;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    MessagePlugin.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 显示新增用户弹窗
const showAddModal = () => {
  currentUser.value = null;
  modalTitle.value = '新增用户';
  modalVisible.value = true;
};

// 编辑用户
const handleEdit = (record: User) => {
  const convertedUser: UserData = {
    id: record.id,
    username: record.username,
    name: record.name,
    phone: record.phone,
    email: record.email,
    systemRole: record.systemRole,
    status: record.status,
    remark: record.remark,
    isReceptionist: record.isReceptionist || false,
    receptionFee: record.receptionFee || 0,
    shops: record.shops || [],
    salary: record.salary || {
      base: 0,
      commission: 0,
      bonus: 0
    }
  };
  currentUser.value = convertedUser;
  modalTitle.value = '编辑用户';
  modalVisible.value = true;
};

// 切换用户状态
const handleToggleStatus = async (record: User) => {
  try {
    const newStatus = record.status === '启用' ? '禁用' : '启用';
    await updateUserStatus(record.id, newStatus);
    MessagePlugin.success(`${record.name}已${newStatus === '启用' ? '启用' : '禁用'}`);
    fetchUserList();
  } catch (error) {
    console.error('更新用户状态失败:', error);
    MessagePlugin.error('操作失败');
  }
};

// 弹窗确认
const handleModalConfirm = async () => {
  try {
    await userFormRef.value?.submit();
    modalVisible.value = false;
    MessagePlugin.success('保存成功');
    fetchUserList();
  } catch (error) {
    console.error('保存用户失败:', error);
    MessagePlugin.error('保存失败');
  }
};

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
  currentUser.value = null;
};

// 表格变化处理
const handleTableChange = (pag: { current: number; pageSize: number }) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.user-list {
  padding: 0 12px;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>