import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'quantumfit.auth.token',
  REFRESH_TOKEN: 'quantumfit.auth.refresh_token',
  USER: 'quantumfit.auth.user',
} as const;

const SECURE_KEYS: string[] = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN];

export async function secureGetItem(key: string): Promise<string | null> {
  if (SECURE_KEYS.includes(key)) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  if (SECURE_KEYS.includes(key)) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

export async function secureRemoveItem(key: string): Promise<void> {
  if (SECURE_KEYS.includes(key)) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}
