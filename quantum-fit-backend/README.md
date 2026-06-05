# 🏋️ QUANTUM FIT - Backend API

<div align="center">

**Backend para el sistema de gestión de gimnasio con gamificación**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-blue?style=for-the-badge&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)

</div>

---

## 📋 Índice

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Endpoints API](#-endpoints-api)
- [Sistema de Puntos](#-sistema-de-puntos)
- [Logros](#-logros)
- [WebSockets](#-websockets)
- [Desarrollo](#-desarrollo)
- [Producción](#-producción)

---

## ✨ Características

### 🔐 Autenticación
- Registro de usuarios con validación
- Login con JWT (access + refresh tokens)
- Middleware de autenticación protegido
- Roles: user, staff, admin

### 📊 Check-ins y Puntos
- Registro de asistencia con QR, staff o geofencing
- Puntos automáticos por tipo de actividad:
  - 🎯 Clase grupal: +75 pts
  - 💪 Entrenamiento libre: +50 pts
  - 🏃 Entrenador personal: +100 pts
- Sistema de rachas con bonus:
  - 🔥 7 días consecutivos: +100 pts
  - 🔥 30 días consecutivos: +500 pts
  - 👑 Semana perfecta (7 días): +200 pts

### 🏆 Logros Automáticos
- Desbloqueo automático al cumplir requisitos
- Puntos bonus por logros
- Categorías: Asistencia, Rutina, Actividad, Social

### 📈 Estadísticas Semanales
- Tracking automático de actividad semanal
- Cálculo de asistencia por semana ISO
- Detección de semanas perfectas

### 🔔 Notificaciones en Tiempo Real
- WebSockets con Socket.IO
- Actualizaciones de puntos en vivo
- Notificaciones de logros desbloqueados

---

## 🏗️ Arquitectura

```
quantum-fit-backend/
├── prisma/
│   └── schema.prisma          # Schema de base de datos
├── src/
│   ├── controllers/           # Controladores HTTP
│   │   ├── auth.controller.ts
│   │   └── checkins.controller.ts
│   ├── services/              # Lógica de negocio
│   │   ├── auth.service.ts
│   │   └── checkins.service.ts
│   ├── routes/                # Rutas Express
│   │   ├── auth.routes.ts
│   │   └── checkins.routes.ts
│   ├── middleware/            # Middleware
│   │   ├── auth.ts           # JWT auth
│   │   └── error.ts          # Error handling
│   ├── database/              # Configuración DB
│   │   └── index.ts
│   ├── utils/                 # Utilidades
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts
│   └── index.ts               # Punto de entrada
├── .env                       # Variables de entorno
├── .env.example              # Ejemplo de variables
├── package.json
└── tsconfig.json
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js 18+** ([Descargar](https://nodejs.org))
- **PostgreSQL 15+** ([Descargar](https://www.postgresql.org))
- **npm** o **yarn**

### Pasos

1. **Clonar/navegar al directorio:**
```bash
cd quantum-fit-backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Copiar el ejemplo
copy .env.example .env

# Editar .env con tus credenciales de PostgreSQL
```

4. **Configurar base de datos:**
```bash
# Crear database en PostgreSQL
createdb -U postgres quantumfit

# O conectar con psql
psql -U postgres
CREATE DATABASE quantumfit;
\q
```

5. **Generar Prisma Client:**
```bash
npm run prisma:generate
```

6. **Ejecutar migraciones:**
```bash
npm run prisma:migrate
```

7. **Insertar datos iniciales (opcional):**
```bash
npm run prisma:seed
```

8. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/quantumfit?schema=public"

# JWT
JWT_SECRET="tu-secreto-super-seguro"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="otro-secreto-para-refresh"
REFRESH_TOKEN_EXPIRES_IN="30d"

# CORS (orígenes permitidos)
ALLOWED_ORIGINS="http://localhost:8081,http://localhost:19006"

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🌐 Endpoints API

### Autenticación

#### `POST /api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "level": 1,
      "points": 100,
      "totalPointsEarned": 100,
      "currentStreak": 0,
      "memberSince": "2024-03-23T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Usuario registrado exitosamente"
}
```

#### `POST /api/auth/login`
Inicia sesión.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

#### `GET /api/auth/me`
Obtiene perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### `PUT /api/auth/profile`
Actualiza perfil del usuario.

**Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "avatarUrl": "https://..."
}
```

---

### Check-ins

#### `POST /api/checkins`
Registra un nuevo check-in.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "CLASS",
  "validationMethod": "QR_SCAN",
  "gymLocation": "Sala Principal",
  "notes": "Clase de CrossFit"
}
```

**Tipos válidos:**
- `CLASS` - Clase grupal (+75 pts)
- `OPEN_GYM` - Entrenamiento libre (+50 pts)
- `PERSONAL_TRAINER` - Entrenador personal (+100 pts)

**Métodos de validación:**
- `QR_SCAN` - Escaneo de QR
- `STAFF_VALIDATION` - Validado por staff
- `GEOFENCE` - Geolocalización

**Response:**
```json
{
  "success": true,
  "data": {
    "checkIn": { ... },
    "pointsEarned": 75,
    "newBalance": 175,
    "streak": {
      "current": 5,
      "isPerfectWeek": true
    },
    "achievementsUnlocked": [
      {
        "id": "ach_001",
        "name": "Primera Visita",
        "icon": "🎯",
        "pointsReward": 50
      }
    ]
  },
  "message": "Check-in registrado exitosamente"
}
```

#### `GET /api/checkins/my-checkins`
Obtiene historial de check-ins.

**Query Params:**
- `from` - Fecha inicio (YYYY-MM-DD)
- `to` - Fecha fin (YYYY-MM-DD)
- `limit` - Cantidad de resultados (default: 50)
- `offset` - Offset para paginación (default: 0)

#### `GET /api/checkins/stats`
Obtiene estadísticas de check-ins.

---

## 🎯 Sistema de Puntos

### Tabla de Puntos

| Actividad | Puntos |
|-----------|--------|
| Clase grupal | +75 |
| Entrenamiento libre | +50 |
| Entrenador personal | +100 |
| Bonus racha 7 días | +100 |
| Bonus racha 30 días | +500 |
| Semana perfecta | +200 |
| Logro desbloqueado | +50 a +500 |

### Cálculo de Rachas

- **Racha actual**: Días consecutivos con check-in
- **Mejor racha**: Máximo histórico de días consecutivos
- Si el usuario no registra asistencia por 2+ días, la racha se reinicia a 1

### Niveles

Los niveles se calculan automáticamente según los puntos totales:

| Nivel | Puntos Requeridos | Título |
|-------|------------------|--------|
| 1-2 | 0-999 | 🌱 Principiante |
| 3-4 | 1000-1999 | 💪 Intermedio |
| 5-6 | 2000-2999 | 🔥 Avanzado |
| 7-8 | 3000-3999 | ⭐ Experto |
| 9-10 | 4000-4999 | 💎 Élite |
| 11+ | 5000+ | 👑 Leyenda |

---

## 🏆 Logros

### Tipos de Logros

| ID | Nombre | Tipo | Requisito | Puntos |
|----|--------|------|-----------|--------|
| first_visit | 🎯 Primera Visita | asistencia | 1 check-in | 50 |
| constant | 🔥 Constante | asistencia | 7 días racha | 100 |
| unstoppable | 💥 Imparable | asistencia | 30 días racha | 500 |
| warrior | 💪 Guerrero | rutina | 25 entrenamientos | 200 |
| beast | 🦍 Bestia | rutina | 100 entrenamientos | 500 |
| legend | 🐉 Leyenda | rutina | 500 entrenamientos | 1000 |
| perfect_week | 👑 Semana Perfecta | especial | 7 días en semana | 200 |

### Desbloqueo Automático

Los logros se verifican automáticamente después de cada check-in. Cuando se cumplen los requisitos:

1. Se registra en `user_achievements`
2. Se suman los puntos bonus
3. Se registra en `activity_logs`
4. Se envía notificación por WebSocket

---

## 🔔 WebSockets

### Conexión

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Unirse al canal del usuario
socket.emit('join-user', userId);
```

### Eventos

#### Del servidor al cliente:

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `points-updated` | `{ userId, newBalance, earned }` | Puntos actualizados |
| `achievement-unlocked` | `{ achievement, points }` | Logro desbloqueado |
| `streak-updated` | `{ current, isPerfectWeek }` | Racha actualizada |

#### Del cliente al servidor:

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `join-user` | `userId: string` | Unirse al canal del usuario |
| `disconnect` | - | Desconectar |

### Ejemplo en React Native

```typescript
import { io } from 'socket.io-client';

const socket = io('http://your-api-url');

// Conectar después del login
useEffect(() => {
  if (user) {
    socket.emit('join-user', user.id);
    
    socket.on('points-updated', (data) => {
      setUser(prev => ({
        ...prev,
        points: data.newBalance
      }));
    });
    
    socket.on('achievement-unlocked', (data) => {
      Toast.show(`🏆 ${data.achievement.name}! +${data.points} pts`);
    });
  }
  
  return () => {
    socket.off('points-updated');
    socket.off('achievement-unlocked');
  };
}, [user]);
```

---

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Generar Prisma Client
npm run prisma:generate

# Crear migración
npm run prisma:migrate

# Abrir Prisma Studio (GUI)
npm run prisma:studio

# Insertar datos seed
npm run prisma:seed

# Linting
npm run lint
```

### Estructura de Base de Datos

```
┌─────────────────┐     ┌─────────────────┐
│      User       │     │    CheckIn      │
├─────────────────┤     ├─────────────────┤
│ id              │◀────│ userId          │
│ name            │     │ checkInType     │
│ email           │     │ pointsEarned    │
│ level           │     │ validationMethod│
│ points          │     │ checkInTime     │
│ currentStreak   │     └─────────────────┘
│ totalWorkouts   │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐     ┌─────────────────┐
│  ActivityLog    │     │  WeeklyStats    │
├─────────────────┤     ├─────────────────┤
│ userId          │     │ userId          │
│ activityType    │     │ year            │
│ points          │     │ week            │
│ description     │     │ workoutsCompleted│
│ createdAt       │     │ totalPoints     │
└─────────────────┘     │ isPerfectWeek   │
                        └─────────────────┘
```

---

## 🚀 Producción

### Deploy en Railway/Render

1. **Conectar repositorio**
2. **Configurar variables de entorno**
3. **Agregar PostgreSQL**
4. **Ejecutar migraciones:**
   ```bash
   npm run prisma:migrate:prod
   ```

### Variables para Producción

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://..."

# JWT Secrets (generar aleatorios)
JWT_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)

# CORS (dominio de tu app)
ALLOWED_ORIGINS="https://tu-app.expo.app"
```

### Seguridad

- ✅ Helmet.js para headers de seguridad
- ✅ Rate limiting para prevenir abuso
- ✅ CORS configurado
- ✅ Passwords hasheados con bcrypt
- ✅ JWT con expiración

---

## 📞 Soporte

Para reportar errores o solicitar características:
- Email: soporte@quantumfit.com
- Documentación: Ver archivos en `/src`

---

<div align="center">

**QUANTUM FIT** - *Tu mejor versión comienza aquí*

Hecho con 💙 para la comunidad fitness

</div>
