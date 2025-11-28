import axios from 'axios';
import Constants from 'expo-constants';

const defaultUrl = 'http://127.0.0.1:8000/api/';

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  defaultUrl;

const client = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export default client;

