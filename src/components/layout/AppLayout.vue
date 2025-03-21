<template>
  <div class="app-layout">
    <!-- 导航条 -->
    <t-layout>
      <!-- 头部导航 -->
      <t-header class="header">
        <t-head-menu theme="dark" :value="activeMenu" v-model:expanded="isExpanded">
          <!-- Logo区域 -->
          <template #logo>
            <div class="logo-container">
              <router-link to="/">
                <img src="/vite.svg" alt="Logo" class="logo" />
                <span class="logo-text">收款管理系统</span>
              </router-link>
            </div>
          </template>
          
          <!-- 桌面端菜单 -->
          <template #default>
            <t-menu-item value="/" to="/">
              <template #icon><t-icon name="home" /></template>
              首页
            </t-menu-item>
            <t-menu-item value="/payment" to="/payment/list">
              <template #icon><t-icon name="money" /></template>
              收款管理
            </t-menu-item>
            <t-menu-item value="/customer" to="/customer/list">
              <template #icon><t-icon name="user" /></template>
              客户管理
            </t-menu-item>
            <t-menu-item value="/shop/supply/brushing" to="/shop/supply/brushing">
              <template #icon><t-icon name="shop" /></template>
              刷单记录
            </t-menu-item>
            <t-menu-item value="/shop/supply/materials" to="/shop/supply/materials">
              <template #icon><t-icon name="chart" /></template>
              耗材支出
            </t-menu-item>
          </template>
          
          <!-- 移动端菜单按钮和用户信息区域 -->
          <template #operations>
            <div class="operations">
              <t-button theme="default" variant="text" shape="square" @click="toggleExpanded">
                <t-icon name="menu-fold" v-if="isExpanded" />
                <t-icon name="menu-unfold" v-else />
              </t-button>
            </div>
            
            <!-- 用户信息区域 -->
            <div class="user-info">
              <t-dropdown>
                <t-button variant="text" class="user-dropdown-btn">
                  {{ userName }} <t-icon name="chevron-down" />
                </t-button>
                <template #dropdown>
                  <t-dropdown-menu>
                    <t-dropdown-item v-if="isAdmin">
                      <router-link to="/admin/finance">进入后台</router-link>
                    </t-dropdown-item>
                    <t-dropdown-item @click="handleLogout">
                      退出登录
                    </t-dropdown-item>
                  </t-dropdown-menu>
                </template>
              </t-dropdown>
            </div>
          </template>
        </t-head-menu>
      </t-header>
      
      <!-- 内容区域 -->
      <t-content class="content">
        <router-view />
      </t-content>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

// 控制移动端菜单展开状态
const isExpanded = ref<string[]>([]);
const toggleExpanded = () => {
  isExpanded.value = isExpanded.value.length ? [] : ['0'];
};

// 获取当前路由，用于高亮当前菜单项
const route = useRoute();
const router = useRouter();
const activeMenu = computed(() => {
  const path = route.path;
  if (path.startsWith('/payment')) return '/payment';
  if (path.startsWith('/customer')) return '/customer';
  if (path.startsWith('/shop/supply/brushing')) return '/shop/supply/brushing';
  if (path.startsWith('/shop/supply/materials')) return '/shop/supply/materials';
  return '/';
});

// 用户信息
const userName = ref('用户');
const isAdmin = computed(() => localStorage.getItem('isAdmin') === 'true');

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
.app-layout {
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
  height: 56px;
  background-color: var(--td-brand-color);
}

:deep(.t-head-menu) {
  height: 56px;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  min-width: 200px;
}

.logo-container a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.logo {
  height: 28px;
  margin-right: 12px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.content {
  margin-top: 56px;
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
  background-color: var(--td-bg-color-page);
}

/* 导航菜单样式优化 */
:deep(.t-menu__item) {
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 8px;
  height: 56px;
  font-size: 15px;
}

:deep(.t-menu__item .t-icon) {
  font-size: 18px;
}

/* 用户信息区域样式 */
.user-info {
  margin: 0 24px;
}

.user-dropdown-btn {
  height: 56px;
  color: white;
  font-size: 15px;
  padding: 0 4px;
}

:deep(.t-button.t-button--text:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }

  .logo-container {
    padding: 0 16px;
    min-width: 160px;
  }

  .logo {
    height: 28px;
    margin-right: 8px;
  }

  .logo-text {
    font-size: 16px;
  }

  :deep(.t-menu__item) {
    padding: 0 16px;
    font-size: 14px;
  }

  .user-info {
    margin: 0 16px;
  }

  .user-dropdown-btn {
    font-size: 14px;
  }
}
</style>