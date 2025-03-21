<template>
  <div class="blank-layout">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
// 空白布局，只包含路由视图
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}
</style> 