<template>
  <t-dialog
    :visible="visible"
    title="纹身须知"
    width="800px"
    @confirm="saveSignature"
    @cancel="close"
  >
    <div class="disclaimer-content">
      <div class="disclaimer-header">
        <h2 class="title">免责协议</h2>
      </div>
      <div class="disclaimer-body">
        <p class="intro">本人在此声明并确认：</p>
        <ol>
          <li>本人已年满18岁，具有完全民事行为能力；</li>
          <li>本人理解纹身是一种永久性的身体改造，可能会带来一定的健康风险；</li>
          <li>本人确认没有任何可能影响纹身过程的健康问题或过敏史；</li>
          <li>本人同意遵守纹身师的所有指导和建议，包括纹身后的护理方法；</li>
          <li>本人理解纹身可能会引起疼痛、出血、感染等并发症，并自愿承担相关风险；</li>
          <li>本人同意纹身店不对因本人个人原因导致的任何不良后果承担责任；</li>
          <li>本人同意在纹身过程中和纹身后不会对纹身店和纹身师提出任何法律诉讼。</li>
        </ol>
      </div>
    </div>
    <div class="signature-area">
      <h3>请手写签名：</h3>
      <div class="canvas-container">
        <canvas
          ref="canvasRef"
          style="border: 1px solid #d9d9d9; border-radius: 4px; touch-action: none; cursor: crosshair; width: 100%; height: 200px; background-color: #fff;"
        ></canvas>
      </div>
      <div class="signature-actions">
        <a-button @click="clearSignature">清除签名</a-button>
        <a-button type="primary" @click="saveSignature" class="save-btn">确认保存</a-button>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SignaturePad from 'signature_pad';
import { MessagePlugin } from 'tdesign-vue-next';

const emit = defineEmits<{
  (e: 'signature-saved', signatureData: string): void
}>();

const visible = ref(false);
const signaturePad = ref<SignaturePad | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const clearSignature = () => {
  signaturePad.value?.clear();
};

const saveSignature = () => {
  if (!signaturePad.value?.isEmpty()) {
    const signatureData = signaturePad.value?.toDataURL();
    emit('signature-saved', signatureData as string);
    MessagePlugin.success('签名保存成功');
    visible.value = false;
  } else {
    MessagePlugin.warning('请先完成签名');
  }
};

// 初始化 SignaturePad
const initSignaturePad = () => {
  const canvasElement = canvasRef.value;
  if (!canvasElement) return;
  
  // 获取容器宽度
  const container = canvasElement.parentElement;
  if (!container) return;
  
  const containerWidth = container.clientWidth;
  const containerHeight = 200; // 固定高度
  
  // 设置显示尺寸
  canvasElement.style.width = `${containerWidth}px`;
  canvasElement.style.height = `${containerHeight}px`;
  
  // 设置实际尺寸（考虑设备像素比）
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvasElement.width = containerWidth * ratio;
  canvasElement.height = containerHeight * ratio;
  
  const context = canvasElement.getContext('2d');
  if (context) {
    // 缩放绘图上下文以匹配设备像素比
    context.scale(ratio, ratio);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
  }

  try {
    // 销毁旧的实例
    if (signaturePad.value) {
      signaturePad.value.off();
    }
    
    // 创建新的SignaturePad实例
    signaturePad.value = new SignaturePad(canvasElement, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      velocityFilterWeight: 0.7,
      minWidth: 1,
      maxWidth: 3,
      throttle: 16,
    });
    
    console.log('SignaturePad initialized:', signaturePad.value);
    
  } catch (error) {
    console.error('SignaturePad initialization error:', error);
  }
};

// 监听 Modal 显示状态

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', initSignaturePad);
  
  return () => {
    window.removeEventListener('resize', initSignaturePad);
  };
});

const open = () => {
  visible.value = true;
  // Modal 打开时也初始化，使用requestAnimationFrame替代setTimeout
  scheduleVisualUpdate(() => {
    initSignaturePad();
  });
};

const close = () => {
  visible.value = false;
};

defineExpose({
  open,
  close
});

function scheduleVisualUpdate(arg0: () => void) {
  throw new Error('Function not implemented.');
}
</script>

<style scoped>
.disclaimer-content {
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.8;
}

.disclaimer-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.disclaimer-body {
  padding: 0 20px;
}

.intro {
  margin-bottom: 16px;
  font-weight: 500;
}

.disclaimer-content ol {
  padding-left: 24px;
  margin: 0;
}

.disclaimer-content li {
  margin-bottom: 12px;
  text-align: justify;
  line-height: 1.8;
}

.signature-area {
  margin-top: 32px;
}

.signature-area h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.canvas-container {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  margin: 0 auto 24px;
}

.signature-actions {
  margin-top: 24px;
  text-align: right;
}

.save-btn {
  margin-left: 24px;
}
</style>