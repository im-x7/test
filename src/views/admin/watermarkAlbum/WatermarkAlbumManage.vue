<template>
  <div class="watermark-album-manage">
    <div class="page-header">
      <h2>水印相册管理</h2>
      <t-button theme="primary" @click="showAddAlbumModal">
        <template #icon><t-icon name="add" /></template>
        添加新相册
      </t-button>
    </div>
    
    <div class="album-list">
      <t-row :gutter="16">
        <t-col :span="6" v-for="album in albums" :key="album.id">
          <t-card :title="album.name" :subtitle="`包含 ${getTotalItems(album)} 个项目`" :bordered="true" :hover="true">
            <template #actions>
              <t-space>
                <t-button theme="primary" variant="text" size="small" @click="editAlbum(album)">编辑</t-button>
                <t-button theme="danger" variant="text" size="small" @click="confirmDeleteAlbum(album)">删除</t-button>
              </t-space>
            </template>
            <template #footer>
              <div class="category-tags">
                <t-tag v-for="category in album.categories" :key="category" size="large" theme="primary" variant="light">
                  {{ getCategoryName(category) }}
                </t-tag>
                <t-tag v-if="album.categories.length === 0" size="large" theme="warning" variant="light">未分配分类</t-tag>
              </div>
            </template>
          </t-card>
        </t-col>
      </t-row>
    </div>
    
    <!-- 添加/编辑相册弹窗 -->
    <t-dialog
      :visible="albumModalVisible"
      :title="isEditing ? '编辑相册' : '添加相册'"
      :confirm-btn="{ content: '确定', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      @confirm="handleAlbumConfirm"
      @close="albumModalVisible = false"
      width="600px"
    >
      <t-form ref="albumFormRef" :data="albumForm" :rules="albumRules" label-width="100px">
        <t-form-item label="相册名称" name="name">
          <t-input v-model="albumForm.name" placeholder="请输入相册名称" />
        </t-form-item>
        <t-form-item label="分配分类" name="categories">
          <div class="category-checkboxes">
            <t-checkbox-group v-model="albumForm.categories">
              <t-checkbox v-for="category in categoryOptions" :key="category.value" :value="category.value">
                {{ category.label }}
              </t-checkbox>
            </t-checkbox-group>
          </div>
        </t-form-item>
        <t-form-item label="水印图片" name="watermarkImage">
          <t-upload
            v-model="uploadFiles"
            :action="uploadAction"
            theme="image"
            accept="image/*"
            :max="1"
            :show-upload-progress="true"
            :before-upload="beforeUploadWatermark"
            @success="handleWatermarkUploadSuccess"
            @fail="handleWatermarkUploadFail"
          >
            <template #trigger>
              <t-button theme="default" variant="outline">
                <template #icon>
                  <t-icon name="upload" />
                </template>
                上传水印图片
              </t-button>
            </template>
            <template #tip>
              <p class="tip-text">支持 jpg/png 格式，建议尺寸不超过1MB</p>
            </template>
          </t-upload>
        </t-form-item>
        <t-form-item label="自定义分类">
          <div class="custom-category-section">
            <div class="input-group">
              <t-input v-model="newCategory" placeholder="输入新分类名称" style="width: 200px" />
              <t-button theme="primary" @click="addCustomCategory">添加</t-button>
            </div>
            <div class="custom-categories-list" v-if="customCategories.length > 0">
              <t-tag v-for="(category, index) in customCategories" :key="index"
                theme="primary" size="large" closable @close="removeCustomCategory(index)">
                {{ category.label }}
              </t-tag>
            </div>
          </div>
        </t-form-item>
      </t-form>
    </t-dialog>
    
    <!-- 删除确认弹窗 -->
    <t-dialog
      :visible="deleteConfirmVisible"
      header="确认删除"
      body="删除相册将会同时删除相册中的所有图片，确定要删除吗？"
      :confirm-btn="{ content: '确定', theme: 'danger' }"
      :cancel-btn="{ content: '取消' }"
      @confirm="deleteAlbum"
      @close="deleteConfirmVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
  Button as TButton,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Dialog as TDialog,
  Checkbox as TCheckbox,
  Tag as TTag,
  Upload as TUpload,
  Icon as TIcon,
} from 'tdesign-vue-next';

// 定义接口
interface UploadFile {
  url: string;
  name?: string;
  size?: number;
  type?: string;
  status?: 'success' | 'fail' | 'uploading';
  response?: any;
}

interface AlbumItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface Album {
  id: string;
  name: string;
  categories: string[];
  watermarkImage: string;
  items: AlbumItem[];
}

interface CategoryOption {
  value: string;
  label: string;
}

interface AlbumFormData {
  name: string;
  categories: string[];
  watermarkImage: string;
}


// 表单相关
interface FormInstanceFunctions {
  validate: () => Promise<{ validateResult: boolean; firstError: string }>;
  reset: () => void;
}

const albumFormRef = ref<FormInstanceFunctions | null>(null);

// 状态定义
const albums = ref<Album[]>([]);
const albumModalVisible = ref(false);
const isEditing = ref(false);
const currentAlbumId = ref('');
const deleteConfirmVisible = ref(false);
const albumToDelete = ref<Album | null>(null);

// 表单相关
const albumForm = reactive<AlbumFormData>({
  name: '',
  categories: [],
  watermarkImage: ''
});

const albumRules = {
  name: [{ required: true, message: '请输入相册名称', type: 'error' }],
  categories: [{ required: true, message: '请选择至少一个分类', type: 'error' }],
  watermarkImage: [{ required: true, message: '请上传水印图片', type: 'error' }]
};

// 自定义分类相关
const newCategory = ref('');
const customCategories = ref<CategoryOption[]>([]);

// 预定义分类选项
const defaultCategories = [
  { value: 'graffiti_tattoo', label: '涂鸦背景纹身' },
  { value: 'graffiti_accessory', label: '涂鸦背景饰品' },
  { value: 'black_tattoo', label: '黑色背景纹身' },
  { value: 'black_accessory', label: '黑色背景饰品' }
];

// 合并默认分类和自定义分类
const categoryOptions = computed(() => {
  return [...defaultCategories, ...customCategories.value];
});

// 获取分类名称
const getCategoryName = (categoryValue: string) => {
  const category = categoryOptions.value.find(c => c.value === categoryValue);
  return category ? category.label : categoryValue;
};

// 获取相册中的总项目数
const getTotalItems = (album: Album) => {
  return album.items.length;
};

// 获取预览项目（最多显示4个）

// 上传文件列表
const uploadFiles = ref<UploadFile[]>([]);

// 显示添加相册弹窗
const showAddAlbumModal = () => {
  isEditing.value = false;
  albumForm.name = '';
  albumForm.categories = [];
  albumForm.watermarkImage = '';
  uploadFiles.value = [];
  albumModalVisible.value = true;
};

// 编辑相册
const editAlbum = (album: Album) => {
  isEditing.value = true;
  currentAlbumId.value = album.id;
  albumForm.name = album.name;
  albumForm.categories = [...album.categories];
  albumForm.watermarkImage = album.watermarkImage;
  uploadFiles.value = album.watermarkImage ? [{ url: album.watermarkImage }] : [];
  albumModalVisible.value = true;
};

// 确认删除相册
const confirmDeleteAlbum = (album: Album) => {
  albumToDelete.value = album;
  deleteConfirmVisible.value = true;
};

// 删除相册
const deleteAlbum = () => {
  if (!albumToDelete.value) return;
  
  // 从列表中移除相册
  const index = albums.value.findIndex(a => a.id === albumToDelete.value?.id);
  if (index !== -1) {
    albums.value.splice(index, 1);
    MessagePlugin.success('相册删除成功');
  }
  
  deleteConfirmVisible.value = false;
  albumToDelete.value = null;
};

// 添加自定义分类
const addCustomCategory = () => {
  if (!newCategory.value.trim()) {
    MessagePlugin.warning('请输入分类名称');
    return;
  }
  
  // 检查是否已存在
  const exists = categoryOptions.value.some(c => c.label === newCategory.value.trim());
  if (exists) {
    MessagePlugin.warning('该分类已存在');
    return;
  }
  
  // 生成唯一值
  const value = `custom_${Date.now()}`;
  customCategories.value.push({
    value,
    label: newCategory.value.trim()
  });
  
  // 清空输入
  newCategory.value = '';
  MessagePlugin.success('分类添加成功');
};

// 移除自定义分类
const removeCustomCategory = (index: number) => {
  const categoryToRemove = customCategories.value[index];
  
  // 从所有相册中移除该分类
  albums.value.forEach(album => {
    album.categories = album.categories.filter(c => c !== categoryToRemove.value);
  });
  
  // 从自定义分类列表中移除
  customCategories.value.splice(index, 1);
  MessagePlugin.success('分类移除成功');
};

// 处理相册表单提交
const handleAlbumConfirm = async () => {
  if (!albumFormRef.value) return;
  
  const { validateResult } = await albumFormRef.value.validate();
  if (!validateResult) return;

  try {
    const formData: Partial<Album> = {
      name: albumForm.name,
      categories: albumForm.categories,
      watermarkImage: albumForm.watermarkImage || undefined
    };

    if (isEditing.value) {
      // 处理编辑相册
      await updateAlbum(currentAlbumId.value, formData);
      MessagePlugin.success('相册更新成功');
    } else {
      // 处理新增相册
      await createAlbum(formData);
      MessagePlugin.success('相册创建成功');
    }

    albumModalVisible.value = false;
    fetchAlbums(); // 刷新相册列表
  } catch (error) {
    console.error('保存相册失败:', error);
    MessagePlugin.error('操作失败，请重试');
  }
};

// 处理图片加载错误

// 处理同步

// 上传接口地址
const uploadAction = '/api/upload/watermark';

// 水印图片上传前检查
const beforeUploadWatermark = (file: File) => {
  // 检查文件类型
  const isImage = /^image\/(jpeg|png)$/.test(file.type);
  if (!isImage) {
    MessagePlugin.error('只能上传 jpg/png 格式的图片');
    return false;
  }

  // 检查文件大小（限制为1MB）
  const isLt1M = file.size / 1024 / 1024 < 1;
  if (!isLt1M) {
    MessagePlugin.error('图片大小不能超过1MB');
    return false;
  }

  return true;
};

// 水印图片上传成功
const handleWatermarkUploadSuccess = (response: any) => {
  MessagePlugin.success('水印图片上传成功');
  albumForm.watermarkImage = response.url;
};

// 水印图片上传失败
const handleWatermarkUploadFail = (error: any) => {
  MessagePlugin.error('水印图片上传失败');
  console.error('水印图片上传失败:', error);
};

// API实现
const createAlbum = async (formData: Partial<Album>): Promise<Album> => {
  // 这里实现实际的API调用
  return {
    id: `album_${Date.now()}`,
    name: formData.name || '',
    categories: formData.categories || [],
    watermarkImage: formData.watermarkImage || '',
    items: []
  };
};

const updateAlbum = async (id: string, formData: Partial<Album>): Promise<Album> => {
  // 这里实现实际的API调用
  return {
    id,
    name: formData.name || '',
    categories: formData.categories || [],
    watermarkImage: formData.watermarkImage || '',
    items: []
  };
};

const fetchAlbums = async (): Promise<Album[]> => {
  // 这里实现实际的API调用
  return [];
};

// 初始化数据
onMounted(() => {
  // 模拟初始数据
  albums.value = [
    {
      id: 'album_1',
      name: '经典纹身',
      categories: ['graffiti_tattoo', 'black_tattoo'],
      watermarkImage: '',
      items: [
        {
          id: 'item_1',
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          title: '龙纹身',
          category: 'graffiti_tattoo'
        },
        {
          id: 'item_2',
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          title: '凤凰纹身',
          category: 'black_tattoo'
        }
      ]
    }
  ];
});
</script>

<style scoped>
.watermark-album-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.album-list {
  margin-top: 20px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.category-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-category-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.custom-category-section .input-group {
  display: flex;
  gap: 8px;
}

.custom-categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  min-height: 40px;
  margin-top: 8px;
}

.custom-categories-list .t-tag {
  margin: 4px;
  padding: 6px 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.custom-categories-list .t-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 水印图片上传样式 */
.tip-text {
  color: var(--td-text-color-secondary);
  font-size: 12px;
  margin-top: 8px;
}

.t-upload__single-display-text {
  color: var(--td-brand-color);
}

.t-upload__single {
  width: 200px !important;
}

.t-upload__single-image {
  border-radius: 8px;
  overflow: hidden;
}
</style>