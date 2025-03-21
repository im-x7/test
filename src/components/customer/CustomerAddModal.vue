<template>
  <t-dialog
    v-model:visible="visible"
    :header="title"
    :footer="false"
    width="500px"
    class="customer-add-modal"
  >
    <div class="customer-add-form">
      <t-form :data="formData" :rules="rules" :label-width="80">
        <t-form-item label="姓名" name="name" class="form-item">
          <t-input v-model="formData.name" placeholder="请输入客户姓名" />
        </t-form-item>
        
        <t-form-item label="微信" name="wechat" class="form-item">
          <t-input v-model="formData.wechat" placeholder="请输入客户微信号" />
        </t-form-item>
        
        <t-form-item label="性别" name="gender" class="form-item">
          <t-radio-group v-model="formData.gender">
            <t-radio :value="1">男</t-radio>
            <t-radio :value="2">女</t-radio>
          </t-radio-group>
        </t-form-item>
        
        <t-form-item label="手机号" name="phone" class="form-item">
          <t-input v-model="formData.phone" placeholder="请输入客户手机号码" />
        </t-form-item>
        
        <t-form-item label="备注" name="remark" class="form-item">
          <t-textarea v-model="formData.remark" placeholder="请输入备注信息" />
        </t-form-item>
        
        <div class="form-footer">
          <t-space>
            <t-button theme="primary" @click="handleConfirm">确认</t-button>
            <t-button theme="default" @click="handleCancel">取消</t-button>
          </t-space>
        </div>
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue';

interface FormData {
  name: string;
  wechat: string;
  gender: number;
  phone: string;
  remark: string;
  [key: string]: any;
}

const props = defineProps<{
  visible: boolean;
  title: string;
  initialData?: FormData;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'confirm': [data: FormData];
  'cancel': [];
}>();

const formData = reactive<FormData>({
  name: '',
  wechat: '',
  gender: 1, // 默认为男性
  phone: '',
  remark: ''
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入客户姓名', type: 'error' }],
  gender: [{ required: true, message: '请选择性别', type: 'error' }],
  phone: [
    { required: true, message: '请输入手机号码', type: 'error' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', type: 'error' }
  ]
};

// 初始化表单数据
if (props.initialData) {
  Object.assign(formData, props.initialData);
}

const handleConfirm = () => {
  emit('confirm', { ...formData });
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>

<style scoped>
.customer-add-modal :deep(.t-dialog__body) {
  padding: 8px 16px;
}

.customer-add-form {
  width: 100%;
}

.form-item {
  margin-bottom: 16px;
}

.form-footer {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>