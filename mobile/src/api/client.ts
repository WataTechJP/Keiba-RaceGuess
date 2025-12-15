// src/api/client.ts (修正版A)
import axios from 'axios';
import Constants from 'expo-constants';

// /api を削除
const defaultUrl = 'http://127.0.0.1:8000';

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  defaultUrl;

const client = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem('authToken');
      await AsyncStorage.default.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default client;
