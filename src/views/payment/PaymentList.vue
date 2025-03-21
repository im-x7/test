<template>
  <div class="payment-list">
    <h2>订单列表</h2>
    
    <!-- 筛选条件 -->
    <t-card class="filter-card" :bordered="false">
      <t-form layout="inline">
        <t-form-item label="店铺">
          <t-select v-model="filters.shopId" placeholder="请选择店铺" style="width: 120px">
            <t-option value="">全部</t-option>
            <t-option value="1">总店</t-option>
            <t-option value="2">分店1</t-option>
            <t-option value="3">分店2</t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="员工">
          <t-select v-model="filters.employeeId" placeholder="请选择员工" style="width: 120px">
            <t-option value="">全部</t-option>
            <t-option v-for="option in employeeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </t-option>
          </t-select>
        </t-form-item>
        
        <t-form-item label="时间">
          <t-date-range-picker 
            v-model="filters.dateRange"
            format="YYYY-MM-DD"
            :disabled-date="(current: Dayjs) => current && current.valueOf() > dayjs().endOf('day').valueOf()"
            @change="handleDateRangeChange"
          />
        </t-form-item>
        
        <t-form-item label="状态">
          <t-checkbox-group v-model="filters.status">
            <t-checkbox value="processing">进行中</t-checkbox>
            <t-checkbox value="completed">已完成</t-checkbox>
          </t-checkbox-group>
        </t-form-item>
        
        <t-form-item>
          <t-button theme="primary" @click="handleSearch">查询</t-button>
          <t-button style="margin-left: 8px" @click="resetFilters">重置</t-button>
        </t-form-item>
      </t-form>
    </t-card>
    
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <t-space>
        <t-button theme="primary" @click="handleAdd">新建订单</t-button>
      </t-space>
    </div>
    
    <!-- 数据表格 -->
    <t-table 
      :columns="columns" 
      :data="paymentList" 
      :loading="loading"
      :pagination="pagination"
      row-key="orderNo"
      table-layout="fixed"
      bordered
      stripe
      style="width: 100%; overflow-x: auto;"
      @page-change="handleTableChange"
    >
      <template #orderNo="{ row }">
        <span>{{ row.orderNo }}</span>
      </template>
      <template #action="{ row }">
        <div class="action-buttons">
          <t-space>
            <t-button theme="primary" variant="text" size="small" @click="showDetailModal(row)">详情</t-button>
            <t-button theme="primary" variant="text" size="small" @click="handleEdit(row)">编辑</t-button>
            <t-popconfirm
              content="确定要删除这条收款记录吗？"
              confirm-btn="确定"
              cancel-btn="取消"
              @confirm="handleDelete(row)"
            >
              <t-button theme="danger" variant="text" size="small">删除</t-button>
            </t-popconfirm>
          </t-space>
        </div>
      </template>
      <template #status="{ row }">
        <t-tag :theme="row.status === '已完成' ? 'success' : 'primary'">
          {{ row.status }}
        </t-tag>
      </template>
      <template #amount="{ row }">
        ¥{{ row.amount !== undefined && row.amount !== null ? row.amount.toFixed(2) : '0.00' }}
      </template>
    </t-table>

    <!-- 详情弹窗 -->
    <t-dialog
      v-model:visible="detailModalVisible"
      :header="currentRecord.serviceType === 'electronic' ? '电子服务详情' : '收款详情'"
      :footer="false"
      width="800px"
    >
      <t-descriptions bordered :column="1">
        <t-descriptions-item label="订单号">{{ currentRecord.orderNo }}</t-descriptions-item>
        
        <!-- 电子服务特有字段 -->
        <template v-if="currentRecord.serviceType === 'electronic'">
          <t-descriptions-item label="服务类型">
            <t-tag :theme="currentRecord.electronic?.type === 'day' ? 'primary' : 'warning'">
              {{ currentRecord.electronic?.type === 'day' ? '白天' : '通宵' }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="店铺">
            <t-tag :theme="currentRecord.electronic?.shop === 'nanshan' ? 'success' : 'default'">
              {{ currentRecord.electronic?.shop === 'nanshan' ? '南山' : '其他' }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="区域">
            <t-tag theme="primary">{{ currentRecord.electronic?.area === 'hallA' ? '大厅A' : 
              currentRecord.electronic?.area === 'hallB' ? '大厅B' :
              currentRecord.electronic?.area === 'roomA' ? '房间A' : '房间B' }}</t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="客户贵姓">{{ currentRecord.electronic?.customerName || '-' }}</t-descriptions-item>
          <t-descriptions-item label="预约电话">{{ currentRecord.electronic?.customerPhone || '-' }}</t-descriptions-item>
          <t-descriptions-item label="接待员工">
            <t-space>
              <t-tag v-for="receptionist in currentRecord.electronic?.receptionists" :key="receptionist" theme="primary" variant="light">
                {{ receptionist }}
              </t-tag>
            </t-space>
          </t-descriptions-item>
          <t-descriptions-item label="预约时间">{{ currentRecord.electronic?.appointmentTime || '-' }}</t-descriptions-item>
          <t-descriptions-item label="到店时间">{{ currentRecord.electronic?.arrivalTime || '-' }}</t-descriptions-item>
          <t-descriptions-item label="离店时间">{{ currentRecord.electronic?.departureTime || '-' }}</t-descriptions-item>
          <t-descriptions-item label="留店员工">
            <t-space>
              <t-tag v-for="employee in currentRecord.electronic?.stayEmployees" :key="employee" theme="primary" variant="light">
                {{ employee }}
              </t-tag>
            </t-space>
          </t-descriptions-item>
          <t-descriptions-item label="附加费">¥{{ currentRecord.electronic?.additionalFee?.toFixed(2) || '0.00' }}</t-descriptions-item>
        </template>

        <!-- 非电子服务字段 -->
        <template v-else>
          <t-descriptions-item label="客户名称">{{ currentRecord.customerName }}</t-descriptions-item>
          <t-descriptions-item label="签署协议">
            <t-space>
              <span>{{ currentRecord.agreementStatus ? '已签署' : '未签署' }}</span>
              <t-button variant="text" @click="handleViewAgreement" :disabled="!currentRecord.agreementId">查看</t-button>
            </t-space>
          </t-descriptions-item>
          <t-descriptions-item label="个人声明视频">
            <t-space>
              <span>{{ currentRecord.videoStatus ? '已上传' : '未上传' }}</span>
              <t-button variant="text" @click="handleViewVideo" :disabled="!currentRecord.videoUrl">查看</t-button>
            </t-space>
          </t-descriptions-item>
        </template>

        <t-descriptions-item label="收款店铺">{{ currentRecord.shopName }}</t-descriptions-item>
        <t-descriptions-item label="收款员工">{{ currentRecord.employeeName }}</t-descriptions-item>
        <t-descriptions-item label="净收款金额">¥{{ currentRecord.amount?.toFixed(2) }}</t-descriptions-item>
        <t-descriptions-item label="状态">
          <t-tag :theme="currentRecord.status === 'completed' ? 'success' : 'primary'" variant="light">
            {{ currentRecord.status === 'completed' ? '已完成' : '进行中' }}
          </t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="备注">{{ currentRecord.remark }}</t-descriptions-item>
        
        <!-- 支付方式 -->
        <t-descriptions-item label="支付方式">
          <t-space>
            <template v-if="currentRecord.serviceType === 'electronic'">
              <t-tag v-if="currentRecord.electronic?.meituan?.amount > 0" theme="success">
                美团: ¥{{ currentRecord.electronic?.meituan?.amount }}
              </t-tag>
              <t-tag v-if="currentRecord.electronic?.shouqianba?.amount > 0" theme="warning">
                收钱吧: ¥{{ currentRecord.electronic?.shouqianba?.amount }}
              </t-tag>
            </template>
            <template v-else>
              <template v-for="(method, methodName) in {
                deposit: '定金',
                meituan: '美团',
                qrcode: '收款码',
                mapScan: '地图扫码',
                cash: '现金'
              }" :key="methodName">
                <t-tag v-if="(currentRecord[methodName] as PaymentMethodItem)?.amount > 0" :theme="getTagTheme(methodName)">
                  {{ method }}: ¥{{ (currentRecord[methodName] as PaymentMethodItem)?.amount }}
                </t-tag>
              </template>
            </template>
          </t-space>
        </t-descriptions-item>

        <!-- 收款截图 -->
        <t-descriptions-item label="收款截图">
          <div v-if="hasScreenshots" class="screenshots-preview">
            <template v-if="currentRecord.serviceType === 'electronic'">
              <div v-if="currentRecord.electronic?.meituan?.screenshots?.length" class="method-screenshots">
                <div class="method-screenshots-header">美团截图</div>
                <t-space>
                  <img 
                    v-for="(screenshot, index) in currentRecord.electronic.meituan.screenshots" 
                    :key="index"
                    :src="screenshot.url" 
                    alt="美团收款截图" 
                    class="preview-image"
                    @click="() => previewScreenshot(screenshot.url)"
                  />
                </t-space>
              </div>
              <div v-if="currentRecord.electronic?.shouqianba?.screenshots?.length" class="method-screenshots">
                <div class="method-screenshots-header">收钱吧截图</div>
                <t-space>
                  <img 
                    v-for="(screenshot, index) in currentRecord.electronic.shouqianba.screenshots" 
                    :key="index"
                    :src="screenshot.url" 
                    alt="收钱吧收款截图" 
                    class="preview-image"
                    @click="() => previewScreenshot(screenshot.url)"
                  />
                </t-space>
              </div>
            </template>
            <template v-else>
              <template v-for="(method, methodName) in {
                deposit: '定金',
                meituan: '美团',
                qrcode: '收款码',
                mapScan: '地图扫码',
                cash: '现金'
              }" :key="methodName">
                <div v-if="(currentRecord[methodName] as PaymentMethodItem)?.screenshots?.length" class="method-screenshots">
                  <div class="method-screenshots-header">{{ method }}截图</div>
                  <t-space>
                    <img 
                      v-for="(screenshot, index) in (currentRecord[methodName] as PaymentMethodItem)?.screenshots" 
                      :key="index"
                      :src="screenshot.url" 
                      alt="收款截图" 
                      class="preview-image"
                      @click="() => previewScreenshot(screenshot.url)"
                    />
                  </t-space>
                </div>
              </template>
            </template>
          </div>
          <span v-else>无截图</span>
        </t-descriptions-item>
      </t-descriptions>
      <div style="margin-top: 24px; text-align: right;">
        <t-button @click="detailModalVisible = false">关闭</t-button>
      </div>
    </t-dialog>

    <!-- 编辑弹窗 -->
    <t-dialog
      v-model:visible="editModalVisible"
      :header="editForm.serviceType === 'electronic' ? '编辑电子服务' : '编辑收款记录'"
      @confirm="handleEditOk"
      :confirm-loading="confirmLoading"
      width="800px"
    >
      <t-form :data="editForm" ref="editFormRef" :label-width="120">
        <!-- 电子服务特有字段 -->
        <template v-if="editForm.serviceType === 'electronic' && editForm.electronic">
          <t-form-item label="服务类型" name="electronic.type">
            <div class="staff-grid">
              <t-space wrap>
                <div
                  v-for="option in serviceTypeOptions"
                  :key="option.value"
                  class="staff-item"
                  :class="{ 'selected': editForm.electronic.type === option.value }"
                  @click="editForm.electronic.type = option.value"
                >
                  <div class="staff-item__content">
                    <div class="staff-item__name">{{ option.label }}</div>
                  </div>
                </div>
              </t-space>
            </div>
          </t-form-item>
          
          <t-form-item label="店铺" name="electronic.shop">
            <div class="shop-grid">
              <t-space>
                <div
                  v-for="shop in electronicShops"
                  :key="shop.id"
                  class="shop-item"
                  :class="{ 'selected': editForm.electronic.shop === shop.id }"
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
          
          <t-form-item label="区域" name="electronic.area">
            <div class="staff-grid">
              <t-space wrap>
                <div
                  v-for="option in areaOptions"
                  :key="option.value"
                  class="staff-item"
                  :class="{ 'selected': editForm.electronic.area === option.value }"
                  @click="editForm.electronic.area = option.value"
                >
                  <div class="staff-item__content">
                    <div class="staff-item__name">{{ option.label }}</div>
                  </div>
                </div>
              </t-space>
            </div>
          </t-form-item>
          
          <t-form-item label="客户贵姓" name="electronic.customerName">
            <t-input v-model="editForm.electronic.customerName" placeholder="请输入客户贵姓" />
          </t-form-item>
          
          <t-form-item label="预约电话" name="electronic.customerPhone">
            <t-input v-model="editForm.electronic.customerPhone" placeholder="请输入预约电话" />
          </t-form-item>
          
          <t-form-item label="接待员工" name="electronic.receptionists">
            <div class="staff-grid">
              <t-space wrap>
                <div
                  v-for="option in employeeOptions"
                  :key="option.value"
                  class="staff-item"
                  :class="{ 'selected': editForm.electronic.receptionists[0] === option.value }"
                  @click="selectReceptionist(option.value)"
                >
                  <div class="staff-item__content">
                    <div class="staff-item__name">{{ option.label }}</div>
                  </div>
                </div>
              </t-space>
            </div>
          </t-form-item>

          <t-form-item label="电话客服" name="electronic.phoneService">
            <div class="staff-grid">
              <t-space wrap>
                <div
                  v-for="option in phoneServiceOptions"
                  :key="option.value"
                  class="staff-item"
                  :class="{ 'selected': editForm.electronic.phoneService === option.value }"
                  @click="editForm.electronic.phoneService = option.value"
                >
                  <div class="staff-item__content">
                    <div class="staff-item__name">{{ option.label }}</div>
                  </div>
                </div>
              </t-space>
            </div>
          </t-form-item>
          
          <t-form-item label="预约时间" name="electronic.appointmentTime">
            <t-date-picker
              v-model="editForm.electronic.appointmentTime"
              mode="date"
              enableTimePicker
              placeholder="请选择预约时间"
            />
          </t-form-item>
          
          <t-form-item label="到店时间" name="electronic.arrivalTime">
            <t-date-picker
              v-model="editForm.electronic.arrivalTime"
              mode="date"
              enableTimePicker
              placeholder="请选择到店时间"
            />
          </t-form-item>

          <!-- 分隔线 -->
          <t-divider>结账信息</t-divider>

          <t-form-item label="离店时间" name="electronic.departureTime">
            <t-date-picker
              v-model="editForm.electronic.departureTime"
              mode="date"
              enableTimePicker
              placeholder="请选择离店时间"
            />
          </t-form-item>

          <t-form-item label="留店员工" name="electronic.stayEmployees">
            <div class="staff-grid">
              <t-space wrap>
                <div
                  v-for="option in employeeOptions"
                  :key="option.value"
                  class="staff-item"
                  :class="{ 'selected': editForm.electronic.stayEmployees[0] === option.value }"
                  @click="selectStayEmployee(option.value)"
                >
                  <div class="staff-item__content">
                    <div class="staff-item__name">{{ option.label }}</div>
                  </div>
                </div>
              </t-space>
            </div>
          </t-form-item>

          <t-form-item label="附加费" name="electronic.additionalFee">
            <t-input-number
              v-model="editForm.electronic.additionalFee"
              :decimal-places="2"
              placeholder="请输入附加费金额"
            />
          </t-form-item>

          <!-- 支付方式 -->
          <div class="payment-methods-container">
            <h3 class="section-title">支付方式</h3>
            <div class="payment-methods-grid">
              <!-- 美团支付 -->
              <div class="payment-method-item">
                <div class="method-header">美团</div>
                <div class="method-content">
                  <t-input-number 
                    v-model="editForm.electronic.meituan.amount" 
                    :decimal-places="2" 
                    class="amount-input"
                    placeholder="输入美团金额" 
                  />
                  <t-upload
                    v-model="editForm.electronic.meituan.screenshots"
                    theme="image"
                    multiple
                    :show-upload-progress="false"
                    accept="image/*"
                    :auto-upload="false"
                    :before-upload="handleBeforeUpload"
                    :format-response="formatResponse"
                    class="upload-button"
                  >
                    <t-button variant="outline" size="small">上传截图</t-button>
                  </t-upload>
                </div>
              </div>

              <!-- 收钱吧支付 -->
              <div class="payment-method-item">
                <div class="method-header">收钱吧</div>
                <div class="method-content">
                  <t-input-number 
                    v-model="editForm.electronic.shouqianba.amount" 
                    :decimal-places="2" 
                    class="amount-input"
                    placeholder="输入收钱吧金额" 
                  />
                  <t-upload
                    v-model="editForm.electronic.shouqianba.screenshots"
                    theme="image"
                    multiple
                    :show-upload-progress="false"
                    accept="image/*"
                    :auto-upload="false"
                    :before-upload="handleBeforeUpload"
                    :format-response="formatResponse"
                    class="upload-button"
                  >
                    <t-button variant="outline" size="small">上传截图</t-button>
                  </t-upload>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 非电子服务字段 -->
        <template v-else>
          <t-form-item label="订单号" name="orderNo">
            <t-input v-model="editForm.orderNo" disabled />
          </t-form-item>
          <t-form-item label="客户名称" name="customerId">
            <t-space>
              <t-input v-model="editForm.customerName" disabled style="width: 200px" />
              <t-button variant="outline" @click="handleSelectCustomer">选择客户</t-button>
            </t-space>
          </t-form-item>
          <t-form-item label="签署协议">
            <t-space>
              <span>{{ editForm.agreementStatus ? '已签署' : '未签署' }}</span>
              <t-button variant="text" @click="handleViewAgreement" :disabled="!editForm.agreementId">查看</t-button>
            </t-space>
          </t-form-item>
          <t-form-item label="个人声明视频">
            <t-space>
              <span>{{ editForm.videoStatus ? '已上传' : '未上传' }}</span>
              <t-button variant="text" @click="handleViewVideo" :disabled="!editForm.videoUrl">查看</t-button>
            </t-space>
          </t-form-item>
          <t-form-item label="收款店铺" name="shopId">
            <t-select v-model="editForm.shopId" style="width: 200px" @change="handleShopChange">
              <t-option v-for="shop in shops" :key="shop.id" :value="shop.id">
                {{ shop.name }}
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="收款员工" name="employeeId">
            <t-select v-model="editForm.employeeId" style="width: 200px" @change="handleEmployeeChange">
              <t-option v-for="employee in storeEmployees" :key="employee.id" :value="employee.id">
                {{ employee.name }}
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="净收款金额">
            <t-input-number v-model="editForm.amount" :decimal-places="2" disabled style="width: 100%" />
          </t-form-item>
          <t-form-item label="状态" name="status">
            <t-radio-group v-model="editForm.status">
              <t-radio value="processing">进行中</t-radio>
              <t-radio value="completed">已完成</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-textarea v-model="editForm.remark" :rows="4" placeholder="请输入备注信息" />
          </t-form-item>
          
          <!-- 已收款记录 -->
          <div class="payment-history-container">
            <h3 class="section-title">已收款记录</h3>
            <t-table
              :data="editForm.paymentHistory || []"
              :columns="paymentHistoryColumns"
              :pagination="{ pageSize: 5 }"
              size="small"
              bordered
              stripe
              row-key="paymentTime"
            >
              <template #amount="{ row }">
                ¥{{ row.amount.toFixed(2) }}
              </template>
              <template #paymentTime="{ row }">
                {{ row.paymentTime }}
              </template>
              <template #paymentMethods="{ row }">
                <t-space>
                  <template v-for="(method, methodName) in {
                    deposit: '定金',
                    meituan: '美团',
                    qrcode: '收款码',
                    mapScan: '地图扫码',
                    cash: '现金'
                  }" :key="methodName">
                    <t-tag v-if="row[methodName]?.amount > 0" :theme="getTagTheme(methodName)">
                      {{ method }}: ¥{{ row[methodName].amount }}
                    </t-tag>
                  </template>
                </t-space>
              </template>
              <template #screenshots="{ row }">
                <t-space>
                  <template v-for="(methodName) in {
                    deposit: '定金',
                    meituan: '美团',
                    qrcode: '收款码',
                    mapScan: '地图扫码',
                    cash: '现金'
                  }" :key="methodName">
                    <template v-if="row[methodName]?.screenshots?.length > 0">
                      <div v-for="(screenshot, index) in row[methodName].screenshots" :key="index" class="history-screenshot-item">
                        <img 
                          :src="screenshot.url" 
                          alt="收款截图" 
                          class="history-screenshot-thumbnail"
                          @click="() => previewScreenshot(screenshot.url)"
                        />
                      </div>
                    </template>
                  </template>
                </t-space>
              </template>
            </t-table>
          </div>

          <!-- 新增收款按钮 -->
          <div class="add-payment-container">
            <t-button theme="primary" @click="showPaymentMethods = !showPaymentMethods">
              {{ showPaymentMethods ? '取消新增' : '新增收款' }}
            </t-button>
          </div>
          
          <!-- 收款方式编辑区域 -->
          <div v-if="showPaymentMethods" class="payment-methods-container">
            <h3 class="section-title">新增收款</h3>
            <div class="payment-methods-grid">
              <template v-for="(method, methodName) in {
                deposit: '定金',
                meituan: '美团',
                qrcode: '收款码',
                mapScan: '地图扫码',
                cash: '现金'
              }" :key="methodName">
                <div class="payment-method-item">
                  <div class="method-header">{{ method }}</div>
                  <div class="method-content">
                    <t-input-number 
                      v-model="editForm[methodName].amount" 
                      :decimal-places="2" 
                      class="amount-input"
                      :placeholder="`输入${method}金额`" 
                    />
                    <t-upload
                      v-model="editForm[methodName].screenshots"
                      theme="image"
                      multiple
                      :show-upload-progress="false"
                      accept="image/*"
                      :auto-upload="false"
                      :before-upload="handleBeforeUpload"
                      :format-response="formatResponse"
                      class="upload-button"
                    >
                      <t-button variant="outline" size="small">上传截图</t-button>
                    </t-upload>
                  </div>
                </div>
              </template>
            </div>
            
            <!-- 确认收款按钮 -->
            <div class="confirm-payment-container">
              <t-button theme="primary" @click="handleConfirmPayment" :loading="confirmLoading">
                确认收款
              </t-button>
            </div>
          </div>
        </template>
      </t-form>
    </t-dialog>
    <!-- 图片预览弹窗 -->
    <t-dialog
      v-model:visible="previewVisible"
      header="图片预览"
      :footer="false"
      width="80%"
    >
      <img :src="previewSrc" alt="图片预览" style="max-width: 100%; max-height: 80vh;" />
    </t-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import dayjs from 'dayjs';
import { deletePayment, updatePayment, getPaymentList } from '../../api/payment';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { getStoreEmployees } from '../../api/store';
import type { PaymentRecord, PaymentMethodItem, PaymentHistoryItem, ServiceType, PaymentMethodKey } from '@/api/payment';

// 路由跳转
const router = useRouter();

// 自定义 Dayjs 接口定义
interface Dayjs {
  format(template?: string): string;
  startOf(unit: string): Dayjs;
  endOf(unit: string): Dayjs;
  valueOf(): number;
}

// 店铺员工接口
interface StoreEmployee {
  id: string;
  name: string;
  position: string;
  status: boolean;
}

// 员工选项
const employeeOptions = ref([
  { value: '1', label: '张三' },
  { value: '2', label: '李四' },
  { value: '3', label: '王五' }
]);

// 创建完整的支付方式项
const createPaymentMethodItem = (): PaymentMethodItem => ({
  amount: 0,
  screenshots: []
});

// 创建完整的支付历史记录项
const createPaymentHistoryItem = (data: Partial<PaymentHistoryItem>): PaymentHistoryItem => ({
  paymentTime: data.paymentTime || '',
  amount: data.amount || 0,
  employeeName: data.employeeName || '',
  deposit: data.deposit || createPaymentMethodItem(),
  meituan: data.meituan || createPaymentMethodItem(),
  qrcode: data.qrcode || createPaymentMethodItem(),
  mapScan: data.mapScan || createPaymentMethodItem(),
  cash: data.cash || createPaymentMethodItem()
});

// 支付方式映射
const PAYMENT_METHODS = {
  deposit: '定金',
  meituan: '美团',
  qrcode: '收款码',
  mapScan: '地图扫码',
  cash: '现金'
} as const;

// 获取支付方式列表
usePaymentMethods();

// 状态定义
const loading = ref(false);
const previewSrc = ref('');
const previewVisible = ref(false);
const paymentList = ref<PaymentRecord[]>([]);
const storeEmployees = ref<StoreEmployee[]>([]);
const currentRecord = ref<PaymentRecord>({
  id: '',
  orderNo: '',
  customerId: '',
  customerName: '',
  agreementId: '',
  agreementStatus: false,
  videoUrl: '',
  videoStatus: false,
  amount: 0,
  shopId: '',
  shopName: '',
  employeeId: '',
  employeeName: '',
  serviceType: 'tattoo',
  paymentTime: '',
  status: 'processing',
  deposit: { amount: 0, screenshots: [] },
  meituan: { amount: 0, screenshots: [] },
  qrcode: { amount: 0, screenshots: [] },
  mapScan: { amount: 0, screenshots: [] },
  cash: { amount: 0, screenshots: [] },
  paymentHistory: [],
  remark: '',
  electronic: {
    type: 'day',
    shop: 'nanshan',
    area: 'hallA',
    receptionists: [],
    phoneService: '',
    appointmentTime: '',
    arrivalTime: '',
    departureTime: '',
    stayEmployees: [],
    additionalFee: 0,
    meituan: { amount: 0, screenshots: [] },
    shouqianba: { amount: 0, screenshots: [] }
  }
});
const detailModalVisible = ref(false);
const editModalVisible = ref(false);

// 创建初始化编辑表单的函数，确保所有属性都有正确的初始值
const createInitialEditForm = (): PaymentRecord => ({
  id: '',
  orderNo: '',
  customerId: '',
  customerName: '',
  agreementId: '',
  agreementStatus: false,
  videoUrl: '',
  videoStatus: false,
  amount: 0,
  shopId: '',
  shopName: '',
  employeeId: '',
  employeeName: '',
  serviceType: 'tattoo',
  paymentTime: '',
  status: 'processing',
  remark: '',
  deposit: createPaymentMethodItem(),
  meituan: createPaymentMethodItem(),
  qrcode: createPaymentMethodItem(),
  mapScan: createPaymentMethodItem(),
  cash: createPaymentMethodItem(),
  paymentHistory: [],
  electronic: {
    type: 'day',
    shop: 'nanshan',
    area: 'hallA',
    receptionists: [],
    phoneService: '',
    appointmentTime: '',
    arrivalTime: '',
    departureTime: '',
    stayEmployees: [],
    additionalFee: 0,
    meituan: createPaymentMethodItem(),
    shouqianba: createPaymentMethodItem()
  }
});

const editForm = ref<PaymentRecord>(createInitialEditForm());
const editFormRef = ref();
const confirmLoading = ref(false);
const showPaymentMethods = ref(false);

// 计算是否有截图
const hasScreenshots = computed(() => {
  const methodNames: PaymentMethodKey[] = ['deposit', 'meituan', 'qrcode', 'mapScan', 'cash'];
  return methodNames.some(method => {
    const item = currentRecord.value[method];
    return item?.screenshots?.length > 0;
  });
});

// 查看协议
const handleViewAgreement = () => {
  if (currentRecord.value.agreementId) {
    // TODO: 实现协议查看逻辑
    MessagePlugin.info('协议查看功能开发中...');
  }
};

// 查看视频
const handleViewVideo = () => {
  if (currentRecord.value.videoUrl) {
    // TODO: 实现视频查看逻辑
    MessagePlugin.info('视频查看功能开发中...');
  }
};

// 选择客户
const handleSelectCustomer = () => {
  // TODO: 实现客户选择逻辑
  MessagePlugin.info('客户选择功能开发中...');
};

// 获取店铺列表
const shops = ref([
  { id: '1', name: '总店' },
  { id: '2', name: '分店1' },
  { id: '3', name: '分店2' }
]);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: true
});

// 筛选条件
const filters = reactive({
  employeeId: '',
  dateRange: [] as string[],
  shopId: '',
  status: [] as string[]
});

// 表格列定义
const columns = [
  { colKey: 'orderNo', title: '订单号', width: 180, ellipsis: true },
  { colKey: 'amount', title: '收款金额', width: 120 },
  { colKey: 'shopName', title: '收款店铺', width: 120 },
  { colKey: 'employeeName', title: '收款员工', width: 120 },
  { 
    colKey: 'serviceType', 
    title: '服务类型', 
    width: 120,
    cell: (_h: any, { row }: { row: PaymentRecord }) => {
      const serviceTypeMap: Record<ServiceType, string> = {
        'tattoo': '纹身服务',
        'piercing': '饰品服务',
        'electronic': '电子服务'
      };
      return serviceTypeMap[row.serviceType as ServiceType] || '-';
    }
  },
  { colKey: 'paymentTime', title: '收款时间', width: 180 },
  { 
    colKey: 'status', 
    title: '状态', 
    width: 100,
    cell: (h: any, { row }: { row: PaymentRecord }) => h(
      't-tag',
      {
        theme: row.status === 'completed' ? 'success' : 'warning'
      },
      row.status === 'completed' ? '已完成' : '进行中'
    )
  },
  { colKey: 'action', title: '操作', width: 250, fixed: 'right', align: 'center' }
];

// 获取店铺员工列表
const fetchStoreEmployees = async (shopId: string) => {
  try {
    const response = await getStoreEmployees(shopId);
    if (response?.data) {
      storeEmployees.value = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        position: item.position,
        status: item.status
      }));
    }
  } catch (error) {
    console.error('获取店铺员工失败:', error);
    MessagePlugin.error('获取店铺员工失败');
    storeEmployees.value = [];
  }
};

// 监听店铺变化
watch(() => editForm.value.shopId, (newShopId) => {
  if (newShopId) {
    // 清空当前选择的员工
    editForm.value.employeeId = '';
    editForm.value.employeeName = '';
    // 获取新店铺的员工列表
    fetchStoreEmployees(newShopId);
  } else {
    storeEmployees.value = [];
  }
});

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true;
    console.log('开始获取数据...');
    
    // 构建查询参数
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      employeeId: filters.employeeId || undefined,
      shopId: filters.shopId || undefined,
      startDate: filters.dateRange && filters.dateRange.length > 0 ? filters.dateRange[0] : undefined,
      endDate: filters.dateRange && filters.dateRange.length > 0 ? filters.dateRange[1] : undefined,
      status: filters.status?.length ? filters.status : undefined
    };
    
    console.log('查询参数:', params);
    
    // 调用API获取数据
    const response = await getPaymentList(params);
    console.log('API Response:', response);
    
    if (response && response.data && response.data.list && response.data.list.length > 0) {
      console.log('API返回数据成功，使用API数据');
      paymentList.value = response.data.list.map((item: any) => {
        // 确保订单号存在
        if (!item.orderNo && item.id) {
          item.orderNo = `ORD-${item.id}`;
        }
        
        const result = {
          id: item.id || item.orderNo,
          orderNo: item.orderNo || `ORD-${item.id || Date.now()}`, // 确保订单号始终有值
          customerId: item.customerId,
          customerName: item.customerName,
          agreementId: item.agreementId,
          agreementStatus: item.agreementStatus || false,
          videoUrl: item.videoUrl,
          videoStatus: item.videoStatus || false,
          amount: item.amount || 0,
          shopId: item.shopId || '',
          shopName: item.shopName || '',
          employeeId: item.employeeId || '',
          employeeName: item.employeeName || '',
          serviceType: item.serviceType || 'tattoo',
          paymentTime: item.paymentTime || item.paymentDate || '',
          status: item.status || 'processing',
          remark: item.remark || '',
          key: item.orderNo || item.id,
          deposit: item.deposit || { amount: 0, screenshots: [] },
          meituan: item.meituan || { amount: 0, screenshots: [] },
          qrcode: item.qrcode || { amount: 0, screenshots: [] },
          mapScan: item.mapScan || { amount: 0, screenshots: [] },
          cash: item.cash || { amount: 0, screenshots: [] },
          paymentHistory: item.paymentHistory || [],
          electronic: item.electronic || {
            type: 'day',
            shop: 'nanshan',
            area: 'hallA',
            receptionists: [],
            phoneService: '',
            appointmentTime: '',
            arrivalTime: '',
            departureTime: '',
            stayEmployees: [],
            additionalFee: 0,
            meituan: { amount: 0, screenshots: [] },
            shouqianba: { amount: 0, screenshots: [] }
          }
        };
        
        // 添加调试日志
        console.log('处理后的订单数据:', { id: result.id, orderNo: result.orderNo });
        
        return result;
      });
      
      // 调试整个列表
      console.log('订单列表数据:', paymentList.value);
      
      pagination.value.total = response.data.total;
    } else {
      // API返回数据为空，使用模拟数据
      console.log('API返回数据为空，使用模拟数据');
      
      // 临时模拟数据
      const mockData: PaymentRecord[] = [
        {
          id: '1001',
          orderNo: 'ORD-20230501-001',
          customerId: '1',
          customerName: '张三',
          agreementStatus: true,
          videoStatus: false,
          amount: 1000.00,
          shopId: '1',
          shopName: '总店',
          employeeId: '1',
          employeeName: '李四',
          serviceType: 'tattoo',
          paymentTime: '2023-05-01 10:00:00',
          status: 'completed',
          remark: '纹身服务',
          deposit: createPaymentMethodItem(),
          meituan: createPaymentMethodItem(),
          qrcode: createPaymentMethodItem(),
          mapScan: createPaymentMethodItem(),
          cash: createPaymentMethodItem(),
          paymentHistory: [
            createPaymentHistoryItem({
              paymentTime: '2023-05-01 10:00:00',
              amount: 1000.00,
              employeeName: '李四',
              deposit: { amount: 200, screenshots: [] },
              meituan: { amount: 800, screenshots: [] }
            })
          ],
          electronic: {
            type: 'day',
            shop: 'nanshan',
            area: 'hallA',
            receptionists: [],
            phoneService: '',
            appointmentTime: '',
            arrivalTime: '',
            departureTime: '',
            stayEmployees: [],
            additionalFee: 0,
            meituan: { amount: 0, screenshots: [] },
            shouqianba: { amount: 0, screenshots: [] }
          }
        },
        {
          id: '1002',
          orderNo: 'ORD-20230502-002',
          customerId: '2',
          customerName: '李四',
          agreementStatus: false,
          videoStatus: true,
          amount: 500.00,
          shopId: '2',
          shopName: '分店1',
          employeeId: '2',
          employeeName: '王五',
          serviceType: 'piercing',
          paymentTime: '2023-05-02 14:00:00',
          status: 'processing',
          remark: '穿孔服务',
          deposit: createPaymentMethodItem(),
          meituan: createPaymentMethodItem(),
          qrcode: createPaymentMethodItem(),
          mapScan: createPaymentMethodItem(),
          cash: createPaymentMethodItem(),
          paymentHistory: [
            createPaymentHistoryItem({
              paymentTime: '2023-05-02 14:00:00',
              amount: 500.00,
              employeeName: '王五',
              qrcode: { amount: 500, screenshots: [] }
            })
          ],
          electronic: {
            type: 'day',
            shop: 'nanshan',
            area: 'hallA',
            receptionists: [],
            phoneService: '',
            appointmentTime: '',
            arrivalTime: '',
            departureTime: '',
            stayEmployees: [],
            additionalFee: 0,
            meituan: { amount: 0, screenshots: [] },
            shouqianba: { amount: 0, screenshots: [] }
          }
        },
        {
          id: '1003',
          orderNo: 'ORD-20230503-003',
          customerId: '3',
          customerName: '王六',
          agreementStatus: true,
          videoStatus: true,
          amount: 300.00,
          shopId: '1',
          shopName: '总店',
          employeeId: '3',
          employeeName: '赵七',
          serviceType: 'electronic',
          paymentTime: '2023-05-03 09:30:00',
          status: 'completed',
          remark: '电子服务',
          deposit: createPaymentMethodItem(),
          meituan: createPaymentMethodItem(),
          qrcode: createPaymentMethodItem(),
          mapScan: createPaymentMethodItem(),
          cash: createPaymentMethodItem(),
          paymentHistory: [
            createPaymentHistoryItem({
              paymentTime: '2023-05-03 09:30:00',
              amount: 300.00,
              employeeName: '赵七',
              qrcode: { amount: 200, screenshots: [] },
              cash: { amount: 100, screenshots: [] }
            })
          ],
          electronic: {
            type: 'day',
            shop: 'nanshan',
            area: 'hallA',
            receptionists: [],
            phoneService: '',
            appointmentTime: '',
            arrivalTime: '',
            departureTime: '',
            stayEmployees: [],
            additionalFee: 0,
            meituan: { amount: 0, screenshots: [] },
            shouqianba: { amount: 0, screenshots: [] }
          }
        }
      ];
      
      paymentList.value = mockData;
      pagination.value.total = mockData.length;
      
      // 调试模拟数据
      console.log('模拟订单列表数据:', paymentList.value);
    }
  } catch (error) {
    console.error('API Error:', error);
    MessagePlugin.error('获取数据失败');
    paymentList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = (pageInfo: any) => {
  console.log('Page Info:', pageInfo); // 添加日志
  pagination.value.current = pageInfo.current;
  pagination.value.pageSize = pageInfo.pageSize;
  fetchData();
};

// 跳转到新增页面
const handleAdd = () => {
  router.push({
    path: '/payment/add',
    query: {
      type: 'tattoo',  // 默认为纹身服务
      customerId: '1'  // 默认客户ID，实际应用中可能需要先选择客户
    }
  });
};

// 处理店铺变化
const handleShopChange = async (shopId: string) => {
  if (shopId) {
    // 清空当前选择的员工
    editForm.value.employeeId = '';
    editForm.value.employeeName = '';
    // 获取新店铺的员工列表
    await fetchStoreEmployees(shopId);
  } else {
    storeEmployees.value = [];
  }
};

// 处理员工变化
const handleEmployeeChange = (employeeId: string) => {
  if (employeeId) {
    const selectedEmployee = storeEmployees.value.find(emp => emp.id === employeeId);
    if (selectedEmployee) {
      editForm.value.employeeName = selectedEmployee.name;
    }
  } else {
    editForm.value.employeeName = '';
  }
};

// 编辑收款
const handleEdit = (row: PaymentRecord) => {
  // 初始化编辑表单值
  const initialForm = createInitialEditForm();
  
  // 将行数据合并到编辑表单中
  editForm.value = {
    ...initialForm,
    ...row,
    electronic: row.serviceType === 'electronic' ? {
      type: row.electronic?.type || 'day',
      shop: row.electronic?.shop || 'nanshan',
      area: row.electronic?.area || 'hallA',
      receptionists: row.electronic?.receptionists || [],
      phoneService: row.electronic?.phoneService || '',
      appointmentTime: row.electronic?.appointmentTime || '',
      arrivalTime: row.electronic?.arrivalTime || '',
      departureTime: row.electronic?.departureTime || '',
      stayEmployees: row.electronic?.stayEmployees || [],
      additionalFee: row.electronic?.additionalFee || 0,
      meituan: row.electronic?.meituan || createPaymentMethodItem(),
      shouqianba: row.electronic?.shouqianba || createPaymentMethodItem()
    } : undefined
  };
  
  // 确保每个支付方式都有正确的结构
  ['deposit', 'meituan', 'qrcode', 'mapScan', 'cash'].forEach((method) => {
    if (!editForm.value[method]) {
      editForm.value[method] = { amount: 0, screenshots: [] };
    }
  });
  
  editModalVisible.value = true;
  if (row.shopId) {
    fetchStoreEmployees(row.shopId);
  }
};

// 处理编辑确认
const handleEditOk = async () => {
  try {
    await editFormRef.value.validate();
    confirmLoading.value = true;
    
    if (!editForm.value.orderNo) {
      throw new Error('订单号不能为空');
    }
    
    const electronic = editForm.value.serviceType === 'electronic' && editForm.value.electronic
      ? { ...editForm.value.electronic }
      : undefined;
    
    // 确保支付历史记录是完整的
    const paymentHistory: PaymentHistoryItem[] = editForm.value.paymentHistory.map(item => ({
      id: item.id,
      paymentTime: item.paymentTime || '',
      amount: item.amount || 0,
      employeeName: item.employeeName || '',
      deposit: item.deposit || createPaymentMethodItem(),
      meituan: item.meituan || createPaymentMethodItem(),
      qrcode: item.qrcode || createPaymentMethodItem(),
      mapScan: item.mapScan || createPaymentMethodItem(),
      cash: item.cash || createPaymentMethodItem()
    }));
    
    const updateData: Partial<PaymentRecord> = {
      ...editForm.value,
      electronic,
      amount: editForm.value.amount || 0,
      paymentHistory
    };

    const response = await updatePayment(editForm.value.orderNo, updateData);
    if (response.code === 200) {
      MessagePlugin.success('更新成功');
      editModalVisible.value = false;
      fetchData();
    } else {
      MessagePlugin.error(response.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新失败:', error);
    MessagePlugin.error('更新失败，请重试');
  } finally {
    confirmLoading.value = false;
  }
};

// 删除收款记录
const handleDelete = async (record: PaymentRecord) => {
  try {
    loading.value = true;
    await deletePayment(record.orderNo);
    MessagePlugin.success('删除成功');
    fetchData(); // 刷新数据
  } catch (error) {
    MessagePlugin.error('删除失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 预览截图
const previewScreenshot = (url: string) => {
  if (!url) {
    console.error('无效的图片URL');
    MessagePlugin.warning('无法预览图片');
    return;
  }
  
  console.log('预览图片:', url);
  previewSrc.value = url;
  previewVisible.value = true;
};

// 显示详情弹窗
const showDetailModal = (record: PaymentRecord) => {
  currentRecord.value = record;
  detailModalVisible.value = true;
};

// 处理日期范围变化
const handleDateRangeChange = (value: any) => {
  if (value && Array.isArray(value) && value.length === 2) {
    filters.dateRange = [dayjs(value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'), dayjs(value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')];
  } else {
    filters.dateRange = [];
  }
};

// 重置筛选条件
const resetFilters = () => {
  filters.employeeId = '';
  filters.dateRange = [];
  filters.shopId = '';
  filters.status = [];
  fetchData();
};

// 处理搜索
const handleSearch = () => {
  pagination.value.current = 1;
  fetchData();
};

// 获取标签主题
const getTagTheme = (methodName: PaymentMethodKey): string => {
  const themes: Record<PaymentMethodKey, string> = {
    deposit: 'primary',
    meituan: 'success',
    qrcode: 'warning',
    mapScan: 'danger',
    cash: 'default'
  };
  return themes[methodName];
};

// 收款记录表格列定义
const paymentHistoryColumns = [
  { colKey: 'paymentTime', title: '收款时间', width: 180 },
  { colKey: 'amount', title: '收款金额', width: 120 },
  { colKey: 'paymentMethods', title: '收款方式', minWidth: 200 },
  { colKey: 'screenshots', title: '收款截图', minWidth: 200 },
  { colKey: 'employeeName', title: '收款人', width: 120 }
];

// 组件挂载时获取数据
onMounted(() => {
  console.log('组件已挂载，开始获取数据...');
  fetchData();
});

// 确认收款
const handleConfirmPayment = async () => {
  try {
    // 检查是否有至少一个收款方式有金额
    const hasAmount = Object.keys(PAYMENT_METHODS).some(method => {
      const methodItem = editForm.value[method as PaymentMethodKey] as PaymentMethodItem;
      return methodItem && methodItem.amount > 0;
    });

    if (!hasAmount) {
      MessagePlugin.warning('请至少输入一个收款方式的金额');
      return;
    }

    // 计算总金额
    const totalAmount = Object.keys(PAYMENT_METHODS).reduce((sum, method) => {
      const methodItem = editForm.value[method as PaymentMethodKey] as PaymentMethodItem;
      return sum + (methodItem?.amount || 0);
    }, 0);

    confirmLoading.value = true;

    if (!editForm.value.orderNo) {
      throw new Error('订单号不能为空');
    }

    // 创建新的支付历史记录
    const newPaymentHistoryItem = createPaymentHistoryItem({
      paymentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      amount: totalAmount,
      employeeName: editForm.value.employeeName || '',
      deposit: editForm.value.deposit,
      meituan: editForm.value.meituan,
      qrcode: editForm.value.qrcode,
      mapScan: editForm.value.mapScan,
      cash: editForm.value.cash
    });

    // 更新支付记录
    const updateData: Partial<PaymentRecord> = {
      amount: (editForm.value.amount || 0) + totalAmount,
      status: 'completed',
      paymentHistory: [
        ...(editForm.value.paymentHistory || []),
        newPaymentHistoryItem
      ]
    };

    // 更新本地编辑表单的值
    editForm.value.amount = updateData.amount as number;
    editForm.value.paymentHistory = updateData.paymentHistory || [];

    await updatePayment(editForm.value.orderNo, updateData);

    MessagePlugin.success('收款成功');
    showPaymentMethods.value = false;

    // 重置各支付方式的金额和截图
    Object.keys(PAYMENT_METHODS).forEach(method => {
      const key = method as PaymentMethodKey;
      editForm.value[key] = createPaymentMethodItem();
    });

    // 刷新数据列表
    fetchData();
  } catch (error) {
    console.error('确认收款失败:', error);
    MessagePlugin.error('确认收款失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 处理上传图片前的逻辑
const handleBeforeUpload = (file: any) => {
  console.log('接收到的文件对象:', file);
  
  // 检查文件对象结构 - TDesign上传组件传递的是包装对象
  // 实际File对象在raw属性中
  const fileObj = file.raw ? file.raw : file;
  
  // 检查参数是否为有效的File或Blob对象
  if (!(fileObj instanceof File || fileObj instanceof Blob)) {
    console.error('无效的文件对象:', file);
    MessagePlugin.warning('上传文件类型错误');
    return false;
  }

  // 验证文件类型
  const isImage = /image\/.*/.test(fileObj.type);
  if (!isImage) {
    MessagePlugin.warning('只能上传图片文件');
    return false;
  }
  
  // 验证文件大小，限制在2MB以内
  const isLt2M = fileObj.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    MessagePlugin.warning('图片必须小于2MB');
    return false;
  }
  
  // 直接读取文件作为DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      // 创建一个模拟的上传结果对象
      const result = {
        response: {
          url: event.target?.result as string,
          name: file.name || (fileObj instanceof File ? fileObj.name : '截图'),
          status: 'success',
        },
        file: fileObj,
      };
      resolve(result);
    };
    reader.readAsDataURL(fileObj);
  });
};

// 格式化上传响应
const formatResponse = (response: any) => {
  console.log('格式化上传响应:', response);
  
  // 检查response是否有效
  if (!response) {
    console.error('无效的上传响应:', response);
    return {
      url: '',
      name: '截图',
      status: 'success',
    };
  }

  // 如果是通过handleBeforeUpload处理的本地文件
  if (response.response) {
    return {
      url: response.response.url,
      name: response.response.name,
      status: response.response.status,
    };
  }
  
  // 如果response包含url属性
  if (response.url) {
    return {
      url: response.url,
      name: response.name || '截图',
      status: response.status || 'success',
    };
  }
  
  // 处理真实API返回的响应
  return {
    url: response.data?.url || '',
    name: response.data?.name || response.name || '截图',
    status: response.data?.status || response.status || 'success',
  };
};

// 电子服务表单验证规则

// 处理支付方式

const serviceTypeOptions = [
  { value: 'day', label: '白天' },
  { value: 'night', label: '通宵' }
];

const electronicShops = [
  { id: 'nanshan', name: '南山店', address: '深圳市南山区xxx路xxx号' },
  { id: 'other', name: '其他店', address: '深圳市其他区域' }
];

const areaOptions = [
  { value: 'hallA', label: '大厅A' },
  { value: 'hallB', label: '大厅B' },
  { value: 'roomA', label: '房间A' },
  { value: 'roomB', label: '房间B' }
];

const phoneServiceOptions = [
  { value: '1', label: '张三' },
  { value: '2', label: '李四' },
  { value: '3', label: '王五' },
  { value: '4', label: '赵六' },
  { value: '5', label: '钱七' },
  { value: '6', label: '孙八' }
];

// 选择接待员（单选）
const selectReceptionist = (value: string) => {
  if (editForm.value.electronic) {
    editForm.value.electronic.receptionists = [value];
  }
};

// 选择留店员工（单选）
const selectStayEmployee = (value: string) => {
  if (editForm.value.electronic) {
    editForm.value.electronic.stayEmployees = [value];
  }
};

// 处理店铺选择
const handleElectronicShopSelect = (shopId: 'nanshan' | 'other') => {
  if (editForm.value.electronic) {
    editForm.value.electronic.shop = shopId;
    // 清空已选择的接待员和留店员工
    editForm.value.electronic.receptionists = [];
    editForm.value.electronic.stayEmployees = [];
  }
};
</script>

<style scoped>
.payment-list {
  padding: 24px;
}

.filter-card {
  margin-bottom: 24px;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.screenshot-upload {
  display: flex;
  flex-direction: column;
}

.preview-container {
  position: relative;
  width: 100%;
  max-width: 200px;
}

.preview-image {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.preview-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.payment-methods-container {
  margin: 24px 0;
  padding: 24px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-1);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.payment-method-item {
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 20px;
  background-color: var(--td-bg-color-container);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-method-item:hover {
  border-color: var(--td-brand-color);
  box-shadow: var(--td-shadow-2);
}

.method-header {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--td-component-border);
}

.method-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.amount-input {
  width: 100%;
}

.amount-input :deep(.t-input-number) {
  width: 100%;
}

.upload-button {
  width: 100%;
}

.upload-button :deep(.t-upload) {
  width: 100%;
}

.upload-button :deep(.t-upload__trigger) {
  width: 100%;
}

.upload-button :deep(.t-button) {
  width: 100%;
}

.screenshots-preview-area {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--td-component-border);
}

.screenshots-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.method-screenshots {
  margin-bottom: 16px;
}

.method-screenshots-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--td-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  padding: 8px;
  background-color: var(--td-bg-color-container-hover);
  border-radius: var(--td-radius-medium);
}

.screenshot-item {
  aspect-ratio: 1;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-small);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.screenshot-item:hover {
  border-color: var(--td-brand-color);
  transform: scale(1.05);
  z-index: 1;
}

.screenshot-item:hover::after {
  content: '点击查看';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 4px;
  text-align: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.t-upload__flow-list) {
  display: none;
}

:deep(.t-upload__flow-item) {
  margin: 0;
}

:deep(.t-upload__flow-item-name) {
  display: none;
}

:deep(.t-upload__flow-item-status) {
  display: none;
}

:deep(.t-upload__flow-item-progress) {
  display: none;
}

.payment-history-container {
  margin: 24px 0;
  padding: 24px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  box-shadow: var(--td-shadow-1);
}

.add-payment-container {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}

.confirm-payment-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.history-screenshot-item {
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 8px;
  overflow: hidden;
  border-radius: var(--td-radius-small);
  border: 1px solid var(--td-component-border);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.history-screenshot-item:hover {
  border-color: var(--td-brand-color);
  transform: scale(1.1);
  z-index: 1;
}

.history-screenshot-item:hover::after {
  content: '点击查看';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 4px;
  text-align: center;
}

.history-screenshot-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 添加响应式布局支持 */
@media screen and (max-width: 768px) {
  .payment-methods-grid {
    grid-template-columns: 1fr;
  }
  
  .screenshots-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
  
  .history-screenshot-item {
    width: 32px;
    height: 32px;
    margin-right: 4px;
  }
}

/* 添加暗色主题支持 */
:root[data-theme='dark'] .screenshots-grid {
  background-color: var(--td-bg-color-container);
}

:root[data-theme='dark'] .screenshot-item:hover::after,
:root[data-theme='dark'] .history-screenshot-item:hover::after {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--td-text-color-primary);
}

.shop-grid {
  margin-top: 8px;
  overflow-x: auto;
  padding: 8px 0;
}

.shop-grid :deep(.t-space) {
  flex-wrap: nowrap;
}

.shop-item {
  border: 2px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 240px;
}

.shop-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shop-item.selected {
  border-color: var(--td-brand-color);
  background-color: var(--td-brand-color-1);
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
}

.staff-grid :deep(.t-space) {
  flex-wrap: wrap;
  gap: 8px;
}

.staff-item {
  border: 2px solid var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.staff-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.staff-item.selected {
  border-color: var(--td-brand-color);
  background-color: var(--td-brand-color-1);
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