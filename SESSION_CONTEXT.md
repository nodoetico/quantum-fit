# QuantumFit — Session Context

> Última actualización: 5 de junio de 2026 (fin de Sesión 7)

---

## Project Overview

QuantumFit es un sistema de gestión de gimnasio con gamificación (niveles, puntos, logros, rachas).

| Componente | Ubicación | Tech Stack |
|---|---|---|
| App Móvil (Expo) | `quantum-fit-app/` | React Native, Expo SDK 54, React Navigation |
| Backend API | `quantum-fit-backend/` | Node.js, Express, Prisma, PostgreSQL |
| Landing Page | `quantum-fit-landing/` | Astro |
| Admin Panel | `quantum-fit-admin/` | React + Vite |

---

## Test Credentials

| Usuario | Email | Password | Nivel | Puntos | DNI |
|---|---|---|---|---|---|
| Admin | `admin@quantumfit.com` | `Admin123!` | 1 | 0 | — |
| Demo | `demo@quantumfit.com` | `Demo123!` | 5 | 3250 | 47931799 |

---

## Current Architecture

### Navigation Structure

`src/navigation/` modular:

| File | Content |
|---|---|
| `AppNavigator.tsx` | Root — renderiza SplashScreen, AuthStack o MainStack según `isLoading`/`isAuthenticated` |
| `SplashScreen.tsx` | Logo "QUANTUM FIT" neón + spinner |
| `AuthStack.tsx` | Login, Register, ForgotPassword |
| `MainTabs.tsx` | BottomTabNavigator: Dashboard, Turnos, Beneficios, Ranking, Perfil |
| `MainStack.tsx` | StackNavigator: MainTabs + Notificaciones, HistorialPremios, Configuracion, CheckIn, DatosCrystal, Membresia, Checkout, MiSuscripcion, HistorialPagos |

### Theme (Dark / Neon)
- `colors.primary` = `#00F0FF` (cyan neón)
- `colors.secondary` = `#39FF14` (verde neón)
- `colors.background` = `#0A0A0A`
- `colors.backgroundCard` = `#1A1A1A`

### API Connection
- Development: `EXPO_PUBLIC_API_URL=http://192.168.100.28:3000/api`
- Production: (pendiente — URL de Railway)
- 401 interceptor salta refresh para `/auth/login` y `/auth/register`

---

## Backend Endpoints

### Health
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Health check |

### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro |
| POST | `/api/auth/login` | No | Login (rate limit: 10 req/15min) |
| POST | `/api/auth/refresh` | No | Refresh token |
| POST | `/api/auth/forgot-password` | No | Solicitar reseteo (respuesta genérica) |
| POST | `/api/auth/reset-password` | No | Resetear password con token |
| GET | `/api/auth/me` | JWT | Perfil del usuario logueado |

### MercadoPago / Membresía
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/mercadopago/create-preference` | JWT | Crear preferencia de pago |
| POST | `/api/mercadopago/webhook` | No | Webhook de MP |
| POST | `/api/mercadopago/manual-approve` | JWT | Activación manual (demo) |
| POST | `/api/payments/subscription` | JWT | Obtener suscripción actual |
| GET | `/api/payments/history` | JWT | Historial de pagos |
| GET | `/api/payments/methods` | JWT | Métodos de pago (Crystal) |
| GET | `/api/payments/enrollment` | JWT | Estado afiliación Crystal |

### Crystal Integration (Pull)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/external-pull/test` | JWT | Test conexión Crystal |
| GET | `/api/external-pull/profile` | JWT | Perfil desde Crystal |
| GET | `/api/external-pull/memberships` | JWT | Membresías desde Crystal |
| GET | `/api/external-pull/attendances` | JWT | Asistencias desde Crystal |
| GET | `/api/external-pull/transactions` | JWT | Transacciones desde Crystal |
| GET | `/api/external-pull/all` | JWT | Todos los datos combinados |

### External Sync (Check-in desde software del gimnasio)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/external/checkin` | API Key | Registrar entrada/salida |
| POST | `/api/external/checkin/batch` | API Key | Check-in batch |
| GET | `/api/external/user/:dni` | API Key | Consultar usuario por DNI |

### Check-in App
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/checkins/checkin` | JWT | Check-in desde app |
| GET | `/api/checkins/history` | JWT | Historial de check-ins |
| GET | `/api/checkins/stats` | JWT | Estadísticas |

---

## 7 Puntos Críticos del Sistema (Verificados)

### 1. Crystal Pull (Conexión con el sistema del gimnasio)
- **Endpoint**: Crystal API `https://crystal.getmifit.app`
- **Auth**: Login con email/password → obtiene Bearer token → refresca automáticamente cada 24hs
- **Datos obtenibles**: perfil (nombre, DNI), membresías, asistencias, transacciones, afiliación
- **Estado**: ✅ Verificado — todos los endpoints responden con datos reales de "Vilte Pablo" (DNI: 47931799)

### 2. External Check-in (Integración con software de acceso)
- **POST** `/api/external/checkin` — requiere DNI + timestamp ISO + type (ENTRY/EXIT)
- **Protección**: Header `X-API-Key: gimnasio_quantum_fit_2026_clave_secreta_xyz789`
- **Validaciones**: DNI existe en DB → 404 si no. Duplicado mismo día → rechazado con mensaje
- **Puntos**: ENTRY suma +50, EXIT registra salida
- **Documentación**: `INTEGRACION/INSTRUCCIONES_PARA_PROGRAMADOR.md`
- **Consulta**: `GET /api/external/user/:dni` — devuelve nombre, email, DNI, puntos, nivel, racha, activo
- **Estado**: ✅ Verificado end-to-end con curl

### 3. MercadoPago / Membresía
- **Crear preferencia**: `POST /api/mercadopago/create-preference` → devuelve URL de checkout (sandbox/producción)
- **Webhook**: `POST /api/mercadopago/webhook` — procesa pagos aprobados y crea subscription en DB
- **Activación manual**: `POST /api/mercadopago/manual-approve` — para testing sin tarjeta
- **Flujo completo verificado**: create-preference → manual-approve → subscription ACTIVE → payment history → Crystal enrollment
- **Tarjeta de prueba sandbox**: Mastercard 5031 7557 3453 0604, fecha futura cualquiera, CVC 123
- **Estado**: ✅ Verificado

### 4. Seguridad (Sesión 3)
- JWT secrets sin fallbacks hardcodeados
- Access token: 15 min | Refresh token: 7 días
- Rate limiting: 10 intentos/login cada 15 min por IP
- Password policy: 8+ chars, 1 mayúscula, 1 minúscula, 1 número
- SecureStore para tokens (expo-secure-store)
- `.gitignore` protege secrets
- **Estado**: ✅ Implementado

### 5. Email (Forgot Password + Nodemailer)
- `forgotPassword()` retorna `void` — token nunca se devuelve al cliente
- Servicio `email.service.ts` con HTML template neón
- SMTP configurable (Gmail, Outlook, cualquier proveedor)
- Sin SMTP configurado → fallback a console.log (desarrollo)
- **Estado**: ⚠️ Código listo, SMTP bloqueado (Gmail rechaza app password)

### 6. Navegación y UX
- Navigation modularizado en 5 archivos
- SplashScreen con logo neón
- ForgotPassword con 3 pasos (email → "revisá tu email" → token + password)
- Dashboard con stats, racha, nivel, puntos
- Ranking con podium adaptativo
- Perfil con pestañas (stats, logros, actividad)
- **Estado**: ✅ Implementado

### 7. Deploy a Producción (En curso)
- **Dockerfile** actualizado: multistage build con Prisma generate + migrate deploy
- **Git**: Repo creado en `github.com/nodoetico/quantum-fit`
- **Railway**: CLI instalado, pendiente token de API
- **Próximo**: Deploy del backend + PostgreSQL en Railway, configurar webhook MP, actualizar frontend
- **Estado**: 🚧 En progreso

---

## Session History

### Session 7 — Deploy prep: Docker, Git, GitHub + Railway setup

**Goal:** Preparar backend para deploy en Railway.

**Hecho:**
1. **Dockerfile actualizado** (`quantum-fit-backend/Dockerfile`):
   - Added `RUN npx prisma generate` en builder stage
   - Added `RUN apk add --no-cache openssl` en runner (necesario para Prisma en Alpine)
   - CMD cambiado a shell form: `npx prisma migrate deploy && node dist/index.js`
2. **`.gitignore`** creado en raíz del monorepo
3. **Git init** + primer commit (214 archivos)
4. **GitHub repo** creado: `github.com/nodoetico/quantum-fit` (público)
5. **Railway CLI** instalado globalmente, pendiente token de API del usuario

**Pendiente (usuario debe generar token en railway.app):**
- `railway login` con token
- `railway init` → crear proyecto
- `railway add postgres` → agregar DB
- Configurar secrets (JWT, MP, Crystal, etc.)
- `railway up` → deploy
- Configurar dominio público + webhook MP

### Session 6 — Membresía / MercadoPago flow

**Goal:** Verificar flujo completo de pago y membresía.

**Verificado:**
1. **Crear preferencia MP**: ✅ `POST /api/mercadopago/create-preference` → URL sandbox checkout
2. **Activación manual**: ✅ `POST /api/mercadopago/manual-approve` → usuario VIP, subscription ACTIVE
3. **Consultar suscripción**: ✅ `GET /api/payments/subscription` — datos correctos con fechas
4. **Historial de pagos**: ✅ `GET /api/payments/history` — pago registrado
5. **Afiliación Crystal**: ✅ `GET /api/payments/enrollment` — datos de afiliación + renovación
6. **Métodos de pago (Crystal)**: ✅ 5 métodos (Efectivo, Transferencia, Tarjeta, Dinero, Débito)

### Session 5 — Email enumeration fix + Nodemailer

**Fixes:**
1. `backend/src/services/auth.service.ts` — `forgotPassword` retorna `void`
2. `backend/src/services/email.service.ts` — Nuevo servicio Nodemailer con HTML template
3. `app/src/context/AuthContext.tsx` — `resetPassword`: `Promise<string>` → `Promise<boolean>`
4. `app/src/screens/auth/ForgotPasswordScreen.tsx` — Nuevo flujo 3 pasos
5. `.env.example` — SMTP vars reemplazan SENDGRID_API_KEY

### Session 4 — Modularización de navegación

- AppNavigator partido en 5 archivos (SplashScreen, AuthStack, MainTabs, MainStack)
- Historial de pagos simplificado (inline → botón a pantalla dedicada)
- Eliminados componentes no usados

### Session 3 — Security audit & hardening

- JWT secrets sin fallbacks, 15min access / 7d refresh
- Password: 8+ chars, mayúscula, minúscula, número
- Login rate limiter 10 req/15min
- SecureStore para tokens
- `.gitignore` con secrets protegidos

### Session 2 — Bugfixes navegación + UI

- Fix login (getCurrentUser ahora llama API, no usa caché ciega)
- Fix 401 interceptor (salta refresh en endpoints de auth)
- SplashScreen, ranking con podium, Dashboard con Crystal section

### Session 1 — Crystal integration + external check-in

- Crystal pull service completo (profile, memberships, attendances, transactions)
- External check-in endpoint (entry, exit, batch, user lookup)
- DNI field en modelo User

---

## Environment Variables (Backend `.env`)

```env
# Node
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://quantumfit:password123@localhost:5432/quantumfit?schema=public

# JWT
JWT_SECRET=quantum_fit_jwt_secret_key_2026_super_seguro_1234567890
REFRESH_TOKEN_SECRET=quantum_fit_refresh_secret_key_2026_super_seguro_abcdefgh
RESET_TOKEN_SECRET=quantum_fit_reset_token_secret_2026

# CORS
ALLOWED_ORIGINS=*
ORIGIN=http://localhost:3000

# Crystal External API (Pull)
EXTERNAL_API_URL=https://crystal.getmifit.app
EXTERNAL_API_TOKEN=
EXTERNAL_USER_EMAIL=nodoetico@gmail.com
EXTERNAL_USER_PASSWORD=AdN1yTq7RAfIXzZl

# External Sync (Check-in desde software del gimnasio)
INTEGRATION_API_KEY=gimnasio_quantum_fit_2026_clave_secreta_xyz789

# MERCADOPAGO - Sandbox
MERCADOPAGO_ACCESS_TOKEN=TEST-8770022280503036-112621-2a9e80579f6a0960d0a1d02787fecca7-462069879
MERCADOPAGO_NOTIFICATION_URL=https://quantumfit-test.loca.lt/api/mercadopago/webhook
MERCADOPAGO_SUCCESS_URL=quantumfit://payment/success
MERCADOPAGO_FAILURE_URL=quantumfit://payment/failure
MERCADOPAGO_PENDING_URL=quantumfit://payment/pending

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nodoetico@gmail.com
SMTP_PASS=wzthxztmifidygti
EMAIL_FROM=nodoetico@gmail.com
```

---

## TypeScript Status
- Backend: `npx tsc --noEmit` → 0 errors
- App: `npx tsc --noEmit` → 0 errors

---

## Deploy a Railway — Pasos para terminar

### Prerrequisito: Generar API Token
1. Ir a https://railway.app
2. Login con GitHub (cuenta `nodoetico`)
3. Avatar → Profile Settings → Tokens → Generate New Token
4. Copiar el token

### Una vez tengas el token, ejecutar:
```bash
# 1. Login con token
export RAILWAY_API_TOKEN="token_que_generaste"
railway login

# 2. Crear proyecto (desde raíz del repo)
railway init --name quantum-fit

# 3. Agregar PostgreSQL
railway add postgres

# 4. Configurar variables de entorno (cada una con --key=value)
railway vars set JWT_SECRET="..."
railway vars set REFRESH_TOKEN_SECRET="..."
railway vars set RESET_TOKEN_SECRET="..."
railway vars set ALLOWED_ORIGINS="https://admin.quantumfit.com,https://quantumfit.com"
railway vars set INTEGRATION_API_KEY="gimnasio_quantum_fit_2026_clave_secreta_xyz789"
railway vars set EXTERNAL_API_URL="https://crystal.getmifit.app"
railway vars set EXTERNAL_USER_EMAIL="nodoetico@gmail.com"
railway vars set EXTERNAL_USER_PASSWORD="AdN1yTq7RAfIXzZl"
railway vars set MERCADOPAGO_ACCESS_TOKEN="TEST-8770022280503036-112621-..."
railway vars set MERCADOPAGO_NOTIFICATION_URL="https://quantumfit.railway.app/api/mercadopago/webhook"
railway vars set SMTP_HOST="smtp.gmail.com"
railway vars set SMTP_PORT="587"
railway vars set SMTP_USER="nodoetico@gmail.com"
railway vars set SMTP_PASS="wzthxztmifidygti"
railway vars set EMAIL_FROM="nodoetico@gmail.com"
railway vars set NODE_ENV="production"

# 5. Deploy
railway up --service quantum-fit-backend

# 6. Ver dominio asignado
railway domain

# 7. Configurar webhook MP con el dominio real de Railway
```

### Después del deploy
1. **Actualizar webhook MP**: La URL de notificación debe apuntar al dominio real de Railway
2. **Actualizar frontend**: Cambiar `EXPO_PUBLIC_API_URL` a `https://quantumfit.railway.app/api`
3. **Configurar SMTP**: Si sigue sin funcionar, probar con otro proveedor (SendGrid, Mailgun, etc.)
4. **Verificar**: `GET /health` desde el dominio de Railway

---

## Running the App (Development)
```bash
# Backend
cd quantum-fit-backend
npx tsx src/index.ts

# App
cd quantum-fit-app
npx expo start
```
