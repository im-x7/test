import { ref } from 'vue';
import { getPaymentMethodList } from '../api/paymentMethod';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  feeRate: number;
  status: boolean;
  remark: string;
  createdAt: string;
}

export function usePaymentMethods() {
  const paymentMethods = ref<PaymentMethod[]>([]);
  const loading = ref(false);

  const fetchPaymentMethods = async () => {
    loading.value = true;
    try {
      const response = await getPaymentMethodList();
      // 添加类型断言以解决"code"属性不存在的问题
      if ((response as any)?.code === 200 && (response as any)?.data?.list) {
        // 只获取启用状态的支付方式
        paymentMethods.value = (response as any).data.list.filter((method: PaymentMethod) => method.status);
      }
    } catch (error: any) {
      console.error('获取支付方式列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 移除onMounted钩子，让调用方决定何时获取数据
  // 这样可以确保每次打开页面时都能获取最新数据

  return {
    paymentMethods,
    loading,
    fetchPaymentMethods
  };
}