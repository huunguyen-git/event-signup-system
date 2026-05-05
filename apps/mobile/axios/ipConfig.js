import Constants from 'expo-constants';

const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri?.split(':').shift();
  if (__DEV__) {
    return hostUri ? `http://${hostUri}:3000` : 'http://10.0.2.2:3000';
  }
  return 'https://api.your-production-url.com';
};
export const BASE_URL = getBaseUrl();
console.log("🚀 Thiết bị đang gọi API tại:", BASE_URL);