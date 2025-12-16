// src/api/client.ts
import axios from 'axios';
import Constants from 'expo-constants';

const defaultUrl = 'http://127.0.0.1:8000';

// 開発環境で自動的にIPを取得する関数
const getAutoApiUrl = () => {
  // 本番環境では環境変数を使う
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL || defaultUrl;
  }

  // 開発環境: ExpoのhostUriからIPを自動取得
  if (Constants.expoConfig?.hostUri) {
    const ip = Constants.expoConfig.hostUri.split(':')[0];
    const autoUrl = `http://${ip}:8000`;
    console.log("🤖 Auto-detected IP:", autoUrl);
    return autoUrl;
  }

  return process.env.EXPO_PUBLIC_API_URL || defaultUrl;
};

const apiUrl = getAutoApiUrl();

console.log("🌐 API Client initialized");
console.log("📍 Final baseURL:", apiUrl);

const client = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Token ${token}`;
    console.log("🔑 Auth token set in client.defaults");
    console.log("🔑 Current headers:", client.defaults.headers.common.Authorization);
  } else {
    delete client.defaults.headers.common.Authorization;
    console.log("🔓 Auth token removed");
  }
};

// リクエストインターセプター
client.interceptors.request.use(
  (config) => {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log("📤 Request:", config.method?.toUpperCase(), url);
    console.log("📤 Authorization header:", config.headers.Authorization); // ← 追加
    return config;
  },
  (error) => {
    console.error("📤 Request setup error:", error.message);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
client.interceptors.response.use(
  (response) => {
    console.log("📥 Response:", response.status, response.config.url ?? 'unknown');
    return response;
  },
  async (error) => {
    console.error("📥 Response error:", error.message);
    
    if (error.response) {
      console.error("📥 Error status:", error.response.status);
      console.error("📥 Error data:", error.response.data);
    } else if (error.request) {
      console.error("📥 No response - Server might be unreachable");
    }
    
    if (error.response?.status === 401) {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem('authToken');
      await AsyncStorage.default.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default client;
