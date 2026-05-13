import * as SecureStore from 'expo-secure-store';

export const saveToken = (token: string) => {
    SecureStore.setItemAsync('access_token', token);
    console.log("Saved token: ", token);
}

export const getToken = () => {
   return SecureStore.getItemAsync('access_token');
}

export const removeToken = () => {
    SecureStore.deleteItemAsync('access_token');
}