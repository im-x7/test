<template>
  <div class="shop-layout">
    <t-layout>
      <!-- 头部导航 -->
      <t-header class="header">
        <div class="header-container">
          <!-- Logo区域 -->
          <div class="logo-container">
            <router-link to="/admin/finance">
              <img src="/vite.svg" alt="Logo" class="logo" />
              <span class="logo-text">收款管理系统 - 后台</span>
            </router-link>
          </div>
          
          <!-- 用户信息区域 -->
          <div class="user-info">
            <t-dropdown>
              <t-button variant="text" class="user-dropdown-btn">
                {{ userName }} <t-icon name="chevron-down" />
              </t-button>
              <template #dropdown>
                <t-dropdown-menu>
                  <t-dropdown-item>
                    <router-link to="/">返回前台</router-link>
                  </t-dropdown-item>
                  <t-dropdown-item @click="handleLogout">
                    退出登录
                  </t-dropdown-item>
                </t-dropdown-menu>
              </template>
            </t-dropdown>
          </div>
        </div>
      </t-header>
      
      <!-- 左侧菜单和右侧内容区域 -->
      <t-layout class="main-layout">
        <!-- 左侧菜单 -->
        <t-aside class="aside">
          <t-menu theme="light" :value="activeMenu" :collapsed="isCollapsed">
            <t-menu-item value="/admin/finance" to="/admin/finance">
              <template #icon><t-icon name="money" /></template>
              账款管理
            </t-menu-item>
            <t-menu-item value="/admin/payment-methods" to="/admin/payment-methods">
              <template #icon><t-icon name="wallet" /></template>
              支付方式
            </t-menu-item>
            <t-menu-item value="/admin/shop" to="/admin/shop">
              <template #icon><t-icon name="shop" /></template>
              店铺管理
            </t-menu-item>
            <t-menu-item value="/admin/user" to="/admin/user">
              <template #icon><t-icon name="user" /></template>
              用户管理
            </t-menu-item>
            <t-menu-item value="/admin/role" to="/admin/role">
              <template #icon><t-icon name="user-circle" /></template>
              角色管理
            </t-menu-item>
            <t-menu-item value="/admin/supply/expense" to="/admin/supply/expense">
              <template #icon><t-icon name="discount" /></template>
              支出管理
            </t-menu-item>
            <t-menu-item value="/admin/salaries" to="/admin/salaries">
              <template #icon><t-icon name="money" /></template>
              工资管理
            </t-menu-item>
            <t-submenu value="/admin/album">
              <template #icon><t-icon name="image" /></template>
              <template #title>相册管理</template>
              <t-menu-item value="/admin/album/all" to="/admin/album/all">
                全部相册
              </t-menu-item>
              <t-menu-item value="/admin/album/watermark" to="/admin/album/watermark">
                水印相册
              </t-menu-item>
              <t-menu-item value="/admin/album/shop" to="/admin/album/shop">
                店铺相册
              </t-menu-item>
            </t-submenu>
          </t-menu>
          <div class="collapse-btn-container">
            <t-button theme="default" variant="text" shape="square" @click="toggleCollapsed">
              <t-icon name="chevron-left" v-if="!isCollapsed" />
              <t-icon name="chevron-right" v-else />
            </t-button>
          </div>
        </t-aside>
        
        <!-- 右侧内容区域 -->
        <t-content class="content">
          <router-view />
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

// 控制左侧菜单折叠状态
const isCollapsed = ref(false);
const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 获取当前路由，用于高亮当前菜单项
const route = useRoute();
const router = useRouter();
const activeMenu = computed(() => {
  const path = route.path;
  // 处理主菜单项
  if (path.startsWith('/admin/finance')) return '/admin/finance';
  if (path.startsWith('/admin/payment-methods')) return '/admin/payment-methods';
  if (path.startsWith('/admin/shop')) return '/admin/shop';
  if (path.startsWith('/admin/user')) return '/admin/user';
  if (path.startsWith('/admin/role')) return '/admin/role';
  
  // 处理支出管理子菜单
  if (path.startsWith('/admin/supply/expense')) return '/admin/supply/expense';
  if (path.startsWith('/admin/supply/brushing')) return '/admin/supply/brushing';
  if (path.startsWith('/admin/supply/materials')) return '/admin/supply/materials';
  if (path.startsWith('/admin/supply')) return '/admin/supply';
  
  if (path.startsWith('/admin/salaries')) return '/admin/salaries';
  
  // 处理相册管理子菜单
  if (path.startsWith('/admin/album/all')) return '/admin/album/all';
  if (path.startsWith('/admin/album/watermark')) return '/admin/album/watermark';
  if (path.startsWith('/admin/album/shop')) return '/admin/album/shop';
  if (path.startsWith('/admin/album')) return '/admin/album';
  
  return '/admin/finance';
});

// 用户信息
const userName = ref('管理员');

// 获取用户名
const getUserName = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // 验证token格式
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const payload = JSON.parse(atob(parts[1]));
      if (payload && payload.username) {
        userName.value = payload.username;
      }
    } catch (error) {
      console.error('Failed to parse token:', error);
    }
  }
};

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  MessagePlugin.success('退出登录成功');
  router.push('/login');
};

// 页面加载时获取用户名
getUserName();
</script>

<style scoped>
.shop-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 60px;
  background-color: #0052d9;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 16px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-container a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.logo {
  height: 32px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.main-layout {
  margin-top: 60px;
  height: calc(100vh - 60px);
}

.aside {
  width: auto;
  border-right: 1px solid #e7e7e7;
  position: relative;
  transition: width 0.2s;
}

.aside :deep(.t-menu) {
  height: calc(100% - 40px);
  overflow-y: auto;
}

.collapse-btn-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #e7e7e7;
}

.content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown-btn {
  color: white;
}

/* 导航菜单图标和文字间距调整 */
:deep(.t-menu__item) {
  display: flex;
  align-items: center;
}

/* 子菜单选中样式 */
:deep(.t-submenu .t-menu__item.t-is-active) {
  background-color: rgba(0, 82, 217, 0.1);
  color: #0052d9;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .aside {
    position: fixed;
    z-index: 99;
    height: calc(100vh - 60px);
    background-color: white;
  }
  
  .aside.collapsed {
    width: 0;
    overflow: hidden;
  }
}
</style>
