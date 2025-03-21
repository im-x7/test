// 这里是 main.ts 的初始内容，可根据项目需求进一步完善
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

// 引入TDesign组件库和样式
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

// 引入Pinia状态管理
import { createPinia } from 'pinia';
const pinia = createPinia();

if (typeof EventTarget !== 'undefined') {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // 对wheel事件自动添加passive: true选项
    if (type === 'wheel') {
      let newOptions = options;
      if (newOptions === false || newOptions === undefined) {
        newOptions = { passive: true };
      } else if (typeof newOptions === 'object' && !newOptions.passive) {
        newOptions = { ...newOptions, passive: true };
      }
      return originalAddEventListener.call(this, type, listener, newOptions);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

const app = createApp(App)
app.use(router)
app.use(TDesign) // 注册TDesign组件库
app.use(pinia) // 注册Pinia
app.mount('#app')