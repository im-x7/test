<template>
  <div class="login-container">
    <t-card title="系统登录" class="login-card">
      <t-form
        ref="formRef"
        :data="formState"
        :rules="rules"
        @submit="onFinish"
      >
        <t-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <t-input v-model="formState.username" placeholder="用户名">
            <template #prefix-icon>
              <t-icon name="user" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <t-input
            v-model="formState.password"
            type="password"
            placeholder="密码"
          >
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-button theme="primary" type="submit" class="login-button" :loading="loading">
            登录
          </t-button>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useRouter } from 'vue-router';
import { FormRule } from 'tdesign-vue-next/es/form/type';

const router = useRouter();
const loading = ref(false);
const formRef = ref();

const formState = reactive({
  username: '',
  password: '',
});

// 定义表单验证规则
const rules: Record<string, FormRule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

// 修改登录处理逻辑
const onFinish = async () => {
  // 使用表单实例进行验证
  const validateResult = await formRef.value.validate();
  if (validateResult !== true) {
    return;
  }
  loading.value = true;
  try {
    // 验证管理员账号
    if (formState.username === 'admin' && formState.password === 'admin123') {
      const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({username: 'admin'}))}.mockSignature`;
      localStorage.setItem('token', mockJwtToken);
      localStorage.setItem('isAdmin', 'true');
      MessagePlugin.success('登录成功');
      router.push('/admin');
      return;
    }
    
    // 验证普通用户账号
    if (formState.username === 'user' && formState.password === 'user123') {
      const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({username: 'user'}))}.mockSignature`;
      localStorage.setItem('token', mockJwtToken);
      localStorage.setItem('isAdmin', 'false');
      MessagePlugin.success('登录成功');
      router.push('/');
      return;
    }
    
    // 尝试调用后端登录接口
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formState.username,
          password: formState.password,
        }),
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', data.isAdmin);
      MessagePlugin.success('登录成功');
      router.push(data.isAdmin ? '/admin' : '/');
    } catch (error) {
      // 如果后端接口调用失败，显示错误信息
      MessagePlugin.error('用户名或密码错误');
    }
  } catch (error) {
    MessagePlugin.error('登录失败：' + (error as Error).message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('@/assets/login-bg.jpg') top/cover no-repeat;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '红府纹身设计工作室';
  position: absolute;
  font-size: 5vw;
  font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
  color: #ffffff;
  opacity: 1;
  z-index: 1;
  transform: translate(-50%, 0);
  left: 50%;
  top: 15%;
  font-weight: 300;
  letter-spacing: 2px;
}

.login-card {
  width: 360px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.t-card__header) {
  border-bottom: 1px solid #eee;
}

:deep(.t-card__title) {
  color: #333;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
}

:deep(.t-input),
:deep(.t-input__wrap) {
  background-color: #f5f5f5;
  border: 1px solid #eee;
  color: #333;
  height: 40px;
  border-radius: 4px;
}

:deep(.t-input:focus),
:deep(.t-input__wrap:focus-within) {
  border-color: #666;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

:deep(.t-input__placeholder),
:deep(.t-input input::placeholder) {
  color: #999;
}

:deep(.t-icon) {
  color: #666;
}

:deep(.t-form__label) {
  color: #333;
}

.login-button {
  width: 100%;
  background: #333;
  border: none;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.login-button:hover {
  background: #000;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>