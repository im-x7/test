<template>
  <t-dialog
    v-model:visible="visible"
    :header="title"
    :footer="false"
    width="500px"
    class="basic-info-modal"
  >
    <div class="basic-info-form">
      <t-form :data="formData" :label-width="80">
        <t-form-item label="姓名" name="name" class="form-item">
          <t-input v-model="formData.name" placeholder="请输入姓名" />
        </t-form-item>
        
        <t-form-item label="联系电话" name="phone" class="form-item">
          <t-input v-model="formData.phone" placeholder="请输入联系电话" />
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
  phone: '',
  remark: ''
});

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
.basic-info-modal :deep(.t-dialog__body) {
  padding: 8px 16px;
}

.basic-info-form {
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