<template>
  <t-form
    ref="formRef"
    :data="formData"
    :rules="rules"
    :label-width="120"
    @submit="onSubmit"
  >
    <t-form-item label="客户姓名" name="name">
      <t-input v-model="formData.name" placeholder="请输入客户姓名" />
    </t-form-item>
    
    <t-form-item label="性别" name="gender">
      <t-radio-group v-model="formData.gender">
        <t-radio :value="1">男</t-radio>
        <t-radio :value="2">女</t-radio>
      </t-radio-group>
    </t-form-item>

    <t-form-item label="微信" name="wechat">
      <t-input v-model="formData.wechat" placeholder="请输入客户微信号" />
    </t-form-item>
    
    <t-form-item label="手机号码" name="phone">
      <t-input v-model="formData.phone" placeholder="请输入客户手机号码" />
    </t-form-item>
    
    <t-form-item label="渠道来源" name="channels">
      <t-checkbox-group v-model="formData.channels">
        <t-checkbox value="gaode">高德地图</t-checkbox>
        <t-checkbox value="apple">苹果地图</t-checkbox>
        <t-checkbox value="tencent">腾讯地图</t-checkbox>
        <t-checkbox value="douyin">抖音</t-checkbox>
        <t-checkbox value="kuaishou">快手</t-checkbox>
        <t-checkbox value="xiaohongshu">小红书</t-checkbox>
        <t-checkbox value="meituan">美团</t-checkbox>
      </t-checkbox-group>
    </t-form-item>
    
    <t-form-item label="备注" name="remark">
      <t-textarea v-model="formData.remark" :rows="4" placeholder="请输入备注信息" />
    </t-form-item>
    
    <t-form-item :wrapper-col="{ offset: 4, span: 16 }">
      <t-space>
        <t-button theme="primary" type="submit">提交</t-button>
        <t-button theme="default" variant="base" @click="onCancel">取消</t-button>
      </t-space>
    </t-form-item>
  </t-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, watch } from 'vue';

// 定义表单数据类型
interface FormState {
  name: string;
  wechat: string;
  gender: number;
  phone: string;
  remark: string;
  channels: string[];
}

// 定义组件属性
const props = defineProps<{
  initialValues?: FormState;
}>();

// 定义组件事件
const emit = defineEmits<{
  submit: [values: FormState];
  cancel: [];
}>();

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive<FormState>({
  name: '',
  wechat: '',
  gender: 1, // 默认为男性
  phone: '',
  remark: '',
  channels: []
});

// 监听初始值变化
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues) {
      Object.assign(formData, newValues);
    }
  },
  { immediate: true, deep: true }
);

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入客户姓名', type: 'error' }],
  gender: [{ required: true, message: '请选择性别', type: 'error' }],
  phone: [
    { required: true, message: '请输入手机号码', type: 'error' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', type: 'error' }
  ]
};

// 提交表单
const onSubmit = (context: { validateResult: boolean; firstError?: string }) => {
  if (context.validateResult) {
    emit('submit', { ...formData });
  } else {
    console.log('表单验证失败:', context.firstError);
  }
};

// 取消操作
const onCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.t-form {
  padding-top: 20px;
}

.t-form-item:first-child {
  margin-top: 12px;
}

.t-form-item {
  margin-bottom: 24px;
}

/* 确保表单内容与卡片边缘有足够的间距 */
.t-form > :first-child {
  margin-top: 8px;
}
</style>