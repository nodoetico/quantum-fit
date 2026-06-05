# 📱 Configuración de Red - QUANTUM FIT

## Problemas de Conexión

Si la app no puede conectarse al backend, sigue estos pasos:

### 1. Verificar IP del PC

Ejecuta este comando en la terminal de Windows:

```cmd
ipconfig | findstr "IPv4"
```

Esto mostrará tu IP actual, por ejemplo: `10.117.145.161`

### 2. Actualizar la IP en el Frontend

Edita el archivo `src/config/api.ts` y actualiza:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://TU_IP_AQUI:3000/api',
  SOCKET_URL: 'http://TU_IP_AQUI:3000',
  TIMEOUT: 10000,
};
```

### 3. Verificar Firewall de Windows

El firewall puede estar bloqueando las conexiones entrantes. Ejecuta como **Administrador**:

```cmd
netsh advfirewall firewall add rule name="QuantumFit Backend" dir=in action=allow protocol=TCP localport=3000
```

### 4. Verificar que el Backend esté corriendo

El backend debe estar ejecutándose en tu PC:

```cmd
cd quantum-fit-backend
npm run dev
```

Deberías ver:
```
🏋️  QUANTUM FIT API - Servidor Iniciado
🌐 Puerto: 3000
📱 App URL: http://10.117.145.161:3000
```

### 5. Verificar que Móvil y PC estén en la misma red

Ambos dispositivos deben estar conectados a la **misma red WiFi**.

---

## IPs Comunes

| Tipo de Red | Rango de IP Típico |
|-------------|-------------------|
| Casa (WiFi doméstico) | 192.168.1.XXX |
| Casa (WiFi alternativo) | 192.168.0.XXX |
| Red corporativa | 10.XXX.XXX.XXX |
| Hotspot móvil | 172.XX.XXX.XXX |

---

## Solución Rápida

Si nada funciona, intenta esto en orden:

1. ✅ Reinicia el backend: `npm run dev` en `quantum-fit-backend`
2. ✅ Actualiza la IP en `src/config/api.ts`
3. ✅ Recarga la app: presiona `R R` en la terminal o agita el móvil
4. ✅ Verifica que el firewall no esté bloqueando
5. ✅ Reinicia tu router/móvil si es necesario

---

## Debugging

Para verificar si el backend es accesible desde el móvil:

1. Abre una terminal en tu móvil (usa Termux o similar)
2. Ejecuta: `curl http://TU_IP:3000/health`
3. Deberías recibir: `{"success":true,"message":"QUANTUM FIT API is running"}`

Si no funciona:
- ❌ Verifica que el puerto 3000 no esté bloqueado
- ❌ Verifica que el backend esté escuchando en `0.0.0.0` (no en `localhost`)
- ❌ Verifica que móvil y PC estén en la misma red
