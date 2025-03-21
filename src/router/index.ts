import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'; 
import SalaryForm from '@/views/admin/salaries/index.vue';
import PaymentAdd from '@/views/payment/PaymentAdd.vue';
import PaymentList from '@/views/payment/PaymentList.vue';
import PaymentMethodList from '@/views/admin/payment/PaymentMethodList.vue';
import EmployeeDetail from '@/views/employee/EmployeeDetail.vue';
import Login from '@/views/Login.vue';
import NewOrderFlow from '@/views/order/NewOrderFlow.vue';
import WatermarkAlbumManage from '@/views/admin/watermarkAlbum/WatermarkAlbumManage.vue';
import ShopDetail from '@/views/shop/ShopDetail.vue';

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'Home', 
        component: Home,
        meta: { 
          title: '首页',
          keepAlive: true 
        }
      },
      { path: 'payment/list', name: 'PaymentList', component: PaymentList },
      { path: 'payment/add', name: 'PaymentAdd', component: PaymentAdd },
      { 
        path: 'customer/list', 
        name: 'CustomerList', 
        component: () => import('@/views/customer/CustomerList.vue'),
        meta: { keepAlive: false }
      },
      { path: 'customer/add', name: 'CustomerAdd', component: () => import('@/views/customer/CustomerAdd.vue') },
      { path: 'customer/edit/:id', name: 'CustomerEdit', component: () => import('@/views/customer/CustomerEdit.vue'), props: true },
      { path: 'employee/:employeeId', name: 'EmployeeDetail', component: EmployeeDetail, props: true },
      { path: 'order/create', name: 'NewOrderFlow', component: NewOrderFlow },
      { path: 'shop/:shopId', name: 'ShopDetail', component: ShopDetail, props: true },
      { path: 'shop/supply/brushing', name: 'ShopBrushingList', component: () => import('@/views/shop/supply/BrushingList.vue') },
      { path: 'shop/supply/brushing/add', name: 'ShopBrushingAdd', component: () => import('@/views/shop/supply/BrushingAdd.vue') },
      { path: 'shop/supply/brushing/edit/:id', name: 'ShopBrushingEdit', component: () => import('@/views/shop/supply/BrushingEdit.vue') },
      { path: 'shop/supply/materials', name: 'ShopMaterialsList', component: () => import('@/views/shop/supply/MaterialsList.vue') },
      { path: 'shop/supply/materials/add', name: 'ShopMaterialsAdd', component: () => import('@/views/shop/supply/MaterialsAdd.vue') }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/views/ShopLayout.vue'),
    children: [
      { path: '', redirect: '/admin/finance' },
      { path: 'finance', name: 'FinanceList', component: () => import('@/views/admin/finance/FinanceList.vue') },
      { path: 'finance/employee-performance', name: 'EmployeePerformance', component: () => import('@/views/admin/finance/EmployeePerformance.vue') },
      { path: 'payment-methods', name: 'PaymentMethodList', component: PaymentMethodList },
      { path: 'shop', name: 'ShopList', component: () => import('@/views/admin/shop/ShopList.vue') },
      { path: 'user', name: 'UserList', component: () => import('@/views/admin/user/UserList.vue') },
      { path: 'role', name: 'RoleList', component: () => import('@/views/admin/role/RoleList.vue') },
      { path: 'supply', redirect: '/admin/supply/expense' },
      { path: 'supply/expense', name: 'ExpenseList', component: () => import('@/views/admin/supply/ExpenseList.vue') },
      { path: 'salaries', name: 'SalaryList', component: SalaryForm },
      { path: 'salaries/create', name: 'SalaryCreate', component: SalaryForm },
      { path: 'watermark-album', name: 'WatermarkAlbumManage', component: WatermarkAlbumManage },
      { path: 'album', redirect: '/admin/album/all' },
      { path: 'album/all', name: 'AllAlbumList', component: () => import('@/views/admin/album/AlbumList.vue') },
      { path: 'album/watermark', name: 'WatermarkAlbum', component: () => import('@/views/admin/album/WatermarkAlbum.vue') },
      { path: 'album/shop', name: 'ShopAlbum', component: () => import('@/views/admin/album/ShopAlbum.vue') }
    ]
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加路由错误处理
router.onError((error) => {
  console.error('[路由错误]', error);
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    console.error('[动态导入模块失败]', error.message);
  }
});

// 添加全局路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const isLoginPage = to.path === '/login';

  // 如果是登录页面
  if (isLoginPage) {
    // 已登录则跳转到首页
    if (token) {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      next(isAdmin ? '/admin/finance' : '/');
    } else {
      next();
    }
    return;
  }

  // 非登录页面，检查是否已登录
  if (!token) {
    next('/login');
    return;
  }

  // 检查管理员权限
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isAdminRoute = to.path.startsWith('/admin');

  if (isAdminRoute && !isAdmin) {
    next('/');
    return;
  }

  next();
});

export default router;