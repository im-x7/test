<template>
  <div class="not-found">
    <h1>404</h1>
    <p>抱歉，您访问的页面不存在</p>
    <t-button theme="primary" @click="goHome">返回首页</t-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 100px 0;
}
h1 {
  font-size: 72px;
  color: #1890ff;
}
p {
  margin: 24px 0;
}
</style>