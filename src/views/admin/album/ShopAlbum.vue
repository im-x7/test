<template>
  <div class="album-management">
    <h2>店铺相册</h2>
    
    <div class="operation-bar">
      <t-space>
        <div class="filter-group">
          <span class="filter-label">店铺：</span>
          <t-checkbox-group v-model="filters.shop" :options="shopOptions" />
        </div>
        <div class="filter-group">
          <span class="filter-label">分类：</span>
          <t-checkbox-group v-model="filters.category" :options="categoryOptions" />
        </div>
        <t-button theme="primary" @click="handleSearch">查询</t-button>
        <t-button @click="resetFilters">重置</t-button>
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
              <div class="image-thumbnail">
                <img 
                  :src="image.url" 
                  :alt="image.title"
                  @error="handleImageError($event)"
                  v-loading="imageLoading"
                  loading="lazy"
                >
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
              <div class="image-thumbnail">
                <img 
                  :src="image.url" 
                  :alt="image.title"
                  @error="handleImageError($event)"
                  v-loading="imageLoading"
                  loading="lazy"
                >
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
              <div class="image-thumbnail">
                <img 
                  :src="image.url" 
                  :alt="image.title"
                  @error="handleImageError($event)"
                  v-loading="imageLoading"
                  loading="lazy"
                >
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'


// 定义图片接口
interface AlbumImage {
  id: number
  title: string
  category: string
  group: string
  createTime: string
  keywords?: string[]
  url: string
  shopId: string
}

// 定义表格行数据接口
interface TableRow {
  title: string
  tattoo: AlbumImage[]
  cover: AlbumImage[]
  design: AlbumImage[]
  createTime: string
}

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

// 定义店铺数据

// 筛选条件
const filters = reactive({
  shop: [] as string[],
  category: [] as string[],
})

// 店铺选项
const shopOptions = ref([
  { label: '1', value: 'shop1', content: '店铺1' },
  { label: '2', value: 'shop2', content: '店铺2' },
  { label: '3', value: 'shop3', content: '店铺3' }
])

// 分类选项
const categoryOptions = ref([
  { label: 'graffiti_tattoo', value: 'graffiti_tattoo', content: '涂鸦背景纹身' },
  { label: 'black_tattoo', value: 'black_tattoo', content: '黑色背景纹身' },
  { label: 'graffiti_accessory', value: 'graffiti_accessory', content: '涂鸦背景饰品' },
  { label: 'black_accessory', value: 'black_accessory', content: '黑色背景饰品' }
])

// 表格列定义
const columns = [
  {
    colKey: 'title',
    title: '所属分类',
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

// 实时筛选逻辑
const filteredData = computed(() => {
  return albumData.value.filter(item => {
    const matchShop = filters.shop.length === 0 || filters.shop.includes(item.shopId)
    const matchCategory = filters.category.length === 0 || filters.category.includes(item.category) 
    return matchShop && matchCategory
  })
})

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

// 处理搜索
const handleSearch = () => {
  pagination.current = 1
}

// 处理分页变化
const onPageChange = (pageInfo: { current: number; pageSize: number }) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
}

// 处理删除组合
const handleDeleteGroup = (row: TableRow) => {
  // 实现删除逻辑
  console.log('删除组合:', row)
}

// 重置筛选条件
const resetFilters = () => {
  filters.shop = []
  filters.category = []
  pagination.current = 1
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
          title: '店铺展示-纹身照片-1',
          category: 'tattoo',
          group: '店铺展示',
          createTime: '2023-05-15 14:30:00',
          keywords: ['店铺', '展示'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          shopId: '1'
        },
        {
          id: 2,
          title: '店铺展示-纹身照片-2',
          category: 'tattoo',
          group: '店铺展示',
          createTime: '2023-05-15 14:35:00',
          keywords: ['店铺', '展示'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          shopId: '1'
        },
        {
          id: 3,
          title: '店铺环境-遮盖图-1',
          category: 'cover',
          group: '店铺环境',
          createTime: '2023-05-15 14:40:00',
          keywords: ['店铺', '环境'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          shopId: '1'
        },
        {
          id: 4,
          title: '店铺环境-设计图-1',
          category: 'design',
          group: '店铺环境',
          createTime: '2023-05-15 14:45:00',
          keywords: ['店铺', '环境'],
          url: 'https://img0.baidu.com/it/u=2028084904,3939052004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          shopId: '1'
        }
      ]
      
      pagination.total = albumData.value.length
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('获取相册数据失败:', error)
    MessagePlugin.error('获取相册数据失败')
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchAlbumData()
})

// 跳转到店铺相册管理页面
</script>

<style scoped>
.album-management {
  padding: 20px;
}

.operation-bar {
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
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
  transition: opacity 0.3s ease;
}

.image-error {
  object-fit: contain !important;
  background-color: #f5f5f5;
  padding: 5px;
  opacity: 0.8;
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
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .image-hover-overlay {
  opacity: 1;
}

.more-indicator {
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
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
</style>