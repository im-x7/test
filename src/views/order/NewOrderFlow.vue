<template>
  <div class="new-order-flow">
    <div class="page-header-container">
      <t-breadcrumb>
        <t-breadcrumb-item @click="goBack">返回</t-breadcrumb-item>
        <t-breadcrumb-item>创建服务</t-breadcrumb-item>
      </t-breadcrumb>
      <h2 class="page-title">创建服务</h2>
      <p class="page-subtitle">创建新的客户服务</p>
    </div>
    
    <t-card :bordered="false">
      <!-- 步骤条 -->
      <t-steps :current="currentStep" size="small" style="margin-bottom: 24px;">
        <t-step-item title="选择服务" />
        <t-step-item v-if="formData.serviceType === 'electronic'" title="电子服务预约" />
        <t-step-item v-if="formData.serviceType === 'electronic'" title="收款" />
        <template v-else-if="formData.serviceType === 'tattoo' || formData.serviceType === 'piercing'">
          <t-step-item title="客户类型" />
          <t-step-item title="签署协议" />
          <t-step-item title="客户信息" />
          <t-step-item title="店铺信息" />
        </template>
        <template v-else>
          <t-step-item title="签署协议" />
          <t-step-item title="客户信息" />
          <t-step-item title="店铺信息" />
        </template>
      </t-steps>
      
      <!-- 步骤1: 选择服务类型 -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>请选择服务类型</h3>
        <div class="service-selection">
          <div 
            class="service-card" 
            :class="{ 'selected': formData.serviceType === 'tattoo' }"
            @click="formData.serviceType = 'tattoo'"
          >
            <div class="service-option">
              <div class="service-icon">
                <TattooIcon />
              </div>
              <div class="service-name">纹身服务</div>
              <div class="service-desc">专业纹身设计与施工，个性化定制服务</div>
            </div>
          </div>
          <div 
            class="service-card" 
            :class="{ 'selected': formData.serviceType === 'piercing' }"
            @click="formData.serviceType = 'piercing'"
          >
            <div class="service-option">
              <div class="service-icon">
                <PiercingIcon />
              </div>
              <div class="service-name">穿孔服务</div>
              <div class="service-desc">安全专业的穿孔服务，多种部位可选</div>
            </div>
          </div>
          <div 
            class="service-card" 
            :class="{ 'selected': formData.serviceType === 'electronic' }"
            @click="formData.serviceType = 'electronic'"
          >
            <div class="service-option">
              <div class="service-icon">
                <ElectronicIcon />
              </div>
              <div class="service-name">电子服务</div>
              <div class="service-desc">专业电子产品维修与定制服务</div>
            </div>
          </div>
        </div>
        <div class="step-actions">
          <t-button theme="primary" @click="nextStep" :disabled="!formData.serviceType">下一步</t-button>
        </div>
      </div>
      
      <!-- 步骤2: 电子服务预约 -->
      <div v-if="formData.serviceType === 'electronic'" class="step-content">
        <template v-if="currentStep === 1">
          <h3>电子服务预约</h3>
          <t-form 
            ref="electronicFormRef"
            :data="formData.electronic" 
            :rules="electronicRules" 
            :label-width="120"
          >
            <t-form-item label="服务类型" name="type">
              <div class="staff-grid">
                <t-space wrap>
                  <div
                    v-for="option in serviceTypeOptions"
                    :key="option.value"
                    class="staff-item"
                    :class="{ 'selected': formData.electronic.type === option.value }"
                    @click="formData.electronic.type = option.value"
                  >
                    <div class="staff-item__content">
                      <div class="staff-item__name">{{ option.label }}</div>
                    </div>
                  </div>
                </t-space>
              </div>
            </t-form-item>
            
            <t-form-item label="店铺" name="shop">
              <div class="shop-grid">
                <t-space>
                  <div
                    v-for="shop in electronicShops"
                    :key="shop.id"
                    class="shop-item"
                    :class="{ 'selected': formData.electronic.shop === shop.id }"
                    @click="handleElectronicShopSelect(shop.id)"
                  >
                    <div class="shop-item__content">
                      <div class="shop-item__name">{{ shop.name }}</div>
                      <div class="shop-item__address">
                        <t-icon name="location" />
                        <span>{{ shop.address }}</span>
                      </div>
                    </div>
                  </div>
                </t-space>
              </div>
            </t-form-item>
            
            <t-form-item label="接待员工" name="receptionists">
              <div class="staff-grid">
                <t-space wrap>
                  <div
                    v-for="option in filteredEmployeeOptions"
                    :key="option.value"
                    class="staff-item"
                    :class="{ 'selected': formData.electronic.receptionists[0] === option.value }"
                    @click="selectReceptionist(option.value)"
                  >
                    <div class="staff-item__content">
                      <div class="staff-item__name">{{ option.label }}</div>
                    </div>
                  </div>
                </t-space>
              </div>
              <t-empty v-if="!formData.electronic.shop" description="请先选择店铺" />
              <t-empty v-else-if="filteredEmployeeOptions.length === 0" description="该店铺暂无接待员" />
            </t-form-item>
            
            <t-form-item label="区域" name="area">
              <div class="staff-grid">
                <t-space wrap>
                  <div
                    v-for="option in areaOptions"
                    :key="option.value"
                    class="staff-item"
                    :class="{ 'selected': formData.electronic.area === option.value }"
                    @click="formData.electronic.area = option.value"
                  >
                    <div class="staff-item__content">
                      <div class="staff-item__name">{{ option.label }}</div>
                    </div>
                  </div>
                </t-space>
              </div>
            </t-form-item>
            
            <t-form-item label="电话客服" name="phoneService">
              <div class="staff-grid">
                <t-space wrap>
                  <div
                    v-for="option in phoneServiceOptions"
                    :key="option.value"
                    class="staff-item"
                    :class="{ 'selected': formData.electronic.phoneService === option.value }"
                    @click="formData.electronic.phoneService = option.value"
                  >
                    <div class="staff-item__content">
                      <div class="staff-item__name">{{ option.label }}</div>
                    </div>
                  </div>
                </t-space>
              </div>
              <t-empty v-if="!formData.electronic.shop" description="请先选择店铺" />
              <t-empty v-else-if="phoneServiceOptions.length === 0" description="该店铺暂无员工" />
            </t-form-item>
            
            <t-form-item label="留店员工" name="phoneRecord">
              <div class="staff-grid">
                <t-space wrap>
                  <div
                    v-for="option in filteredEmployeeOptions"
                    :key="option.value"
                    class="staff-item"
                    :class="{ 'selected': formData.electronic.phoneRecord === option.value }"
                    @click="formData.electronic.phoneRecord = option.value"
                  >
                    <div class="staff-item__content">
                      <div class="staff-item__name">{{ option.label }}</div>
                    </div>
                  </div>
                </t-space>
              </div>
              <t-empty v-if="!formData.electronic.shop" description="请先选择店铺" />
              <t-empty v-else-if="filteredEmployeeOptions.length === 0" description="该店铺暂无员工" />
            </t-form-item>
            
            <t-form-item label="预约时间" name="appointmentTime">
              <t-date-picker
                v-model="formData.electronic.appointmentTime"
                mode="date"
                enableTimePicker
                placeholder="请选择预约时间"
              />
            </t-form-item>
            
            <t-form-item label="到店时间" name="arrivalTime">
              <t-date-picker
                v-model="formData.electronic.arrivalTime"
                mode="date"
                enableTimePicker
                placeholder="请选择到店时间"
              />
            </t-form-item>
            
            <t-form-item label="客户贵姓" name="customerName">
              <t-input v-model="formData.electronic.customerName" placeholder="请输入客户姓名" />
            </t-form-item>
            
            <t-form-item label="预约电话" name="phone">
              <t-input v-model="formData.electronic.phone" placeholder="请输入预约电话" />
            </t-form-item>
          </t-form>
          
          <div class="step-actions">
            <t-button variant="outline" style="margin-right: 8px" @click="prevStep">上一步</t-button>
            <t-button theme="primary" @click="validateElectronicAndNext">下一步</t-button>
          </div>
        </template>
      </div>
      
      <!-- 步骤2: 选择客户类型（纹身/穿孔服务） -->
      <div v-else-if="formData.serviceType === 'tattoo' || formData.serviceType === 'piercing'" class="step-content">
        <template v-if="currentStep === 1">
          <h3>请选择客户类型</h3>
          <div class="customer-type-selection">
            <div 
              class="customer-type-card" 
              :class="{ 'selected': formData.customerType === 'new' }"
              @click="selectCustomerType('new')"
            >
              <div class="customer-type-option">
                <div class="customer-type-icon">
                  <t-icon name="user-add" />
                </div>
                <div class="customer-type-name">新客户</div>
                <div class="customer-type-desc">首次到店的客户，需要签署免责协议</div>
              </div>
            </div>
            <div 
              class="customer-type-card" 
              :class="{ 'selected': formData.customerType === 'old' }"
              @click="selectCustomerType('old')"
            >
              <div class="customer-type-option">
                <div class="customer-type-icon">
                  <t-icon name="user" />
                </div>
                <div class="customer-type-name">老客户</div>
                <div class="customer-type-desc">已有服务记录的客户</div>
              </div>
            </div>
          </div>
          <div class="step-actions">
            <t-button variant="outline" style="margin-right: 8px" @click="prevStep">上一步</t-button>
            <t-button theme="primary" @click="handleCustomerTypeNext" :disabled="!formData.customerType">下一步</t-button>
          </div>
        </template>
      </div>
      
      <!-- 步骤2.5: 老客户搜索 -->
      <div v-if="currentStep === 1.5" class="step-content">
        <h3>搜索老客户</h3>
        <div class="search-container">
          <t-space direction="vertical" style="width: 100%">
            <t-input-group>
              <t-input
                v-model="searchQuery"
                placeholder="请输入客户手机号或姓名"
                style="width: 300px"
                @keyup.enter.prevent="searchCustomer"
                clearable
              />
              <t-button @click="searchCustomer" :loading="searching">
                <template #icon><t-icon name="search" /></template>
                搜索
              </t-button>
            </t-input-group>

            <!-- 搜索结果列表 -->
            <div v-if="searchResults.length > 0" class="search-results">
              <t-table
                :data="searchResults"
                :columns="customerColumns"
                row-key="id"
                hover
                @row-click="handleRowClick"
              >
                <template #cell-name="{ row }">
                  <div class="customer-name">{{ row.name }}</div>
                </template>
              </t-table>
            </div>

            <!-- 无搜索结果时显示 -->
            <t-empty v-else-if="hasSearched" description="未找到相关客户">
              <template #extra>
                <t-button @click="handleCreateNewCustomer">新建客户</t-button>
              </template>
            </t-empty>
          </t-space>
        </div>
        <div class="step-actions">
          <t-button variant="outline" style="margin-right: 8px" @click="prevStep">上一步</t-button>
        </div>
      </div>
      
      <!-- 步骤3: 签署免责协议 -->
      <div v-if="currentStep === 2 && formData.serviceType !== 'electronic'" class="step-content">
        <h3>免责协议签署</h3>
        <p>请仔细阅读并签署以下免责协议：</p>
        
        <div class="disclaimer-content">
          <div class="disclaimer-header">
            <h2 class="title">免责协议</h2>
          </div>
          <div class="disclaimer-body">
            <p class="intro">本人在此声明并确认：</p>
            <ol>
              <li>本人已年满18岁，具有完全民事行为能力；</li>
              <li>本人理解{{ formData.serviceType === 'tattoo' ? '纹身' : '穿孔' }}是一种永久性的身体改造，可能会带来一定的健康风险；</li>
              <li>本人确认没有任何可能影响{{ formData.serviceType === 'tattoo' ? '纹身' : '穿孔' }}过程的健康问题或过敏史；</li>
              <li>本人同意遵守{{ formData.serviceType === 'tattoo' ? '纹身师' : '技师' }}的所有指导和建议，包括{{ formData.serviceType === 'tattoo' ? '纹身' : '穿孔' }}后的护理方法；</li>
              <li>本人理解{{ formData.serviceType === 'tattoo' ? '纹身' : '穿孔' }}可能会引起疼痛、出血、感染等并发症，并自愿承担相关风险；</li>
              <li>本人同意店铺不对因本人个人原因导致的任何不良后果承担责任；</li>
              <li>本人同意在{{ formData.serviceType === 'tattoo' ? '纹身' : '穿孔' }}过程中和之后不会对店铺和技师提出任何法律诉讼。</li>
            </ol>
          </div>
        </div>
        
        <!-- 签名区域 -->
        <div class="signature-area">
          <h3>请手写签名：</h3>
          <div class="canvas-container">
            <canvas
              ref="canvasRef"
              @mousedown="onCanvasMouseDown"
              @touchstart="onCanvasTouchStart"
              style="border: 1px solid #d9d9d9; border-radius: 4px; touch-action: none; cursor: crosshair; width: 100%; height: 200px; background-color: #fff;"
            ></canvas>
          </div>
          <div class="signature-actions">
            <t-space>
              <t-button @click="clearSignature">清除签名</t-button>
              <t-button theme="primary" @click="resizeCanvas">重置画布</t-button>
            </t-space>
          </div>
        </div>
        
        <!-- 视频录制区域 -->
        <div class="video-record-area">
          <h3>录制视频（选填）</h3>
          <div class="video-container">
            <video ref="videoPreview" v-if="videoStream" autoplay muted style="width: 100%; max-width: 400px;"></video>
            <div v-else class="video-placeholder">
              <t-icon name="video" />
              <p>点击开始录制</p>
            </div>
          </div>
          <div class="video-actions">
            <t-space>
              <t-button v-if="!isRecording && !recordedVideo" @click="startRecording">
                <template #icon><t-icon name="video" /></template>
                开始录制
              </t-button>
              <t-button v-if="isRecording" theme="danger" @click="stopRecording">
                <template #icon><t-icon name="stop-circle" /></template>
                停止录制
              </t-button>
              <t-button v-if="recordedVideo" variant="outline" @click="reRecording">
                <template #icon><t-icon name="refresh" /></template>
                重新录制
              </t-button>
            </t-space>
          </div>
        </div>
        
        <div class="step-actions">
          <t-space>
            <t-button variant="outline" @click="prevStep">上一步</t-button>
            <t-button variant="outline" theme="warning" @click="skipSignature">跳过签署</t-button>
            <t-button theme="primary" @click="saveSignatureAndNext" :disabled="!formData.signatureData">下一步</t-button>
          </t-space>
        </div>
      </div>
      
      <!-- 步骤4: 客户信息 -->
      <div v-if="currentStep === 3" class="step-content">
        <h3>客户信息</h3>
        <t-form 
          ref="customerFormRef"
          :data="formData.customer" 
          :rules="customerRules" 
          :label-width="120"
        >
          <t-form-item label="客户名称" name="name">
            <t-input v-model="formData.customer.name" placeholder="请输入客户名称" />
          </t-form-item>
          
          <t-form-item label="性别" name="gender">
            <t-radio-group v-model="formData.customer.gender">
              <t-radio value="male">男</t-radio>
              <t-radio value="female">女</t-radio>
            </t-radio-group>
          </t-form-item>
          
          <t-form-item label="微信号码" name="wechat">
            <t-input v-model="formData.customer.wechat" placeholder="请输入微信号码" />
          </t-form-item>
          
          <t-form-item label="手机号码" name="phone">
            <t-input v-model="formData.customer.phone" placeholder="请输入手机号码" />
          </t-form-item>
          
          <t-form-item label="备注" name="remark">
            <t-textarea v-model="formData.customer.remark" :rows="4" placeholder="请输入备注信息" />
          </t-form-item>
        </t-form>
        
        <div class="step-actions">
          <t-button variant="outline" style="margin-right: 8px" @click="prevStep">上一步</t-button>
          <t-button theme="primary" @click="validateCustomerAndNext">下一步</t-button>
        </div>
      </div>
      
      <!-- 步骤5: 店铺信息 -->
      <div v-show="currentStep === 4" class="shop-selection-step">
        <t-card title="店铺与服务人员" bordered>
          <t-loading :loading="loadingShops">
            <t-space direction="vertical" size="large" style="width: 100%">
              <!-- 店铺选择 -->
              <t-form-item label="选择店铺" required>
                <div class="shop-grid">
                  <t-space>
                    <div
                      v-for="shop in openShops"
                      :key="shop.id"
                      class="shop-item"
                      :class="{ 'selected': formData.shopId === shop.id.toString() }"
                      @click="handleShopSelect(shop.id.toString())"
                    >
                      <div class="shop-item__content">
                        <div class="shop-item__name">{{ shop.name }}</div>
                        <div class="shop-item__address">
                          <t-icon name="location" />
                          <span>{{ shop.address }}</span>
                        </div>
                      </div>
                    </div>
                  </t-space>
                </div>
              </t-form-item>

              <!-- 员工选择 -->
              <t-form-item label="选择服务人员" required>
                <div class="staff-grid" v-if="formData.shopId">
                  <t-space>
                    <div
                      v-for="employee in storeEmployees"
                      :key="employee.id"
                      class="staff-item"
                      :class="{ 'selected': formData.staffId === employee.id }"
                      @click="formData.staffId = employee.id"
                    >
                      <div class="staff-item__content">
                        <div class="staff-item__name">{{ employee.name }}</div>
                      </div>
                    </div>
                  </t-space>
                </div>
                <t-empty v-else description="请先选择店铺" />
              </t-form-item>

              <!-- 店铺二维码 -->
              <t-form-item v-if="formData.shopId" label="店铺二维码">
                <div class="qr-code-container">
                  <img :src="getShopWechatQR(formData.shopId)" alt="店铺微信二维码" class="shop-qr-code" />
                  <t-typography>扫码关注店铺公众号</t-typography>
                </div>
              </t-form-item>

              <!-- 创建订单按钮 -->
              <div class="step-actions">
                <t-button variant="outline" style="margin-right: 8px" @click="prevStep">上一步</t-button>
                <t-button theme="primary" :loading="submitting" :disabled="!canComplete" @click="handleCreateOrder">
                  创建服务订单
                </t-button>
              </div>
            </t-space>
          </t-loading>
        </t-card>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import SignaturePad from 'signature_pad';
import { scheduleVisualUpdate } from '@/utils/performanceUtils';
// 从本地组件目录导入图标组件
import TattooIcon from '@/components/icons/TattooIcon.vue';
import PiercingIcon from '@/components/icons/PiercingIcon.vue';
import ElectronicIcon from '@/components/icons/ElectronicIcon.vue';

// 引入员工数据
import { getEmployeeNameById } from '@/constants/employees';

// 定义店铺员工接口
interface StoreEmployee {
  id: string;
  name: string;
  position: string;
}

// 定义店铺接口
interface Shop {
  id: number;
  name: string;
  address: string;
  status: 'open' | 'closed';
}

const router = useRouter();
const currentStep = ref(0);
const signaturePad = ref<SignaturePad | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const customerFormRef = ref();

// 视频录制相关的变量
const videoStream = ref<MediaStream | null>(null);
const videoPreview = ref<HTMLVideoElement | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const isRecording = ref(false);
const recordedVideo = ref<Blob | null>(null);
const recordedChunks: BlobPart[] = [];

// 店铺相关状态
const shops = ref<Shop[]>([]);
const storeEmployees = ref<StoreEmployee[]>([]);
const loadingStaff = ref(false);

// 表单数据
const formData = reactive({
  serviceType: '',
  customerType: '',
  signatureData: '',
  videoData: null as Blob | null,
  shopId: '',
  staffId: '',
  customer: {
    clientId: '',
    name: '',
    wechat: '',
    phone: '',
    remark: '',
    gender: 'male'
  },
  electronic: {
    type: 'day',
    shop: 'nanshan',
    area: '',
    phoneService: '',
    phoneRecord: '',
    appointmentTime: '',
    arrivalTime: '',
    customerName: '',
    phone: '',
    receptionists: [] as string[]
  }
});

// 客户表单验证规则
const customerRules = {
  name: [{ required: true, message: '请输入客户名称', type: 'error' }],
  gender: [{ required: true, message: '请选择性别', type: 'error' }],
  wechat: [{ required: true, message: '请输入微信号码', type: 'error' }],
  phone: [
    { required: true, message: '请输入手机号码', type: 'error' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', type: 'error' }
  ]
};

// 电子服务表单验证规则
const electronicRules = {
  area: [{ required: true, message: '请选择区域', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  arrivalTime: [{ required: true, message: '请选择到店时间', trigger: 'change' }],
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
};

const electronicFormRef = ref();

// 定义客户数据类型
interface Customer {
  id: number;
  name: string;
  phone: string;
  wechat: string;
  lastVisit: string;
}

// 客户搜索相关
const searchQuery = ref('');
const searching = ref(false);
const searchResults = ref<Customer[]>([]);
const hasSearched = ref(false);

// 客户表格列定义
const customerColumns = [
  { colKey: 'name', title: '姓名', width: 120 },
  { colKey: 'phone', title: '手机号码', width: 150 },
  { colKey: 'wechat', title: '微信号', width: 150 },
  { colKey: 'lastVisit', title: '上次到店时间', width: 180 },
];

// 返回上一页
const goBack = () => {
  router.back();
};

// 步骤控制
const nextStep = () => {
  if (currentStep.value === 0) {
    // 如果是第一步，根据服务类型设置下一步
    if (formData.serviceType === 'electronic') {
      currentStep.value = 1; // 电子服务预约
    } else if (formData.serviceType === 'tattoo' || formData.serviceType === 'piercing') {
      currentStep.value = 1; // 客户类型
    } else {
      currentStep.value = 2; // 签署协议
    }
  } else {
    currentStep.value++;
  }
  
  // 如果进入签名步骤，且不是电子服务，则初始化签名板
  if (currentStep.value === 2 && formData.serviceType !== 'electronic') {
    nextTick(() => {
      initSignaturePad();
    });
  }
};

const prevStep = () => {
  if (currentStep.value === 1 && formData.serviceType === 'electronic') {
    currentStep.value = 0; // 返回选择服务
  } else if (currentStep.value === 2 && formData.serviceType !== 'electronic') {
    currentStep.value = 1; // 返回客户类型
  } else {
    currentStep.value--;
  }
  
  // 如果返回到签名步骤，且不是电子服务，则重新初始化签名板
  if (currentStep.value === 2 && formData.serviceType !== 'electronic') {
    nextTick(() => {
      initSignaturePad();
    });
  }
};

// 初始化签名板
const initSignaturePad = () => {
  const canvasElement = canvasRef.value;
  if (!canvasElement) return;
  
  // 获取容器宽度
  const container = canvasElement.parentElement;
  if (!container) return;
  
  // 设置实际尺寸（考虑设备像素比）
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const containerWidth = container.clientWidth;
  const containerHeight = 200; // 固定高度
  
  // 设置canvas的实际尺寸
  canvasElement.width = containerWidth * ratio;
  canvasElement.height = containerHeight * ratio;
  
  // 设置显示尺寸
  canvasElement.style.width = `${containerWidth}px`;
  canvasElement.style.height = `${containerHeight}px`;
  
  const context = canvasElement.getContext('2d');
  if (!context) return;
  
  // 缩放绘图上下文以匹配设备像素比
  context.scale(ratio, ratio);
  
  // 确保在重新初始化前销毁旧的实例
  if (signaturePad.value) {
    signaturePad.value.off();
    signaturePad.value = null;
  }
  
  try {
    // 创建新的SignaturePad实例
    signaturePad.value = new SignaturePad(canvasElement, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      velocityFilterWeight: 0.7,
      minWidth: 0.5,
      maxWidth: 2.5,
      throttle: 16
    });

    // 添加事件监听以更新按钮状态
    signaturePad.value.addEventListener('endStroke', () => {
      if (signaturePad.value && !signaturePad.value.isEmpty()) {
        formData.signatureData = signaturePad.value.toDataURL('image/png');
      }
    });

    // 重置签名数据
    formData.signatureData = '';
  } catch (error) {
    console.error('SignaturePad initialization error:', error);
    MessagePlugin.error('签名板初始化失败，请刷新页面重试');
  }
};

// 监听步骤变化，确保在进入签名步骤时初始化画布
watch(() => currentStep.value, (newStep) => {
  if (newStep === 2 && formData.serviceType !== 'electronic') {
    nextTick(() => {
      initSignaturePad();
    });
  }
}, { immediate: true });

// 组件挂载时添加窗口大小变化监听
onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  // 如果当前是签名步骤，初始化画布
  if (currentStep.value === 2 && formData.serviceType !== 'electronic') {
    nextTick(() => {
      initSignaturePad();
    });
  }
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop());
  }
  // 清理签名板实例
  if (signaturePad.value) {
    signaturePad.value.off();
    signaturePad.value = null;
  }
});

// 处理画布大小调整
const resizeCanvas = () => {
  nextTick(() => {
    initSignaturePad();
  });
};

// 处理鼠标事件
const onCanvasMouseDown = (event: MouseEvent) => {
  event.preventDefault();
};

// 处理触摸事件
const onCanvasTouchStart = (event: TouchEvent) => {
  event.preventDefault();
};

// 清除签名
const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear();
    formData.signatureData = '';
  }
};

// 保存签名并进入下一步
const saveSignatureAndNext = () => {
  if (!signaturePad.value || signaturePad.value.isEmpty()) {
    MessagePlugin.warning('请先完成签名');
    return;
  }

  try {
    formData.signatureData = signaturePad.value.toDataURL('image/png');
    MessagePlugin.success('签名已保存');
    
    // 如果是老客户，签署协议后直接跳转到店铺选择
    if (formData.customerType === 'old') {
      currentStep.value = 4;
    } else {
      // 新客户继续填写客户信息
      currentStep.value = 3;
    }
  } catch (error) {
    console.error('保存签名失败:', error);
    MessagePlugin.error('保存签名失败，请重试');
  }
};

// 验证客户信息并进入下一步
const validateCustomerAndNext = () => {
  customerFormRef.value.validate().then(() => {
    nextStep();
  }).catch(() => {
    MessagePlugin.error('请完善客户信息');
  });
};

// 验证电子服务表单并保存
const validateElectronicAndNext = () => {
  if (!electronicFormRef.value) return;
  
  electronicFormRef.value.validate().then(() => {
    // 将电子服务表单中的客户信息同步到客户表单
    formData.customer.name = formData.electronic.customerName;
    formData.customer.phone = formData.electronic.phone;
    
    // 获取接待员名称列表用于显示
    const receptionistNames = formData.electronic.receptionists.map(id => 
      getEmployeeNameById(id)
    ).join(', ');
    
    // 保存电子服务表单并跳转到收款管理列表页面
    MessagePlugin.success(`电子服务预约已保存，接待员: ${receptionistNames || '无'}`);
    router.push('/payment/list');
  }).catch(() => {
    MessagePlugin.error('请完善电子服务信息');
  });
};

// 获取店铺二维码
const getShopWechatQR = (shopId: string) => {
  const shop = shops.value.find(s => s.id.toString() === shopId);
  if (!shop) return '';
  // 这里使用模拟的二维码图片URL，实际项目中应该返回真实的店铺二维码图片URL
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${shop.name}_WeChat_QR_Code`)}`
};

// 加载店铺数据
const loadingShops = ref(false);
const fetchShops = () => {
  loadingShops.value = true;
  
  // 模拟店铺数据
  const mockShops: Shop[] = [
    { 
      id: 1, 
      name: '北京店',
      address: '北京市朝阳区xxx街xxx号',
      status: 'open'
    },
    { 
      id: 2, 
      name: '上海店',
      address: '上海市浦东新区xxx路xxx号',
      status: 'closed'
    },
    { 
      id: 3, 
      name: '广州店',
      address: '广州市天河区xxx道xxx号',
      status: 'open'
    }
  ];

  // 使用scheduleVisualUpdate更新UI
  scheduleVisualUpdate(() => {
    shops.value = mockShops;
    loadingShops.value = false;
  });
};

// 获取店铺员工
const fetchStoreEmployees = async () => {
  loadingStaff.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    storeEmployees.value = [
      { id: '1', name: '张三', position: '资深纹身师' },
      { id: '2', name: '李四', position: '高级纹身师' },
      { id: '3', name: '王五', position: '初级纹身师' }
    ];
  } catch (error) {
    console.error('获取店铺员工失败:', error);
    MessagePlugin.error('获取店铺员工失败');
  } finally {
    loadingStaff.value = false;
  }
};

// 处理店铺选择
const handleShopSelect = (shopId: string) => {
  formData.shopId = shopId;
  formData.staffId = ''; // 清空已选员工
  fetchStoreEmployees(); 
};

// 在进入店铺选择步骤时加载店铺数据
watch(() => currentStep.value, (newStep: number) => {
  if (newStep === 4) {
    fetchShops();
  }
});

// 选择客户类型
const selectCustomerType = (type: 'new' | 'old') => {
  formData.customerType = type;
};

// 处理客户类型选择后的下一步
const handleCustomerTypeNext = () => {
  if (formData.customerType === 'old') {
    currentStep.value = 1.5; // 进入老客户搜索步骤
  } else {
    currentStep.value = 2; // 进入协议签署步骤
  }
};

// 视频录制相关方法
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoStream.value = stream;
    if (videoPreview.value) {
      videoPreview.value.srcObject = stream;
    }
    
    mediaRecorder.value = new MediaRecorder(stream);
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedVideo.value = blob;
      formData.videoData = blob;
      if (videoPreview.value) {
        videoPreview.value.src = URL.createObjectURL(blob);
      }
    };
    
    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (error) {
    console.error('无法访问摄像头:', error);
    MessagePlugin.error('无法访问摄像头，请确保已授予权限');
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
    if (videoStream.value) {
      videoStream.value.getTracks().forEach(track => track.stop());
    }
  }
};

const reRecording = () => {
  recordedVideo.value = null;
  formData.videoData = null;
  recordedChunks.length = 0;
  if (videoPreview.value) {
    videoPreview.value.src = '';
  }
  startRecording();
};

// 搜索客户
const searchCustomer = async () => {
  try {
    if (!searchQuery.value || !searchQuery.value.trim()) {
      MessagePlugin.warning('请输入搜索内容');
      return;
    }

    searching.value = true;
    hasSearched.value = true;

    // 这里模拟API调用，实际项目中应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟搜索结果
    const mockResults = [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        wechat: 'zhangsan123',
        lastVisit: '2024-03-15 14:30:00'
      },
      {
        id: 2,
        name: '李四',
        phone: '13900139000',
        wechat: 'lisi456',
        lastVisit: '2024-03-10 16:20:00'
      }
    ];

    // 优化搜索逻辑
    const searchTerm = searchQuery.value.trim().toLowerCase();
    const filteredResults = mockResults.filter(customer => {
      const nameMatch = customer.name?.toLowerCase().includes(searchTerm) ?? false;
      const phoneMatch = customer.phone?.includes(searchTerm) ?? false;
      return nameMatch || phoneMatch;
    });
    
    searchResults.value = filteredResults;
  } catch (error) {
    console.error('搜索客户失败:', error);
    MessagePlugin.error('搜索失败，请重试');
  } finally {
    searching.value = false;
  }
};

// 处理表格行点击
const handleRowClick = ({ row }: { row: Customer }) => {
  selectCustomer(row);
};

// 选择客户
const selectCustomer = (row: Customer) => {
  try {
    if (!row || typeof row.id === 'undefined') {
      MessagePlugin.error('客户信息无效');
      return;
    }

    // 将选中的客户信息填充到表单中
    formData.customer = {
      clientId: String(row.id),
      name: row.name || '',
      wechat: row.wechat || '',
      phone: row.phone || '',
      remark: '',
      gender: 'male'
    };
    
    // 进入协议签署步骤
    currentStep.value = 2;
    MessagePlugin.success('已选择客户，请签署协议');
  } catch (error) {
    console.error('处理客户数据时出错:', error);
    MessagePlugin.error('选择客户失败，请重试');
  }
};

// 处理新建客户
const handleCreateNewCustomer = () => {
  // 重置客户信息
  formData.customer = {
    clientId: '',
    name: '',
    wechat: '',
    phone: '',
    remark: '',
    gender: 'male'
  };
  // 进入客户信息填写步骤
  currentStep.value = 3;
};

// 员工选项

// 只展示营业中的店铺
const openShops = computed(() => {
  return shops.value.filter(shop => shop.status === 'open');
});

// 提交状态
const submitting = ref(false);

// 判断是否可以完成订单创建
const canComplete = computed(() => {
  return formData.shopId && formData.staffId;
});

// 处理创建订单
const handleCreateOrder = async () => {
  if (!canComplete.value) {
    MessagePlugin.warning('请选择店铺和服务人员');
    return;
  }

  try {
    submitting.value = true;
    
    // 构建订单数据
    const orderData = {
      serviceType: formData.serviceType,
      customerType: formData.customerType,
      customer: formData.customer,
      shopId: formData.shopId,
      staffId: formData.staffId,
      signatureData: formData.signatureData,
      videoData: formData.videoData
    };

    // 模拟API调用
    await new Promise((resolve) => {
      console.log('创建订单:', orderData);
      setTimeout(resolve, 1000);
    });
    
    MessagePlugin.success('服务订单创建成功');
    // 跳转到收款管理列表页面
    router.push('/payment/list');
  } catch (error) {
    console.error('创建订单失败:', error);
    MessagePlugin.error('创建订单失败，请重试');
  } finally {
    submitting.value = false;
  }
};

// 电子服务店铺数据
const electronicShops = [
  { id: 'nanshan', name: '南山店', address: '深圳市南山区xxx路xxx号' },
  { id: 'other', name: '其他店', address: '深圳市其他区域' }
];

// 按店铺筛选的员工选项
const filteredEmployeeOptions = computed(() => {
  if (!formData.electronic.shop) return [];
  
  // 模拟不同店铺的员工数据
  const shopEmployees = {
    nanshan: [
      { value: '1', label: '张三' },
      { value: '2', label: '李四' },
      { value: '3', label: '王五' }
    ],
    other: [
      { value: '4', label: '赵六' },
      { value: '5', label: '钱七' },
      { value: '6', label: '孙八' }
    ]
  };
  
  return shopEmployees[formData.electronic.shop as keyof typeof shopEmployees] || [];
});

// 选择接待员（单选项）
const selectReceptionist = (value: string) => {
  formData.electronic.receptionists = [value];
};

// 处理店铺选择
const handleElectronicShopSelect = (shopId: string) => {
  formData.electronic.shop = shopId;
  // 清空已选择的接待员
  formData.electronic.receptionists = [];
};

// 在 script setup 部分添加 areaOptions
const areaOptions = [
  { value: 'hallA', label: '大厅A' },
  { value: 'hallB', label: '大厅B' },
  { value: 'roomA', label: '房间A' },
  { value: 'roomB', label: '房间B' }
];

// 在 script setup 部分添加 serviceTypeOptions
const serviceTypeOptions = [
  { value: 'day', label: '白天' },
  { value: 'night', label: '通宵' }
];

// 在 script setup 部分添加 phoneServiceOptions
const phoneServiceOptions = [
  { value: '1', label: '张三' },
  { value: '2', label: '李四' },
  { value: '3', label: '王五' },
  { value: '4', label: '赵六' },
  { value: '5', label: '钱七' },
  { value: '6', label: '孙八' }
];

// 在 script setup 部分添加 skipSignature 方法
const skipSignature = () => {
  MessagePlugin.warning('已跳过签署协议步骤');
  // 如果是老客户，跳过签署后直接跳转到店铺选择
  if (formData.customerType === 'old') {
    currentStep.value = 4;
  } else {
    // 新客户继续填写客户信息
    currentStep.value = 3;
  }
};
</script>

<style scoped>
.new-order-flow {
  padding: 24px;
  max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
}

.step-content {
  padding: 24px 0;
}

.service-selection {
  display: flex;
  margin: 36px 0;
  justify-content: center;
  gap: 32px;
}

.service-card {
  width: 220px;
  height: 220px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.service-card.selected {
  border-color: var(--td-brand-color);
  background-color: rgba(var(--td-brand-color-rgb), 0.05);
}

.service-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}

.service-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: var(--td-brand-color);
}

.service-name {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-top: 8px;
  color: var(--td-text-color-primary);
}

.service-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  text-align: center;
  margin-top: 12px;
  line-height: 1.5;
}

.step-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.disclaimer-content {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.disclaimer-header {
  text-align: center;
  margin-bottom: 16px;
}

.disclaimer-body {
  font-size: 14px;
  line-height: 1.6;
}

.signature-area {
  margin: 24px 0;
}

.canvas-container {
  margin: 16px 0;
}

.signature-actions {
  margin-top: 8px;
}

.shop-option {
  padding: 8px;
  text-align: center;
}

.shop-name {
  font-weight: 500;
  margin-top: 8px;
}

.qrcode-section {
  margin-top: 24px;
  text-align: center;
}

.qrcode-container {
  margin: 16px auto;
  max-width: 240px;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: block;
}
/* 页面头部样式 */
.page-header-container {
  padding: 16px 24px;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 3px;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  margin: 16px 0 8px 0;
  color: rgba(0, 0, 0, 0.9);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.customer-type-selection {
  display: flex;
  margin: 36px 0;
  justify-content: center;
  gap: 32px;
}

.customer-type-card {
  width: 220px;
  height: 180px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
}

.customer-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.customer-type-card.selected {
  border-color: var(--td-brand-color);
  background-color: rgba(var(--td-brand-color-rgb), 0.05);
}

.customer-type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}

.customer-type-icon {
  font-size: 36px;
  margin-bottom: 16px;
  color: var(--td-brand-color);
}

.customer-type-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.customer-type-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  text-align: center;
}

.video-record-area {
  margin: 24px 0;
}

.video-container {
  margin: 16px 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  text-align: center;
  color: var(--td-text-color-secondary);
}

.video-placeholder .t-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.video-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.search-container {
  max-width: 800px;
  margin: 24px auto;
}

.search-results {
  margin-top: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.search-results :deep(.t-table) {
  margin: -1px;
}

.search-results :deep(.t-table__row) {
  cursor: pointer;
}

.search-results :deep(.t-table__row:hover) {
  background-color: rgba(var(--td-brand-color-rgb), 0.05);
}

.customer-name {
  cursor: pointer;
  color: var(--td-brand-color);
}

.customer-name:hover {
  text-decoration: underline;
}

.shop-selection-container,
.staff-selection-container {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--td-text-color-primary);
}

.shop-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.shop-card--selected {
  border-color: var(--td-brand-color);
  background-color: var(--td-brand-color-1);
}

.shop-info {
  padding: 8px;
}

.shop-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--td-text-color-primary);
}

.shop-address {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
}

.shop-status {
  display: flex;
  justify-content: flex-end;
}

.staff-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.staff-position {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.qrcode-section {
  text-align: center;
  padding: 24px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
}

.qrcode-container {
  max-width: 240px;
  margin: 0 auto;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: block;
}

.qrcode-tip {
  margin-top: 16px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.shop-selection-step {
  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .shop-qr-code {
      width: 200px;
      height: 200px;
      border: 1px solid var(--td-component-border);
      border-radius: var(--td-radius-medium);
      padding: 8px;
    }
  }
}

.shop-grid {
  margin-top: 8px;
  overflow-x: auto;
  padding: 8px 0;
  
  :deep(.t-space) {
    flex-wrap: nowrap;
  }
}

.shop-item {
  border: 2px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 240px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--td-brand-color);
    background-color: var(--td-brand-color-1);
  }
}

.shop-item__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shop-item__name {
  font-size: 16px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.shop-item__address {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.staff-grid {
  margin-top: 8px;
  overflow-x: auto;
  padding: 8px 0;
  
  :deep(.t-space) {
    flex-wrap: wrap;
    gap: 8px;
  }
}

.staff-item {
  border: 2px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--td-brand-color);
    background-color: var(--td-brand-color-1);
  }
}

.staff-item__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.staff-item__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}
</style>
