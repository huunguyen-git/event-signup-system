import * as SecureStore from "expo-secure-store";

export const saveToken = (token: string) => {
  return SecureStore.setItemAsync("access_token", token);
};

export const getToken = () => {
  return SecureStore.getItemAsync("access_token");
};

export const removeToken = () => {
  return SecureStore.deleteItemAsync("access_token");
};

export const saveUserId = (id: string) => {
  return SecureStore.setItemAsync("CurrentUserId", id);
};

export const getUserId = () => {
  return SecureStore.getItemAsync("CurrentUserId");
};

export const removeUserId = () => {
  return SecureStore.deleteItemAsync("CurrentUserId");
};
