<template>
  <div class="album-management">
    <h2>水印相册</h2>
    
    <div class="operation-bar">
      <t-space>
        <div class="filter-group">
          <span class="filter-label">相册：</span>
          <t-checkbox-group v-model="filters.album" :options="albums" @change="handleAlbumChange" />
        </div>
        <div class="filter-group">
          <span class="filter-label">分类：</span>
          <t-checkbox-group v-model="filters.category" :options="categoryOptions" />
        </div>
        <t-button theme="primary" @click="handleSearch">查询</t-button>
        <t-button @click="resetFilters">重置</t-button>
      </t-space>
      <t-space>
        <t-button theme="primary" @click="uploadVisible = true">批量上传</t-button>
        <t-button theme="primary" @click="goToWatermarkAlbumManage">水印相册管理</t-button>
      </t-space>
    </div>

    <!-- 表格形式展示相册数据 -->
    <t-table
      :data="tableData"
      :columns="columns"
      :loading="loading"
      row-key="title"
      :pagination="pagination"
      @page-change="onPageChange"
      bordered
      stripe
      style="margin-top: 16px"
    >
      <!-- 纹身照片列 -->
      <template #tattoo="{ row }">
        <div class="image-gallery">
          <template v-if="row.tattoo && row.tattoo.length">
            <div 
              v-for="image in row.tattoo.slice(0, 3)"
              :key="image.id" 
              class="gallery-item"
              @click="handlePreviewImage(image, row.tattoo)"
            >
              <div class="image-thumbnail watermark-image">
                <img 
                  :src="image.url" 
                  :alt="image.title"
                  @error="handleImageError($event)"
                  v-loading="imageLoading"
                  loading="lazy"
                >
                <div class="watermark">水印</div>
                <div class="image-hover-overlay">
                  <t-icon name="browse" size="16px" />
                </div>
              </div>
            </div>
            <div v-if="row.tattoo.length > 3" class="more-indicator">
              +{{ row.tattoo.length - 3 }}
            </div>
          </template>
          <t-empty v-else description="暂无图片" size="small" />
        </div>
      </template>

      <!-- 遮盖图列 -->
      <template #cover="{ row }">
        <div class="image-gallery">
          <template v-if="row.cover && row.cover.length">
            <div 
              v-for="image in row.cover.slice(0, 3)"
              :key="image.id" 
              class="gallery-item"
              @click="handlePreviewImage(image, row.cover)"
            >
              <div class="image-thumbnail watermark-image">
                <img 
                  :src="image.url" 
                  :alt="image.title"
                  @error="handleImageError($event)"
                  v-loading="imageLoading"
                  loading="lazy"
                >
                <div class="watermark">水印</div>
                <div class="image-hover-overlay">
                  <t-icon name="browse" size="16px" />
                </div>
              </div>
            </div>
            <div v-if="row.cover.length > 3" class="more-indicator">
              +{{ row.cover.length - 3 }}
            </div>
          </template>
          <t-empty v-else description="暂无图片" size="small" />
        </div>
      </template>

      <!-- 设计图列 -->
      <template #design="{ row }">
        <div class="image-gallery">
          <template v-if="row.design && row.design.length">
            <div 
              v-for="image in row.design.slice(0, 3)"
              :key="image.id" 
              class="gallery-item"
              @click="handlePreviewImage(image, row.design)"
            >
              <div class="image-thumbnail watermark-image">
                <img 
                  :src="image.url" 
                  :alt="image.title"
                  @error="handleImageError($event)"
                  v-loading="imageLoading"
                  loading="lazy"
                >
                <div class="watermark">水印</div>
                <div class="image-hover-overlay">
                  <t-icon name="browse" size="16px" />
                </div>
              </div>
            </div>
            <div v-if="row.design.length > 3" class="more-indicator">
              +{{ row.design.length - 3 }}
            </div>
          </template>
          <t-empty v-else description="暂无图片" size="small" />
        </div>
      </template>

      <!-- 操作列 -->
      <template #operation="{ row }">
        <t-space>
          <t-button variant="text" size="small" @click="handleEditGroup(row)">编辑</t-button>
          <t-popconfirm content="确认删除该组合？" @confirm="handleDeleteGroup(row)">
            <t-button variant="text" theme="danger" size="small">删除</t-button>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    
    <div v-if="!tableData.length && !loading" class="empty-album">
      <t-empty description="暂无相册数据" />
    </div>
    
    <!-- 图片预览组件 -->
    <t-image-viewer
      v-model:visible="previewVisible"
      :images="previewImages.map(img => img.url)"
      :default-index="previewIndex"
      :title="previewImages[previewIndex]?.title"
      :showOverlay="true"
      :closeBtn="true"
      :zIndex="3000"
    />

    <!-- 上传弹窗 -->
    <t-dialog
      v-model:visible="uploadVisible"
      header="批量上传图片"
      width="1200px"
      :footer="false"
      attach="body"
      :close-on-overlay-click="false"
    >
      <div class="upload-container">
        <div class="upload-content">
          <div v-for="(group, index) in uploadGroups" :key="index" class="upload-group">
            <div class="group-header">
              <h4>第 {{ index + 1 }} 组</h4>
              <t-space>
                <t-select v-model="group.album" placeholder="请选择相册" style="width: 200px">
                  <t-option v-for="album in albums" :key="album.value" :value="album.value" :label="album.content" />
                </t-select>
                <t-select v-model="group.category" placeholder="请选择分类" style="width: 200px">
                  <t-option value="tattoo" label="纹身照片" />
                  <t-option value="cover" label="遮盖图" />
                  <t-option value="design" label="设计图" />
                </t-select>
              </t-space>
            </div>
            
            <div class="upload-panels">
              <!-- 纹身照片上传 -->
              <div class="upload-panel">
                <div class="panel-header">
                  <h5>纹身照片 <t-tag theme="primary">{{ group.tattooFiles.length }}/10</t-tag></h5>
                </div>
                <t-upload
                  v-model="group.tattooFiles"
                  multiple
                  accept="image/*"
                  :max="10"
                  theme="image-flow"
                  :draggable="false"
                  :action="''"
                  :request-method="handleFileUpload"
                  @validate="onFileValidate"
                  @preview-file="handlePreviewFile"
                >
                  <template #dragContent>
                    <div class="upload-drag-area">
                      <t-icon name="upload" size="24px" />
                      <p>点击上传纹身照片</p>
                      <span class="upload-hint">支持jpg、png、gif等格式</span>
                    </div>
                  </template>
                </t-upload>
              </div>
              
              <!-- 遮盖图上传 -->
              <div class="upload-panel">
                <div class="panel-header">
                  <h5>遮盖图 <t-tag theme="warning">{{ group.coverFiles.length }}/10</t-tag></h5>
                </div>
                <t-upload
                  v-model="group.coverFiles"
                  multiple
                  accept="image/*"
                  :max="10"
                  theme="image-flow"
                  :draggable="false"
                  :action="''"
                  :request-method="handleFileUpload"
                  @validate="onFileValidate"
                  @preview-file="handlePreviewFile"
                >
                  <template #dragContent>
                    <div class="upload-drag-area">
                      <t-icon name="upload" size="24px" />
                      <p>点击上传遮盖图</p>
                      <span class="upload-hint">支持jpg、png、gif等格式</span>
                    </div>
                  </template>
                </t-upload>
              </div>
              
              <!-- 设计稿上传 -->
              <div class="upload-panel">
                <div class="panel-header">
                  <h5>设计稿 <t-tag theme="success">{{ group.designFiles.length }}/10</t-tag></h5>
                </div>
                <t-upload
                  v-model="group.designFiles"
                  multiple
                  accept="image/*"
                  :max="10"
                  theme="image-flow"
                  :draggable="false"
                  :action="''"
                  :request-method="handleFileUpload"
                  @validate="onFileValidate"
                  @preview-file="handlePreviewFile"
                >
                  <template #dragContent>
                    <div class="upload-drag-area">
                      <t-icon name="upload" size="24px" />
                      <p>点击上传设计稿</p>
                      <span class="upload-hint">支持jpg、png、gif等格式</span>
                    </div>
                  </template>
                </t-upload>
              </div>
            </div>
          </div>
        </div>
        
        <div class="upload-footer">
          <t-space>
            <t-button theme="default" @click="handleCloseUpload">取消</t-button>
            <t-button theme="primary" :loading="loading" @click="handleUpload">
              上传 ({{ totalFiles }})
            </t-button>
          </t-space>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUploadHandlers } from '@/hooks/useUpload'

// 定义图片接口
interface AlbumImage {
  id: number
  title: string
  category: string
  group: string
  createTime: string
  keywords?: string[]
  url: string
}

// 定义表格行数据接口
interface TableRow {
  title: string
  tattoo: AlbumImage[]
  cover: AlbumImage[]
  design: AlbumImage[]
  createTime: string
}

const router = useRouter()

// 相册数据
const albumData = ref<AlbumImage[]>([])

const loading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50]
})

// 表格列定义
const columns = [
  {
    colKey: 'title',
    title: '名称',
    width: '150',
    ellipsis: true
  },
  {
    colKey: 'tattoo',
    title: '纹身照片',
    width: '200'
  },
  {
    colKey: 'cover',
    title: '遮盖图',
    width: '200'
  },
  {
    colKey: 'design',
    title: '设计图',
    width: '200'
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: '150',
    ellipsis: true
  },
  {
    colKey: 'operation',
    title: '操作',
    width: '120',
    fixed: 'right'
  }
]

// 定义相册数据
const albums = ref([
  { label: '1', value: '龙纹身', content: '龙纹身' },
  { label: '2', value: '凤凰纹身', content: '凤凰纹身' },
  { label: '3', value: '麒麟纹身', content: '麒麟纹身' }
])

// 分类选项
const categoryOptions = ref([
  { label: 'tattoo', value: 'tattoo', content: '纹身照片' },
  { label: 'cover', value: 'cover', content: '遮盖图' },
  { label: 'design', value: 'design', content: '设计图' }
])

// 筛选条件
const filters = reactive({
  album: [] as string[],
  category: [] as string[],
})

// 处理相册选择变化
const handleAlbumChange = (value: string[]) => {
  // 如果相册选择为空，清空分类选择
  if (value.length === 0) {
    filters.category = []
  }
}

// 实时筛选逻辑
const filteredData = computed(() => {
  return albumData.value.filter(item => {
    const matchAlbum = filters.album.length === 0 || filters.album.includes(item.group)
    const matchCategory = filters.category.length === 0 || filters.category.includes(item.category)
    return matchAlbum && matchCategory
  })
})

// 重置筛选条件
const resetFilters = () => {
  filters.album = []
  filters.category = []
  pagination.current = 1
}

// 处理搜索
const handleSearch = () => {
  pagination.current = 1
}

// 将相册数据按标题分组并转换为表格数据
const tableData = computed(() => {
  const groups: { [key: string]: { title: string; tattoo: AlbumImage[]; cover: AlbumImage[]; design: AlbumImage[]; createTime: string } } = {};
  
  // 先将所有图片按标题分组
  filteredData.value.forEach(item => {
    const title = item.title.split('-')[0].trim(); // 取标题的第一部分作为组名
    
    if (!groups[title]) {
      groups[title] = {
        title: title,
        tattoo: [],
        cover: [],
        design: [],
        createTime: item.createTime // 使用第一个图片的创建时间作为组的创建时间
      };
    }
    
    // 根据分类添加到相应数组
    if (item.category === 'tattoo') {
      groups[title].tattoo.push(item);
    } else if (item.category === 'cover') {
      groups[title].cover.push(item);
    } else if (item.category === 'design') {
      groups[title].design.push(item);
    }
    
    // 更新为最新的创建时间
    const itemDate = new Date(item.createTime);
    const groupDate = new Date(groups[title].createTime);
    if (itemDate > groupDate) {
      groups[title].createTime = item.createTime;
    }
  });
  
  // 转换为数组
  return Object.values(groups);
})

// 图片预览相关
const previewVisible = ref(false)
const previewImages = ref<AlbumImage[]>([])
const previewIndex = ref(0)

// 图片加载状态
const imageLoading = ref(false)

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // 替换为默认图片
  target.src = '/src/assets/image-error.png'
  // 添加错误样式
  target.classList.add('image-error')
  console.error('图片加载失败:', target.alt)
}

// 处理图片预览
const handlePreviewImage = (image: AlbumImage, imageList: AlbumImage[]) => {
  previewImages.value = imageList
  previewIndex.value = imageList.findIndex(img => img.id === image.id)
  previewVisible.value = true
}

// 处理分页变化
const onPageChange = (pageInfo: { current: number; pageSize: number }) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
}

// 处理编辑组合
const handleEditGroup = (row: TableRow) => {
  // 实现编辑逻辑
  console.log('编辑组合:', row)
}

// 处理删除组合
const handleDeleteGroup = (row: TableRow) => {
  // 实现删除逻辑
  console.log('删除组合:', row)
}

// 跳转到水印相册管理页面
const goToWatermarkAlbumManage = () => {
  router.push('/admin/watermark-album')
}

// 获取相册数据
const fetchAlbumData = async () => {
  loading.value = true
  
  try {
    // 模拟API请求
    setTimeout(() => {
      // 模拟数据
      albumData.value = [
        {
          id: 1,
          title: '龙纹身-纹身照片-1',
          category: 'tattoo',
          group: '龙纹身',
          createTime: '2023-05-15 14:30:00',
          keywords: ['龙', '传统'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
        },
        {
          id: 2,
          title: '龙纹身-纹身照片-2',
          category: 'tattoo',
          group: '龙纹身',
          createTime: '2023-05-15 14:35:00',
          keywords: ['龙', '传统'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
        },
        {
          id: 3,
          title: '龙纹身-遮盖图-1',
          category: 'cover',
          group: '龙纹身',
          createTime: '2023-05-15 14:40:00',
          keywords: ['龙', '遮盖'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
        },
        {
          id: 4,
          title: '龙纹身-设计图-1',
          category: 'design',
          group: '龙纹身',
          createTime: '2023-05-15 14:45:00',
          keywords: ['龙', '设计'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
        },
        {
          id: 5,
          title: '凤凰纹身-纹身照片-1',
          category: 'tattoo',
          group: '凤凰纹身',
          createTime: '2023-05-16 10:30:00',
          keywords: ['凤凰', '传统'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
        }
      ]
      
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('获取相册数据失败:', error)
    MessagePlugin.error('获取相册数据失败')
    loading.value = false
  }
}

// 初始化时获取数据
onMounted(() => {
  fetchAlbumData()
})

// 上传相关
const uploadVisible = ref(false)
const { uploadFile } = useUploadHandlers()

// 上传组数据
interface UploadGroup {
  album: string;
  category: string;
  tattooFiles: any[];
  coverFiles: any[];
  designFiles: any[];
}

const uploadGroups = ref<UploadGroup[]>(Array(5).fill(null).map(() => ({
  album: '',
  category: '',
  tattooFiles: [],
  coverFiles: [],
  designFiles: []
})));

// 计算总文件数
const totalFiles = computed(() => {
  return uploadGroups.value.reduce((total, group) => 
    total + group.tattooFiles.length + group.coverFiles.length + group.designFiles.length, 0);
});

// 处理文件验证
const onFileValidate = ({ type: _type, file }: { type: string; file: any }) => {
  if (!file.type.startsWith('image/')) {
    MessagePlugin.error('仅支持图片格式')
    return false
  }
  return true
}

// 处理单个文件上传（用于上传组件的请求方法）
const handleFileUpload = (file: any) => {
  return new Promise<{ status: string; response: any }>((resolve) => {
    try {
      // 模拟上传过程
      setTimeout(() => {
        // 获取实际的文件对象
        let actualFile = file;
        
        // 处理可能的UploadFile对象情况
        if (actualFile && typeof actualFile === 'object') {
          if (actualFile.raw && (actualFile.raw instanceof Blob || actualFile.raw instanceof File)) {
            actualFile = actualFile.raw;
          } else if (actualFile.file && (actualFile.file instanceof Blob || actualFile.file instanceof File)) {
            actualFile = actualFile.file;
          } else if (Array.isArray(actualFile)) {
            // 处理数组情况，取第一个元素
            if (actualFile.length > 0) {
              const firstItem = actualFile[0];
              if (firstItem.raw && (firstItem.raw instanceof Blob || firstItem.raw instanceof File)) {
                actualFile = firstItem.raw;
              } else if (firstItem.file && (firstItem.file instanceof Blob || firstItem.file instanceof File)) {
                actualFile = firstItem.file;
              } else if (firstItem instanceof Blob || firstItem instanceof File) {
                actualFile = firstItem;
              }
            }
          } else if (actualFile.response && actualFile.response.url) {
            // 已经上传过的文件，直接返回URL
            resolve({
              status: 'success',
              response: { url: actualFile.response.url }
            });
            return;
          }
        }
        
        // 确保file是有效的Blob或File对象
        if (actualFile && (actualFile instanceof Blob || actualFile instanceof File)) {
          resolve({
            status: 'success',
            response: { url: URL.createObjectURL(actualFile) }
          })
        } else {
          console.error('无效的文件对象:', actualFile);
          resolve({
            status: 'fail',
            response: { message: '无效的文件对象' }
          })
        }
      }, 500)
    } catch (error) {
      console.error('上传文件时发生错误:', error);
      resolve({
        status: 'fail',
        response: { message: '上传文件时发生错误，请重试' }
      })
    }
  })
}

// 处理上传组件的图片预览
const handlePreviewFile = (params: { file: any, index: number }) => {
  try {
    // 获取实际的文件对象
    let actualFile = params.file;
    
    // 处理可能的UploadFile对象情况
    if (actualFile && typeof actualFile === 'object') {
      if (actualFile.raw && (actualFile.raw instanceof Blob || actualFile.raw instanceof File)) {
        actualFile = actualFile.raw;
      } else if (actualFile.file && (actualFile.file instanceof Blob || actualFile.file instanceof File)) {
        actualFile = actualFile.file;
      } else if (Array.isArray(actualFile)) {
        // 处理数组情况，取第一个元素
        if (actualFile.length > 0) {
          const firstItem = actualFile[0];
          if (firstItem.raw && (firstItem.raw instanceof Blob || firstItem.raw instanceof File)) {
            actualFile = firstItem.raw;
          } else if (firstItem.file && (firstItem.file instanceof Blob || firstItem.file instanceof File)) {
            actualFile = firstItem.file;
          } else if (firstItem instanceof Blob || firstItem instanceof File) {
            actualFile = firstItem;
          }
        }
      } else if (actualFile.response && actualFile.response.url) {
        // 已经上传过的文件，直接使用URL
        previewImages.value = [{
          id: Date.now(),
          title: actualFile.name || '已上传文件',
          category: '',
          group: '',
          createTime: new Date().toISOString(),
          url: actualFile.response.url
        }];
        previewIndex.value = 0;
        previewVisible.value = true;
        return;
      }
    }
    
    // 确保是有效的Blob或File对象
    if (actualFile && (actualFile instanceof Blob || actualFile instanceof File)) {
      previewImages.value = [{
        id: Date.now(),
        title: actualFile instanceof File ? actualFile.name : '未命名文件',
        category: '',
        group: '',
        createTime: new Date().toISOString(),
        url: URL.createObjectURL(actualFile)
      }];
      previewIndex.value = 0;
      previewVisible.value = true;
    } else {
      console.error('无效的文件对象:', actualFile);
      MessagePlugin.error('无法预览文件：无效的文件对象');
    }
  } catch (error) {
    console.error('预览文件时发生错误:', error);
    MessagePlugin.error('预览文件时发生错误，请重试');
  }
}

// 关闭上传弹窗
const handleCloseUpload = () => {
  uploadVisible.value = false;
  // 重置上传组数据
  uploadGroups.value = Array(5).fill(null).map(() => ({
    album: '',
    category: '',
    tattooFiles: [],
    coverFiles: [],
    designFiles: []
  }));
};

// 处理上传
const handleUpload = async () => {
  if (totalFiles.value === 0) {
    MessagePlugin.warning('请至少上传一张图片');
    return;
  }
  
  // 检查是否所有组都选择了相册和分类
  const hasEmptyAlbumOrCategory = uploadGroups.value.some(group => 
    (group.tattooFiles.length > 0 || group.coverFiles.length > 0 || group.designFiles.length > 0) && 
    (!group.album || !group.category)
  );
  
  if (hasEmptyAlbumOrCategory) {
    MessagePlugin.warning('请为所有上传的图片选择相册和分类');
    return;
  }
  
  loading.value = true;
  
  try {
    const uploadPromises = uploadGroups.value.flatMap(group => {
      const promises = [];
      
      // 处理纹身照片
      promises.push(...group.tattooFiles.map(async (fileObj) => {
        try {
          let file = fileObj;
          if (fileObj && typeof fileObj === 'object') {
            if (fileObj.raw && (fileObj.raw instanceof Blob || fileObj.raw instanceof File)) {
              file = fileObj.raw;
            } else if (fileObj.file && (fileObj.file instanceof Blob || fileObj.file instanceof File)) {
              file = fileObj.file;
            }
          }
          
          if (!(file instanceof Blob || file instanceof File)) {
            console.error('无效的文件对象:', file);
            return null;
          }
          
          const result = await uploadFile(file, group.album, 'tattoo');
          return result;
        } catch (error) {
          console.error('处理纹身照片上传时发生错误:', error);
          return null;
        }
      }));
      
      // 处理遮盖图
      promises.push(...group.coverFiles.map(async (fileObj) => {
        try {
          let file = fileObj;
          if (fileObj && typeof fileObj === 'object') {
            if (fileObj.raw && (fileObj.raw instanceof Blob || fileObj.raw instanceof File)) {
              file = fileObj.raw;
            } else if (fileObj.file && (fileObj.file instanceof Blob || fileObj.file instanceof File)) {
              file = fileObj.file;
            }
          }
          
          if (!(file instanceof Blob || file instanceof File)) {
            console.error('无效的文件对象:', file);
            return null;
          }
          
          const result = await uploadFile(file, group.album, 'cover');
          return result;
        } catch (error) {
          console.error('处理遮盖图上传时发生错误:', error);
          return null;
        }
      }));
      
      // 处理设计稿
      promises.push(...group.designFiles.map(async (fileObj) => {
        try {
          let file = fileObj;
          if (fileObj && typeof fileObj === 'object') {
            if (fileObj.raw && (fileObj.raw instanceof Blob || fileObj.raw instanceof File)) {
              file = fileObj.raw;
            } else if (fileObj.file && (fileObj.file instanceof Blob || fileObj.file instanceof File)) {
              file = fileObj.file;
            }
          }
          
          if (!(file instanceof Blob || file instanceof File)) {
            console.error('无效的文件对象:', file);
            return null;
          }
          
          const result = await uploadFile(file, group.album, 'design');
          return result;
        } catch (error) {
          console.error('处理设计稿上传时发生错误:', error);
          return null;
        }
      }));
      
      return promises;
    });
    
    const results = await Promise.all(uploadPromises);
    const validResults = results.filter(Boolean);
    
    // 重置上传状态
    handleCloseUpload();
    
    // 刷新相册数据
    fetchAlbumData();
    
    MessagePlugin.success(`成功上传 ${validResults.length} 张图片`);
  } catch (error) {
    console.error('上传失败:', error);
    MessagePlugin.error('上传失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.album-management {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.image-gallery {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gallery-item {
  position: relative;
  cursor: pointer;
}

.image-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.watermark-image {
  position: relative;
}

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.image-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}

.gallery-item:hover .image-hover-overlay {
  opacity: 1;
}

.more-indicator {
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.image-error {
  border: 1px solid #ff4d4f;
}

.empty-album {
  margin-top: 40px;
  text-align: center;
}

.filter-group {
  display: flex;
  align-items: center;
  background-color: var(--td-bg-color-container);
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--td-component-stroke);
}

.filter-label {
  color: var(--td-text-color-primary);
  font-size: 14px;
  margin-right: 8px;
  white-space: nowrap;
}

:deep(.t-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.t-checkbox) {
  margin-right: 0;
}

:deep(.t-checkbox__label) {
  color: var(--td-text-color-primary);
  font-size: 14px;
}

:deep(.t-checkbox--checked) {
  color: var(--td-brand-color);
}

:deep(.t-checkbox:hover) {
  color: var(--td-brand-color-hover);
}

/* 上传弹窗样式 */
.upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.upload-group {
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.upload-drag-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  background-color: #fff;
  border: 1px dashed #e7e7e7;
  border-radius: 4px;
  transition: all 0.3s;
}

.upload-drag-area:hover {
  border-color: #0052d9;
  background-color: #f5f5f5;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.upload-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e7e7e7;
}

/* 自定义滚动条样式 */
.upload-content::-webkit-scrollbar {
  width: 6px;
}

.upload-content::-webkit-scrollbar-thumb {
  background-color: #e7e7e7;
  border-radius: 3px;
}

.upload-content::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 3px;
}

.upload-panels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-panel {
  border: 1px solid #e7e7e7;
  border-radius: 4px;
  padding: 12px;
  background-color: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.panel-header h5 {
  margin: 0;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>