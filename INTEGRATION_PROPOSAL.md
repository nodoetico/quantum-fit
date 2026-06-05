# PROPUESTA DE INTEGRACIÓN
## QuantumFit ↔ Software de Gestión del Gimnasio

---

## 1. OBJETIVO

Sincronizar los registros de asistencia (check-in) entre el **Software de Gestión del Gimnasio** y la **App QuantumFit**, permitiendo que los usuarios ganado puntos, suban de nivel y canjeen premios.

---

## 2. ARQUITECTURA DE INTEGRACIÓN

```
┌─────────────────────┐         ┌─────────────────────┐
│                     │         │                     │
│  SOFTWARE DEL       │         │   QUANTUM FIT       │
│  GIMNASIO           │────────▶│   BACKEND           │
│  (Otro programador) │  HTTP   │                     │
│                     │  POST   │   /api/external/    │
└─────────────────────┘         │   checkin           │
                                └─────────────────────┘
```

---

## 3. ENDPOINTS PROVISTOS POR QUANTUMFIT

### 3.1 Recibir Check-in (PRINCIPAL)

```
POST https://api.tugimnasio.com/api/external/checkin
Headers:
  Content-Type: application/json

Body:
{
  "dni": "12345678",
  "timestamp": "2026-04-14T09:00:00Z",
  "type": "entry",
  "location": "Sede Central"
}
```

**Respuesta exitosa (200):**
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

**Respuesta si usuario no existe (404):**
```json
{
  "success": false,
  "error": "Usuario no encontrado con DNI: 12345678"
}
```

---

### 3.2 Recibir Múltiples Check-ins (BATCH)

```
POST https://api.tugimnasio.com/api/external/checkin/batch
Headers:
  Content-Type: application/json

Body:
{
  "checkins": [
    {
      "dni": "12345678",
      "timestamp": "2026-04-14T09:00:00Z",
      "type": "entry"
    },
    {
      "dni": "87654321",
      "timestamp": "2026-04-14T09:15:00Z",
      "type": "entry"
    }
  ]
}
```

---

### 3.3 Verificar Existencia de Usuario

```
GET https://api.tugimnasio.com/api/external/user/12345678
```

**Respuesta:**
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

## 4. DATOS REQUERIDOS DEL SOFTWARE DEL GIMNASIO

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `dni` | string | DNI del usuario (ej: "12345678") | **SÍ** |
| `timestamp` | datetime | Fecha y hora en formato ISO 8601 | **SÍ** |
| `type` | string | "entry" o "exit" | NO (default: "entry") |
| `location` | string | Ubicación/sede del gym | NO |

---

## 5. REGLAS DE NEGOCIO

1. **Un check-in por día por usuario**: Si el usuario ya registró asistencia hoy, no ganará puntos adicionales.

2. **Solo entradas registran puntos**: Las salidas (`type: "exit"`) solo actualizan el timestamp de salida.

3. **Usuario debe existir en QuantumFit**: Si el DNI no está registrado, se devuelve error 404.

4. **Puntos otorgados**: 50 puntos por check-in de entrenamiento libre.

5. **Cálculo de racha**: Se mantiene la racha si el usuario viene al menos una vez por día.

---

## 6. SEGURIDAD

### Opción A: API Key
```
Headers:
  X-API-Key: tu-clave-secreta-aqui
```

### Opción B: IP whitelist (para servidor local)
Permitir solo conexiones desde la IP del servidor del gimnasio.

---

## 7. ESCENARIOS DE USO

### Escenario 1: Check-in en tiempo real
```
1. Usuario entra al gimnasio
2. Staff escribe DNI en software del gym
3. Software envía POST a QuantumFit
4. QuantumFit procesa y devuelve puntos ganados
5. App del usuario muestra notificación en tiempo real
```

### Escenario 2: Sincronización nocturna
```
1. Software del gym guarda todos los check-ins del día
2. Al final del día, envía batch a QuantumFit
3. QuantumFit procesa todos los registros
```

---

## 8. MANTENIMIENTO DE USUARIOS

Para que la integración funcione, cada usuario de QuantumFit debe tener su DNI registrado. Esto se puede hacer:

1. **En el registro de la app**: Campo adicional para DNI
2. **Desde el admin panel**: El administrador puede agregar/editar DNI de usuarios
3. **Migración masiva**: Importar lista de usuarios con sus DNIs

---

## 9. PRÓXIMOS PASOS

1. [ ] Aceptar/rechazar esta propuesta
2. [ ] Definir método de autenticación (API Key o IP whitelist)
3. [ ] Definir URLs de producción y desarrollo
4. [ ] Probar endpoint de verificación de usuario
5. [ ] Probar endpoint de check-in con un usuario de prueba
6. [ ] Configurar dominio/SSL para producción
7. [ ] Documentar DNIs de usuarios en QuantumFit

---

## 10. CONTACTO

**Desarrollador QuantumFit:** [Tu nombre]
**Email:** [tu@email.com]
**Fecha:** 14 de Abril de 2026

---

*Este documento es una propuesta técnica. Los detalles pueden ajustarse según las necesidades del otro programador.*
