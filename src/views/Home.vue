<template>
  <t-loading :loading="loading">
    <div class="home">
      <div class="header">
        <h2>店铺收款概览</h2>
        <t-button theme="primary" @click="goToCreateService">
          <template #icon><t-icon name="plus" /></template>
          创建服务
        </t-button>
      </div>
      <t-row :gutter="16">
        <t-col :span="4" v-for="shop in shops" :key="shop.id">
          <t-card :title="shop.name" :bordered="false" :hover="true">
            <div class="shop-stats">
              <div class="stat-item">
                <span class="label">当月收款总额</span>
                <span class="value">¥{{ shop.monthlyTotal.toFixed(2) }}</span>
                <span class="trend" :class="shop.growth >= 0 ? 'up' : 'down'">
                  {{ shop.growth >= 0 ? '+' : '' }}{{ shop.growth }}%
                  <t-icon :name="shop.growth >= 0 ? 'trending-up' : 'trending-down'" />
                </span>
              </div>
              <div class="stat-item">
                <span class="label">当月订单数</span>
                <span class="value">{{ shop.orderCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均客单价</span>
                <span class="value">¥{{ (shop.monthlyTotal / (shop.orderCount || 1)).toFixed(2) }}</span>
              </div>
            </div>
            <div class="shop-actions">
              <t-button theme="primary" variant="text" @click="goToEmployeeList(shop.id)">查看员工收款</t-button>
            </div>
          </t-card>
        </t-col>
      </t-row>
    </div>
  </t-loading>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button as TButton,
  Card as TCard,
  Row as TRow,
  Col as TCol,
  Icon as TIcon,
  Loading as TLoading,
  MessagePlugin,
} from 'tdesign-vue-next';

// 定义店铺数据类型
interface Shop {
  id: number;
  name: string;
  monthlyTotal: number;
  orderCount: number;
  growth: number;
  status: string;
}

const router = useRouter();
const shops = ref<Shop[]>([]);
const loading = ref(false);

onMounted(async () => {
  console.log('Home组件开始挂载');
  loading.value = true;
  
  try {
    console.log('开始初始化数据');
    await fetchShopData();
    console.log('店铺数据加载完成');
  } catch (error) {
    console.error('数据初始化失败:', error);
    MessagePlugin.error('数据加载失败，请刷新页面重试');
  } finally {
    loading.value = false;
    console.log('所有数据加载完成，loading状态:', loading.value);
  }
});

// 获取店铺数据
const fetchShopData = async () => {
  console.log('开始获取店铺数据');
  loading.value = true;
  try {
    // 使用模拟数据
    const mockShops = [
      {
        id: 1,
        name: '总店',
        monthlyTotal: 128500.50,
        orderCount: 385,
        growth: 12.5,
        status: 'active'
      },
      {
        id: 2,
        name: '北京店',
        monthlyTotal: 89600.75,
        orderCount: 246,
        growth: -5.2,
        status: 'active'
      },
      {
        id: 3,
        name: '上海店',
        monthlyTotal: 156800.25,
        orderCount: 421,
        growth: 8.7,
        status: 'active'
      },
      {
        id: 4,
        name: '广州店',
        monthlyTotal: 98750.80,
        orderCount: 298,
        growth: 15.8,
        status: 'active'
      },
      {
        id: 5,
        name: '深圳店',
        monthlyTotal: 112300.60,
        orderCount: 342,
        growth: 6.3,
        status: 'active'
      },
      {
        id: 6,
        name: '杭州店',
        monthlyTotal: 78900.40,
        orderCount: 215,
        growth: -2.8,
        status: 'active'
      }
    ];
    shops.value = mockShops;
    console.log('店铺数据加载成功:', shops.value);
  } catch (error) {
    console.error('获取店铺数据失败:', error);
    MessagePlugin.error('获取店铺数据失败');
  } finally {
    loading.value = false;
  }
};

// 跳转到员工列表
const goToEmployeeList = (shopId: number) => {
  router.push(`/shop/${shopId}`);
};

// 跳转到新建订单页面
const goToCreateService = () => {
  router.push('/order/create');
};
</script>

<style scoped>
.home {
  padding: 24px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header h2 {
  margin: 0;
}
.shop-stats {
  margin-bottom: 16px;
}
.stat-item {
  margin-bottom: 8px;
}
.stat-item .label {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}
.stat-item .value {
  display: block;
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
}
.stat-item .trend {
  font-size: 14px;
  margin-left: 8px;
}
.trend.up {
  color: #52c41a;
}
.trend.down {
  color: #f5222d;
}
.shop-actions {
  text-align: right;
}

/* 添加店铺卡片的样式 */
.t-col {
  margin-bottom: 16px;
}
.t-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.t-card :deep(.t-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.shop-stats {
  flex: 1;
}
</style>