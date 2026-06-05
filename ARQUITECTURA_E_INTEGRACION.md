# 📚 Arquitectura QUANTUM FIT - Guía para Integración

## 🎯 Resumen Ejecutivo

**QUANTUM FIT** es un sistema de gestión de gimnasio con gamificación que consta de:

1. **App Móvil** (React Native + Expo) - Para usuarios del gimnasio
2. **Backend API** (Node.js + Express + PostgreSQL) - Servidor central
3. **WebSocket** (Socket.IO) - Notificaciones en tiempo real

---

## 🏗️ Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOFTWARE DE CHECK-IN                         │
│                    (Del otro programador)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │  Webhook / API REST / Socket
                         │  (POR DEFINIR EN LA INTEGRACIÓN)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   QUANTUM FIT - BACKEND                         │
│                                                                 │
│  Node.js + Express + Socket.IO + PostgreSQL + Prisma           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ENDPOINTS PRINCIPALES:                                │    │
│  │  - POST   /api/auth/register                           │    │
│  │  - POST   /api/auth/login                              │    │
│  │  - GET    /api/auth/me                                 │    │
│  │  - POST   /api/checkins                                │    │
│  │  - GET    /api/checkins/my-checkins                    │    │
│  │  - GET    /api/activity-log                            │    │
│  │  - GET    /api/achievements                            │    │
│  │  - POST   /api/rewards/:id/redeem                      │    │
│  │  - GET    /api/admin/classes                           │    │
│  │  - POST   /api/admin/bookings                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  BASE DE DATOS (PostgreSQL con Prisma ORM):            │    │
│  │  - User (usuarios, puntos, nivel, racha)               │    │
│  │  - CheckIn (asistencias al gimnasio)                   │    │
│  │  - Class (clases disponibles)                          │    │
│  │  - Booking (reservas de clases)                        │    │
│  │  - ActivityLog (historial de actividad)                │    │
│  │  - Achievement (logros del sistema)                    │    │
│  │  - UserAchievement (logros desbloqueados)              │    │
│  │  - Reward (premios canjeables)                         │    │
│  │  - WeeklyStats (estadísticas semanales)                │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │  HTTP REST + WebSocket (Socket.IO)
                         │  Puerto: 3000
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  QUANTUM FIT - APP MÓVIL                        │
│                                                                 │
│  React Native + Expo + TypeScript                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  PANTALLAS PRINCIPALES:                                │    │
│  │  1. Login / Registro                                   │    │
│  │  2. Dashboard (resumen de actividad)                   │    │
│  │  3. Turnos (reserva de clases)                         │    │
│  │  4. Premios (canje de recompensas)                     │    │
│  │  5. Perfil (estadísticas y logros)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  SERVICIOS:                                            │    │
│  │  - api.ts (axios con interceptors)                     │    │
│  │  - websocket.ts (Socket.IO client)                     │    │
│  │  - authService, checkInService, rewardsService         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 App Móvil - Detalles Técnicos

### Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Native | 0.76.9 | Framework móvil |
| Expo | ~52.0.0 | Desarrollo y build |
| TypeScript | ~5.6.3 | Tipado estático |
| React Navigation | ^6.x | Navegación |
| Axios | ^1.13.6 | Cliente HTTP |
| Socket.IO Client | ^4.8.3 | WebSocket |
| AsyncStorage | 1.23.1 | Storage local |

### Estructura de Carpetas

```
quantum-fit-app/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── StatCard.tsx
│   │   └── ActivityItem.tsx
│   │
│   ├── config/
│   │   └── api.ts          # ⚠️ CONFIGURACIÓN DE URL DE API
│   │
│   ├── context/
│   │   └── AuthContext.tsx # Estado global de autenticación
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx # Navegación (Stack + Tabs)
│   │
│   ├── screens/
│   │   ├── auth/           # Login, Registro, Recuperación
│   │   ├── dashboard/      # Pantalla principal
│   │   ├── turnos/         # Reserva de clases
│   │   ├── beneficios/     # Canje de premios
│   │   └── perfil/         # Perfil de usuario
│   │
│   ├── services/
│   │   ├── api.ts          # Cliente API con interceptors
│   │   └── websocket.ts    # Cliente WebSocket
│   │
│   ├── types/
│   │   └── index.ts        # Tipos TypeScript
│   │
│   └── utils/
│       └── helpers.ts      # Funciones utilitarias
│
├── App.tsx                 # Punto de entrada
├── app.json                # Configuración Expo
└── package.json            # Dependencias
```

### Flujo de Autenticación

1. Usuario ingresa email/contraseña
2. App llama a `POST /api/auth/login`
3. Backend devuelve JWT (access token + refresh token)
4. App guarda tokens en AsyncStorage
5. App conecta WebSocket con ID de usuario
6. Todas las requests siguientes incluyen `Authorization: Bearer <token>`

### Puntos Clave del Código

**Configuración de API** (`src/config/api.ts`):
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',  // ⚠️ CAMBIAR POR IP REAL
  SOCKET_URL: 'http://localhost:3000',
  TIMEOUT: 10000,
};
```

**Servicio API** (`src/services/api.ts`):
- Intercepta requests para agregar token automáticamente
- Maneja refresh de token cuando expira (401)
- Usa axios como cliente HTTP

**WebSocket** (`src/services/websocket.ts`):
- Se conecta al login
- Escucha eventos: `points-updated`, `achievement-unlocked`, `streak-updated`
- Se une al canal `user:${userId}` para notificaciones personales

---

## 🖥️ Backend - Detalles Técnicos

### Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | >=18.0.0 | Runtime |
| Express | ^4.18.3 | Framework web |
| Socket.IO | ^4.6.1 | WebSocket server |
| Prisma | ^5.10.0 | ORM para PostgreSQL |
| JWT | ^9.0.2 | Autenticación |
| bcryptjs | ^2.4.3 | Hash de contraseñas |
| Zod | ^3.22.4 | Validación de datos |

### Estructura de Carpetas

```
quantum-fit-backend/
├── prisma/
│   └── schema.prisma       # ⚠️ MODELO DE DATOS (DB Schema)
│
├── src/
│   ├── config/
│   ├── controllers/        # Lógica de endpoints
│   │   ├── auth.controller.ts
│   │   ├── checkins.controller.ts
│   │   ├── achievements.controller.ts
│   │   └── ...
│   │
│   ├── database/
│   │   └── index.ts        # Conexión a PostgreSQL
│   │
│   ├── middleware/
│   │   ├── auth.ts         # Verificación de JWT
│   │   └── error.ts        # Manejo de errores
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── checkins.routes.ts
│   │   └── ...
│   │
│   ├── services/           # Lógica de negocio
│   │   ├── checkins.service.ts  # ⚠️ LÓGICA DE CHECK-IN
│   │   └── ...
│   │
│   ├── types/
│   │   └── index.ts        # Tipos y constantes
│   │
│   └── index.ts            # Punto de entrada + Socket.IO
│
├── .env                    # Variables de entorno
└── package.json
```

### Endpoints Principales

#### Autenticación
```
POST   /api/auth/register   - Registrar usuario
POST   /api/auth/login      - Iniciar sesión
POST   /api/auth/refresh    - Refresh de token
GET    /api/auth/me         - Obtener usuario actual
PUT    /api/auth/profile    - Actualizar perfil
```

#### Check-ins
```
POST   /api/checkins              - Registrar check-in
GET    /api/checkins/my-checkins  - Historial de check-ins
GET    /api/checkins/stats        - Estadísticas de check-ins
```

#### Actividad
```
GET    /api/activity-log          - Historial de actividad
GET    /api/activity-log/recent   - Actividad reciente
```

#### Logros
```
GET    /api/achievements          - Todos los logros
GET    /api/achievements/unlocked - Logros desbloqueados
```

#### Recompensas
```
GET    /api/rewards               - Catálogo de premios
GET    /api/rewards/featured      - Premios destacados
POST   /api/rewards/:id/redeem    - Canjear premio
GET    /api/rewards/my-rewards    - Premios canjeados
```

#### Admin
```
GET    /api/admin/classes         - Listar clases
POST   /api/admin/classes         - Crear clase
PUT    /api/admin/classes/:id     - Actualizar clase
DELETE /api/admin/classes/:id     - Eliminar clase

GET    /api/admin/bookings        - Listar reservas
POST   /api/admin/bookings        - Crear reserva
PUT    /api/admin/bookings/:id    - Actualizar reserva
DELETE /api/admin/bookings/:id     - Eliminar reserva
```

### Sistema de Puntos (Gamificación)

**Constantes** (`src/types/index.ts`):
```typescript
export const POINTS_TABLE = {
  CHECK_IN_CLASS: 75,
  CHECK_IN_OPEN_GYM: 50,
  CHECK_IN_PT: 100,
  BOOKING_COMPLETED: 50,
  ACHIEVEMENT_UNLOCKED: 100,
  STREAK_BONUS_7_DAYS: 100,
  STREAK_BONUS_30_DAYS: 500,
  PERFECT_WEEK_BONUS: 200,
};
```

**Niveles**:
| Nivel | Nombre | Puntos Requeridos |
|-------|--------|-------------------|
| 1-2 | 🌱 Principiante | 0-1000 |
| 3-4 | 💪 Intermedio | 2000-4000 |
| 5-6 | 🔥 Avanzado | 4000-6000 |
| 7-8 | ⭐ Experto | 6000-8000 |
| 9-10 | 💎 Élite | 8000-10000 |
| 11+ | 👑 Leyenda | 10000+ |

### Modelo de Datos Principal

**User** (Usuario):
```prisma
model User {
  id                String    @id @default(uuid())
  name              String
  email             String    @unique
  passwordHash      String
  
  role              UserRole  @default(USER)
  isVip             Boolean   @default(false)
  
  // Gamificación
  level             Int       @default(1)
  points            Int       @default(0)
  totalPointsEarned Int       @default(0)
  
  // Estadísticas
  totalWorkouts     Int       @default(0)
  totalClasses      Int       @default(0)
  currentStreak     Int       @default(0)
  longestStreak     Int       @default(0)
  lastCheckinDate   DateTime?
  
  rank              Int       @default(9999)
  
  checkIns          CheckIn[]
  bookings          Booking[]
  activityLogs      ActivityLog[]
  // ... más relaciones
}
```

**CheckIn** (Registro de asistencia):
```prisma
model CheckIn {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(...)
  
  checkInType     CheckInType  // CLASS, OPEN_GYM, PERSONAL_TRAINER
  pointsEarned    Int
  
  validationMethod ValidationMethod  // QR_SCAN, STAFF_VALIDATION, GEOFENCE
  
  checkInTime     DateTime  @default(now())
  gymLocation     String?
  notes           String?
}
```

**Class** (Clases disponibles):
```prisma
model Class {
  id              String     @id @default(uuid())
  name            String
  description     String?
  
  instructorName  String
  
  startTime       DateTime
  endTime         DateTime
  durationMinutes Int
  
  totalSpots      Int
  bookedSpots     Int        @default(0)
  
  activityType    String
  difficultyLevel DifficultyLevel
  
  location        String?
  
  bookings        Booking[]
}
```

---

## 🔌 WebSocket - Eventos en Tiempo Real

### Eventos que el Backend EMITE

| Evento | Payload | Cuándo se emite |
|--------|---------|-----------------|
| `points-updated` | `{ userId, newBalance, earned }` | Cuando un usuario gana puntos |
| `achievement-unlocked` | `{ achievement, points }` | Cuando desbloquea un logro |
| `streak-updated` | `{ current, isPerfectWeek }` | Cuando actualiza su racha |

### Eventos que el Cliente EMITE

| Evento | Payload | Propósito |
|--------|---------|-----------|
| `join-user` | `userId` | Unirse al canal personal del usuario |

### Código de Notificación (Backend)

```typescript
// En src/index.ts
io.on('connection', (socket) => {
  socket.on('join-user', (userId: string) => {
    socket.join(`user:${userId}`);
  });
});

// Función para notificar a un usuario
export function notifyUser(userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}
```

---

## 🚨 PUNTOS CRÍTICOS PARA LA INTEGRACIÓN

### 1. ⚠️ El Check-in NO está implementado en la App Móvil

**Situación actual:**
- El backend TIENE el endpoint `POST /api/checkins` completo y funcional
- La app móvil NO tiene una pantalla para hacer check-in
- El check-in está diseñado para hacerse con:
  - `QR_SCAN`: Escaneando un QR
  - `STAFF_VALIDATION`: Un empleado valida manualmente
  - `GEOFENCE`: Validación por ubicación GPS

**Para la integración, hay 3 opciones:**

#### Opción A: El software del programador hace el check-in directamente
```
SOFTWARE CHECK-IN  →  POST /api/checkins  →  QUANTUM FIT BACKEND
(programador)                           (tu servidor)
```

**Ventajas:**
- Mínimo código a cambiar en tu app
- El programador ya tiene su flujo de check-in
- Centraliza el check-in en su software

**Requerimientos:**
- El software del programador necesita:
  - Token JWT de administrador o servicio
  - Conocer el email o ID del usuario que hace check-in
  - Hacer POST a `http://TU_IP:3000/api/checkins`

**Payload del POST:**
```json
{
  "type": "OPEN_GYM",  // o "CLASS" si es una clase
  "validationMethod": "STAFF_VALIDATION",
  "gymLocation": "Recepción",
  "notes": "Check-in desde software externo"
}
```

**Autenticación:**
- El software del programador necesita un token de servicio
- Se puede crear un usuario de servicio con rol `STAFF` o `ADMIN`
- O implementar un endpoint específico para integraciones

---

#### Opción B: Tu app hace el check-in y notifica al software del programador
```
QUANTUM FIT APP  →  POST /api/checkins  →  BACKEND  →  Webhook →  SOFTWARE PROGRAMADOR
```

**Ventajas:**
- Mantiene el control del check-in en tu app
- El software del programador recibe los datos vía webhook

**Requerimientos:**
- Agregar pantalla de check-in en tu app (o botón en Dashboard)
- Backend necesita endpoint para configurar webhooks
- El software del programador necesita endpoint para recibir webhooks

---

#### Opción C: Check-in bidireccional con colas de mensajes
```
┌─────────────────────┐         ┌─────────────────────┐
│  SOFTWARE CHECK-IN  │ ←HTTP→  │   QUANTUM FIT       │
│  (programador)      │         │   BACKEND           │
└─────────────────────┘         └─────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────┐
│              REDIS / RabbitMQ                   │
│              (Cola de mensajes)                 │
└─────────────────────────────────────────────────┘
```

**Ventajas:**
- Desacopla los sistemas
- Permite reprocesar eventos si hay fallos
- Escalable

**Desventajas:**
- Más complejo de implementar
- Requiere infraestructura adicional

---

### 2. ⚠️ Sincronización de Usuarios

**Problema:** ¿Cómo se identifican los usuarios entre ambos sistemas?

**Opciones:**

#### A. Base de datos compartida
- Ambos sistemas leen/escriben en la misma PostgreSQL
- El software del programador usa las tablas `User` y `CheckIn` directamente

**Ventajas:**
- Sin latencia
- Datos siempre sincronizados

**Desventajas:**
- Acoplamiento fuerte
- Riesgo de corrupción si ambos escriben

---

#### B. API REST con sincronización periódica
- Cada sistema tiene su propia DB
- Se sincronizan vía API cada X minutos

**Ventajas:**
- Sistemas desacoplados
- Cada uno controla su DB

**Desventajas:**
- Datos pueden estar desactualizados
- Complejidad de resolución de conflictos

---

#### C. Usuario identificado por email
- El email es la clave única entre sistemas
- Cuando alguien hace check-in en el software del programador:
  1. Busca usuario por email en tu DB
  2. Si existe, crea el check-in
  3. Si no existe, crea el usuario primero

**Recomendación:** Esta es la opción más simple para empezar

---

### 3. ⚠️ Configuración de Red

**Para que la app se conecte al backend:**

1. **IP Local:** El backend debe estar accesible en la red local
   - En `src/index.ts` el servidor escucha en `0.0.0.0` (todas las interfaces)
   - La IP local cambia si te reconectás al Wi-Fi

2. **Configurar en la App:**
   - Editar `quantum-fit-app/src/config/api.ts`
   - Poner la IP local de tu PC: `http://192.168.1.XXX:3000/api`

3. **Firewall:** Permitir puerto 3000 en Windows

4. **CORS:** El backend ya permite todas las origins por defecto
   - Se puede restringir en `.env` con `ALLOWED_ORIGINS`

---

## 💡 RECOMENDACIONES PARA LA INTEGRACIÓN

### Arquitectura Recomendada

```
┌──────────────────────────────────────────────────────────────┐
│                   GIMNASIO                                   │
│                                                              │
│  ┌────────────────┐         ┌────────────────────┐          │
│  │  SOFTWARE      │         │  QUANTUM FIT APP   │          │
│  │  CHECK-IN      │         │  (React Native)    │          │
│  │  (Programador) │         │                    │          │
│  └───────┬────────┘         └─────────┬──────────┘          │
│          │                            │                      │
│          │ HTTP POST                  │ WebSocket            │
│          │ check-in                   │ notificaciones       │
│          ▼                            ▼                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              QUANTUM FIT BACKEND                       │  │
│  │              (Node.js + Express)                       │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Endpoints para integración:                     │  │  │
│  │  │  POST /api/integration/checkin                   │  │  │
│  │  │  GET  /api/integration/user/:email               │  │  │
│  │  │  POST /api/integration/sync                      │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│                  ┌─────────────────┐                         │
│                  │   PostgreSQL    │                         │
│                  │   (Prisma ORM)  │                         │
│                  └─────────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

### Pasos Sugeridos

1. **Definir flujo de check-in:**
   - ¿Quién inicia el check-in? (¿software del programador o tu app?)
   - ¿Qué método de validación usar? (recomiendo `STAFF_VALIDATION`)

2. **Crear endpoint de integración:**
   ```typescript
   // En backend, nuevo archivo: src/routes/integration.routes.ts
   POST /api/integration/checkin
   ```

3. **Definir autenticación entre sistemas:**
   - Crear usuario de servicio con rol `STAFF`
   - O implementar API Key específica para integración

4. **Definir identificación de usuarios:**
   - Recomendo usar email como clave única
   - O crear campo `externalId` en la tabla `User`

5. **Implementar webhooks (opcional):**
   - Para notificar al software del programador cuando hay eventos
   - Ej: usuario canjea premio en tu app → notificar al otro software

---

## 📋 Checklist para la Reunión

### ✅ Información Confirmada

- **Método de check-in:** Cliente ingresa DNI en teclado de PC al ingresar al gimnasio
- **Dispositivo:** PC con teclado físico en la entrada del gimnasio
- **Quién inicia:** El propio cliente (self check-in)

### Preguntas para el Programador

- [ ] ¿Qué tecnología usa su software de check-in? (¿Web, escritorio, lenguaje?)
- [ ] ¿Puede hacer requests HTTP a una API externa?
- [ ] ¿Su software puede generar/consumir webhooks?
- [ ] ¿El DNI es el único identificador o también tienen email de los usuarios?
- [ ] ¿El software YA tiene una base de datos de usuarios con DNI y email?
- [ ] ¿Necesita recibir notificaciones de tu app (ej: canje de premios)?

### Decisiones a Tomar

- [ ] ¿Dónde se hace el check-in primero?
- [ ] ¿Cómo se identifican los usuarios entre sistemas?
- [ ] ¿Qué método de validación usar? (QR, staff, geofence)
- [ ] ¿Necesita sincronización en tiempo real o puede ser diferida?
- [ ] ¿Quién aloja el backend? (¿tu servidor o el de él?)

### Tareas Técnicas

- [ ] Crear endpoint de integración en tu backend
- [ ] Definir formato de datos para el check-in
- [ ] Implementar autenticación entre sistemas
- [ ] Probar flujo completo de check-in
- [ ] Manejar errores y casos borde (usuario no existe, etc.)

---

## 🔧 Código de Ejemplo para la Integración

### Endpoint de Integración (Backend)

```typescript
// src/routes/integration.routes.ts
import { Router } from 'express';
import { createExternalCheckIn } from '../controllers/integration.controller';
import { authenticateIntegration } from '../middleware/integration-auth';

const router = Router();

// Endpoint para check-in desde software externo
router.post('/checkin', authenticateIntegration, createExternalCheckIn);

// Endpoint para consultar usuario por email
router.get('/user/:email', authenticateIntegration, getUserByEmail);

export default router;
```

```typescript
// src/controllers/integration.controller.ts
import { Request, Response } from 'express';
import * as checkinsService from '../services/checkins.service';
import { prisma } from '../database';

/**
 * POST /api/integration/checkin
 * Crea un check-in desde un sistema externo
 */
export async function createExternalCheckIn(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userEmail, type, gymLocation, notes } = req.body;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: `Usuario con email ${userEmail} no encontrado`,
      });
      return;
    }

    // Crear check-in usando el servicio existente
    const result = await checkinsService.createCheckIn({
      userId: user.id,
      checkInType: type || 'OPEN_GYM',
      validationMethod: 'STAFF_VALIDATION',
      gymLocation,
      notes: notes || 'Check-in desde software externo',
    });

    res.status(201).json({
      success: true,
      data: {
        checkInId: result.checkIn,
        pointsEarned: result.pointsEarned,
        newBalance: result.newBalance,
        streak: result.streak,
      },
      message: 'Check-in registrado exitosamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar check-in';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/integration/user/:email
 * Obtiene información de un usuario por email
 */
export async function getUserByEmail(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        points: true,
        currentStreak: true,
        totalWorkouts: true,
        totalClasses: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al consultar usuario';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}
```

### Middleware de Autenticación para Integración

```typescript
// src/middleware/integration-auth.ts
import { Request, Response, NextFunction } from 'express';

export async function authenticateIntegration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Opción 1: API Key en header
    const apiKey = req.headers['x-api-key'] as string;
    const expectedApiKey = process.env.INTEGRATION_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      res.status(401).json({
        success: false,
        error: 'API Key inválida o faltante',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error de autenticación',
    });
  }
}
```

### Ejemplo de Request desde el Software del Programador

```javascript
// Ejemplo en JavaScript/Node.js
const response = await fetch('http://192.168.1.100:3000/api/integration/checkin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'tu-api-key-secreta'
  },
  body: JSON.stringify({
    userEmail: 'usuario@email.com',
    type: 'OPEN_GYM',  // o 'CLASS' o 'PERSONAL_TRAINER'
    gymLocation: 'Recepción Principal',
    notes: 'Check-in desde software de gestión'
  })
});

const result = await response.json();
console.log(result);
// {
//   success: true,
//   data: {
//     pointsEarned: 50,
//     newBalance: 1250,
//     streak: { current: 5, isPerfectWeek: true }
//   }
// }
```

---

## 📞 Contacto y Soporte

Para dudas técnicas sobre la implementación:

- **Email:** soporte@quantumfit.com
- **Documentación API:** Ver endpoints en `src/index.ts`
- **Modelo de datos:** Ver `prisma/schema.prisma`

---

<div align="center">

**QUANTUM FIT** - *Tu mejor versión comienza aquí*

Documentación creada: 2026-03-31

</div>
