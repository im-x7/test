<template>
  <div class="test">
    <h1>   测试组件    </h1>
    <div>
      {{ message}}
    </div>
  </div>
</template>

<script setup lang="ts">
const message = "Hello World"
</script>

<style scoped>
.test{
  color:red;
  padding:10px
}
</style> 