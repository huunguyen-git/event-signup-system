import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    // 1. Cố gắng lấy IP từ cấu hình Expo (Dành cho Expo Go)
    let hostUri = Constants.expoConfig?.hostUri?.split(':').shift();

    // 2. Nếu rỗng (khi chạy Native Build), tự động trích xuất IP từ Metro Bundler
    if (!hostUri && NativeModules.SourceCode?.scriptURL) {
      hostUri = NativeModules.SourceCode.scriptURL.split('://')[1].split(':')[0];
    }

    // 3. Nếu lấy được IP thật (192.168.x.x), dùng nó. Nếu không, dự phòng cứng IP máy bạn.
    return hostUri ? `http://${hostUri}:3000` : 'http://192.168.1.30:3000';
  }
  
  return 'https://api.your-production-url.com';
};

export const BASE_URL = getBaseUrl();
console.log("🚀 Thiết bị đang gọi API tại:", BASE_URL);