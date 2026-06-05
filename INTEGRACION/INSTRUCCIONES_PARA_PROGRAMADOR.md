# INSTRUCCIONES PARA INTEGRACIÓN - CRYSTAL DESARROLLO S.R.L.

## ENDPOINT PARA ENVIAR CHECK-INS (PUSH)

### URL
```
POST http://TU_IP_AQUI:3000/api/external/checkin
```

> ⚠️ **IMPORTANTE:** Reemplazar `TU_IP_AQUI` con la IP donde corre QuantumFit (te la pasaremos luego).

---

### Headers Requeridos
```http
Content-Type: application/json
X-API-Key: gimnasio_quantum_fit_2026_clave_secreta_xyz789
```

---

### Body (Formato JSON)
```json
{
  "dni": "12345678",
  "timestamp": "2026-04-14T09:00:00Z",
  "type": "entry",
  "location": "Sede Central"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `dni` | string | ✅ SÍ | DNI del usuario (sin puntos ni espacios) |
| `timestamp` | string (ISO 8601) | ✅ SÍ | Fecha y hora del check-in en formato ISO |
| `type` | string | ❌ NO | `"entry"` (entrada) o `"exit"` (salida). Default: `"entry"` |
| `location` | string | ❌ NO | Sede o ubicación del gimnasio |

---

### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "data": {
    "userId": "uuid-del-usuario",
    "userName": "Juan Pérez",
    "pointsEarned": 50,
    "newBalance": 1250,
    "currentStreak": 5,
    "message": "Check-in registrado exitosamente"
  }
}
```

---

### Posibles Errores

#### Usuario no encontrado (404)
```json
{
  "success": false,
  "error": "Usuario no encontrado con DNI: 12345678"
}
```
**Solución:** El usuario debe registrarse en la App QuantumFit con su DNI.

#### API Key inválida (401)
```json
{
  "success": false,
  "error": "API Key inválida o faltante"
}
```

#### Check-in duplicado (200 - pero no suma puntos)
```json
{
  "success": true,
  "data": {
    "pointsEarned": 0,
    "message": "Check-in ya registrado anteriormente hoy"
  }
}
```

---

## ENDPOINT PARA VERIFICAR USUARIO POR DNI

### URL
```
GET http://TU_IP_AQUI:3000/api/external/user/{DNI}
```

### Headers
```http
X-API-Key: gimnasio_quantum_fit_2026_clave_secreta_xyz789
```

### Respuesta (200 OK)
```json
{
  "success": true,
  "data": {
    "exists": true,
    "user": {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "dni": "12345678",
      "points": 1250,
      "level": 5,
      "currentStreak": 5,
      "isActive": true
    }
  }
}
```

---

## EJEMPLO EN JAVASCRIPT (Para el programador)

```javascript
// Función para enviar check-in a QuantumFit
async function sendCheckInToQuantumFit(dni, location = 'Sede Central') {
  const url = 'http://TU_IP_AQUI:3000/api/external/checkin';
  
  const data = {
    dni: dni,
    timestamp: new Date().toISOString(),
    type: 'entry',
    location: location
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'gimnasio_quantum_fit_2026_clave_secreta_xyz789'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Check-in exitoso!');
      console.log('Usuario:', result.data.userName);
      console.log('Puntos ganados:', result.data.pointsEarned);
      console.log('Nuevo saldo:', result.data.newBalance);
      console.log('Racha actual:', result.data.currentStreak);
    } else {
      console.error('❌ Error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// Uso:
// sendCheckInToQuantumFit('12345678', 'Sede Central');
```

---

## FLUJO RECOMENDADO PARA EL SOFTWARE DE CRYSTAL

### Opción A: Tiempo Real (Recomendada)
```
1. Cliente llega al gimnasio
2. Staff ingresa DNI en software de Crystal
3. Crystal valida membresía en su sistema
4. Crystal envía POST a QuantumFit → http://IP:3000/api/external/checkin
5. QuantumFit devuelve puntos ganados
6. Cliente ve sus puntos en la App QuantumFit
```

### Opción B: Lote (Batch) - Para sincronización nocturna
```
POST http://TU_IP_AQUI:3000/api/external/checkin/batch

Body:
{
  "checkins": [
    { "dni": "12345678", "timestamp": "2026-04-14T09:00:00Z", "type": "entry" },
    { "dni": "87654321", "timestamp": "2026-04-14T09:15:00Z", "type": "entry" }
  ]
}
```

---

## PRUEBAS

Para probar la integración, necesitamos:
1. **IP donde corre QuantumFit** (te la pasaremos)
2. **Un usuario de prueba** con DNI registrado en QuantumFit
3. **Hacer una prueba** con el usuario: `nodoetico@gmail.com` (DNI: A DEFINIR)

---

## CONTACTO

**Desarrollador QuantumFit:** Guillermo Buczek  
**Email:** nodoetico@gmail.com  
**Fecha:** Mayo 2026
