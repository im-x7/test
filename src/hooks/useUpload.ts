import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

interface UploadParams {
  category: string
  title: string
  group?: string
  keywords?: string[]
}

export const useUploadHandlers = () => {
  const uploading = ref(false)
  const progress = ref(0)
  
  /**
   * 上传单个文件
   * @param file 文件对象
   * @param category 分类
   * @param title 标题
   */
  const uploadFile = async (file: Blob, category: string, title: string) => {
    if (!file) return
    
    try {
      uploading.value = true
      progress.value = 0
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('title', title)
      
      // 可选参数在这个简化版本中不再支持
      // 如果需要group和keywords，可以扩展函数参数
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += 10
        }
      }, 300)
      
      // 这里应该调用实际的API
      // const response = await api.uploadAlbumImage(formData)
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      clearInterval(progressInterval)
      progress.value = 100
      
      // 返回模拟的响应数据
      return {
        id: Math.floor(Math.random() * 1000),
        url: URL.createObjectURL(file),
        title: title,
        category: category,
        group: '',
        createTime: new Date().toISOString()
      }
    } catch (error) {
      console.error('上传失败:', error)
      MessagePlugin.error('上传失败，请重试')
      throw error
    } finally {
      uploading.value = false
    }
  }
  
  /**
   * 批量上传文件
   * @param files 文件列表
   * @param params 上传参数
   */
  const uploadMultipleFiles = async (files: Blob[], params: UploadParams) => {
    if (!files.length) return []
    
    try {
      uploading.value = true
      
      const results = await Promise.all(
        files.map(file => uploadFile(file, params.category, params.title))
      )
      
      return results.filter(Boolean)
    } catch (error) {
      console.error('批量上传失败:', error)
      MessagePlugin.error('批量上传失败，请重试')
      throw error
    } finally {
      uploading.value = false
    }
  }
  
  return {
    uploading,
    progress,
    uploadFile,
    uploadMultipleFiles
  }
}