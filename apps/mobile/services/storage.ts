import * as SecureStore from "expo-secure-store";

export const saveToken = (token: string) => {
  SecureStore.setItemAsync("access_token", token);
  console.log("Saved token: ", token);
};

export const getToken = () => {
  return SecureStore.getItemAsync("access_token");
};

export const removeToken = () => {
  SecureStore.deleteItemAsync("access_token");
};

export const saveUserId = (id: string)=>{
  SecureStore.setItemAsync("CurrentUserId", id);
  console.log("Saved UserId: ", id);
}

export const getUserId = () => {
  return SecureStore.getItemAsync("CurrentUserId");
};

export const removeUserId = () => {
  SecureStore.deleteItemAsync("CurrentUserId");
};
