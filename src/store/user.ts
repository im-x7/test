import { defineStore } from 'pinia';
import { login, getUserInfo, logout } from '../api/user';

// 定义用户信息接口
interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
  shopId?: string;
}

interface UserState {
  token: string;
  userInfo: UserInfo;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRole: (state) => (role: string) => state.userInfo.roles?.includes(role)
  },
  
  actions: {
    async login(username: string, password: string) {
      try {
        const res = await login({ username, password });
        if (res.data && res.data.token) {
          this.token = res.data.token;
          localStorage.setItem('token', res.data.token);
          return res;
        }
        throw new Error('登录失败，未获取到token');
      } catch (error) {
        throw error;
      }
    },
    
    async getInfo() {
      try {
        const res = await getUserInfo();
        if (res.data) {
          this.userInfo = res.data;
          localStorage.setItem('userInfo', JSON.stringify(res.data));
          return res;
        }
        throw new Error('获取用户信息失败');
      } catch (error) {
        throw error;
      }
    },
    
    logout() {
      return new Promise<void>((resolve: () => void) => {
        logout()
          .then(() => {
            // 清除本地状态
            this.token = '';
            this.userInfo = {} as UserInfo;
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            resolve();
          })
          .catch((error: any) => {
            console.error('登出API调用失败', error);
            // 即使API调用失败，也清除本地状态
            this.token = '';
            this.userInfo = {} as UserInfo;
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            resolve(); // 仍然解析Promise，因为我们已经清理了状态
          });
      });
    }
  }
});