import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: los valores de las claves no cambian porque están persistidos
// en el dispositivo (renombrarlos desloguearía a los usuarios).
export const CLAVES_ALMACENAMIENTO = {
  TOKEN_AUTH: 'quantumfit.auth.token',
  TOKEN_REFRESH: 'quantumfit.auth.refresh_token',
  USUARIO: 'quantumfit.auth.user',
} as const;

const CLAVES_SEGURAS: string[] = [CLAVES_ALMACENAMIENTO.TOKEN_AUTH, CLAVES_ALMACENAMIENTO.TOKEN_REFRESH];

export async function obtenerItemSeguro(clave: string): Promise<string | null> {
  if (CLAVES_SEGURAS.includes(clave)) {
    return SecureStore.getItemAsync(clave);
  }
  return AsyncStorage.getItem(clave);
}

export async function guardarItemSeguro(clave: string, valor: string): Promise<void> {
  if (CLAVES_SEGURAS.includes(clave)) {
    await SecureStore.setItemAsync(clave, valor);
  } else {
    await AsyncStorage.setItem(clave, valor);
  }
}

export async function eliminarItemSeguro(clave: string): Promise<void> {
  if (CLAVES_SEGURAS.includes(clave)) {
    await SecureStore.deleteItemAsync(clave);
  } else {
    await AsyncStorage.removeItem(clave);
  }
}
