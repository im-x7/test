<template>
  <div class="shop-form">
    <t-form
      ref="form"
      :data="formData"
      :rules="rules"
      label-width="120px"
      @submit="onSubmit"
      @reset="onReset"
    >
      <t-form-item label="店铺名称" name="name">
        <t-input v-model="formData.name" placeholder="请输入店铺名称" />
      </t-form-item>

      <t-form-item label="店铺地址" name="address">
        <t-input v-model="formData.address" placeholder="请输入店铺地址" />
      </t-form-item>

      <t-form-item label="联系电话" name="phone">
        <t-input v-model="formData.phone" placeholder="请输入联系电话" />
      </t-form-item>

      <t-form-item label="营业时间" name="businessHours">
        <t-input v-model="formData.businessHours" placeholder="请输入营业时间" />
      </t-form-item>

      <t-form-item label="店铺简介" name="description">
        <t-textarea v-model="formData.description" placeholder="请输入店铺简介" />
      </t-form-item>

      <t-form-item label="店铺logo" name="logo">
        <t-upload
          v-model="formData.logo"
          :action="uploadUrl"
          :headers="uploadHeaders"
          accept="image/*"
          :max="1"
          :show-upload-progress="true"
          @success="handleUploadSuccess"
          @fail="handleUploadFail"
        >
          <template #trigger>
            <t-button theme="primary">上传Logo</t-button>
            <template v-if="formData.logo">
              <t-image :src="formData.logo" fit="cover" style="width: 100px; height: 100px; margin-left: 16px" />
            </template>
          </template>
        </t-upload>
      </t-form-item>

      <t-form-item label="相册分类" name="albumCategories">
        <t-checkbox-group v-model="formData.albumCategories">
          <t-checkbox value="graffiti_tattoo">涂鸦背景纹身</t-checkbox>
          <t-checkbox value="black_tattoo">黑色背景纹身</t-checkbox>
          <t-checkbox value="graffiti_accessory">涂鸦背景饰品</t-checkbox>
          <t-checkbox value="black_accessory">黑色背景饰品</t-checkbox>
        </t-checkbox-group>
      </t-form-item>

      <t-form-item label="渠道" name="channels">
        <t-select
          v-model="formData.channels"
          :options="channelOptions"
          placeholder="请选择或输入渠道"
          multiple
          creatable
          filterable
        />
      </t-form-item>

      <t-form-item>
        <t-space>
          <t-button theme="primary" type="submit">保存</t-button>
          <t-button theme="default" type="reset">重置</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import type { FormInstanceFunctions } from 'tdesign-vue-next/es/form/type'

const form = ref<FormInstanceFunctions>()
const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/api/upload'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

const formData = reactive({
  name: '',
  address: '',
  phone: '',
  businessHours: '',
  description: '',
  logo: '',
  albumCategories: [] as string[],
  channels: [] as string[]
})

const channelOptions = ref([])

const rules = {
  name: [{ required: true, message: '请输入店铺名称', type: 'error' }],
  address: [{ required: true, message: '请输入店铺地址', type: 'error' }],
  phone: [{ required: true, message: '请输入联系电话', type: 'error' }],
  businessHours: [{ required: true, message: '请输入营业时间', type: 'error' }],
  albumCategories: [{ required: true, message: '请至少选择一个相册分类', type: 'error' }],
  channels: [{ required: true, message: '请至少选择一个渠道', type: 'error' }]
}

const handleUploadSuccess = (response: any) => {
  formData.logo = response.url
  MessagePlugin.success('上传成功')
}

const handleUploadFail = () => {
  MessagePlugin.error('上传失败')
}

const onSubmit = async ({ validateResult }: { validateResult: boolean }) => {
  if (validateResult === true) {
    try {
      // 这里添加保存店铺信息的逻辑
      MessagePlugin.success('保存成功')
    } catch (error) {
      MessagePlugin.error('保存失败')
    }
  }
}

const onReset = () => {
  form.value?.reset()
}
</script>

<style scoped>
.shop-form {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style> 