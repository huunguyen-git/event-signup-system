import Constants from "expo-constants";
import { NativeModules } from "react-native";

const getBaseUrl = () => {
  if (__DEV__) {
    let hostUri = Constants.expoConfig?.hostUri?.split(":").shift();
    if (!hostUri && NativeModules.SourceCode?.scriptURL) {
      hostUri = NativeModules.SourceCode.scriptURL
        .split("://")[1]
        .split(":")[0];
    }
    return hostUri ? `http://${hostUri}:3000` : "http://192.168.1.31:3000";
  }
  return "https://api.your-production-url.com";
};

export const BASE_URL = getBaseUrl();
//export const BASE_URL = "https://api-eventconnect-dqbea8hndqfffbc3.southeastasia-01.azurewebsites.net";
