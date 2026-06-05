# 🔧 Configuración de la API - QUANTUM FIT

## ⚠️ IMPORTANTE: Configurar URL de la API

Para que la app móvil se conecte al backend, necesitás configurar la URL correcta en **DOS archivos**:

---

## 📝 Paso 1: Encontrar tu IP Local

### En Windows:
1. Abrir **CMD** (Símbolo del sistema)
2. Escribir: `ipconfig`
3. Buscar **"IPv4"** en la sección de **Wi-Fi** o **Ethernet**
4. Anotar la IP (ej: `192.168.1.100`)

### En macOS/Linux:
1. Abrir **Terminal**
2. Escribir: `ifconfig` o `ip addr`
3. Buscar la IP local (ej: `192.168.1.100`)

---

## 📱 Paso 2: Configurar en la App Móvil

Editar el archivo:
```
quantum-fit-app/src/config/api.ts
```

Cambiar las URLs con tu IP:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://TU_IP_AQUI:3000/api',
  SOCKET_URL: 'http://TU_IP_AQUI:3000',
  TIMEOUT: 10000,
};
```

**Ejemplo:**
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:3000/api',
  SOCKET_URL: 'http://192.168.1.100:3000',
  TIMEOUT: 10000,
};
```

---

## 🖥️ Paso 3: Configurar en el Backend (Opcional)

Si el backend tiene CORS restringido, editar:
```
quantum-fit-backend/.env
```

Agregar la URL de tu app móvil:
```env
ALLOWED_ORIGINS="http://localhost:8081,http://localhost:19006,exp://192.168.1.100:8081"
```

---

## 🚀 Paso 4: Iniciar el Backend

En una terminal:
```bash
cd quantum-fit-backend
npm run dev
```

Verificar que el servidor esté corriendo en `http://localhost:3000`

---

## 📲 Paso 5: Probar la Conexión

1. Iniciar la app móvil con Expo:
   ```bash
   cd quantum-fit-app
   npm start
   ```

2. Escanear el QR con Expo Go

3. Intentar registrar un usuario nuevo

4. Si funciona, verás el usuario creado en la base de datos

---

## ❌ Solución de Problemas

### Error: "Network request failed"
- ✅ Verificar que la IP sea correcta
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar que el celular y la computadora estén en la **misma red Wi-Fi**

### Error: "CORS policy"
- ✅ Agregar la URL de la app al `ALLOWED_ORIGINS` en el backend

### Error: "Connection timeout"
- ✅ Verificar firewall de Windows/Mac
- ✅ Permitir el puerto 3000 en el firewall

---

## 📱 URLs de la App Móvil

Dependiendo de cómo ejecutes la app:

| Dispositivo | URL |
|-------------|-----|
| iOS Simulator | `exp://localhost:8081` |
| Android Emulator | `exp://10.0.2.2:8081` |
| Dispositivo Físico | `exp://192.168.X.X:8081` |

---

## 🔗 Enlaces Útiles

- **Backend Health:** `http://TU_IP:3000/health`
- **Prisma Studio:** `http://localhost:5555` (ejecutar `npm run prisma:studio`)

---

<div align="center">

**QUANTUM FIT** - *Tu mejor versión comienza aquí*

</div>
