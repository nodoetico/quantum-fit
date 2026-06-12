# QuantumFit — Session Context

> Última actualización: 12 de junio de 2026 (fin de Sesión 10)

---

## Project Overview

QuantumFit es un sistema de gestión de gimnasio con gamificación (niveles, puntos, logros, rachas).

| Componente | Ubicación | Tech Stack |
|---|---|---|
| App Móvil (Expo) | `quantum-fit-app/` | React Native, Expo SDK 54, React Navigation |
| Backend API | `quantum-fit-backend/` | Node.js, Express, Prisma, PostgreSQL |
| Landing Page | `quantum-fit-landing/` | Next.js |
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

### Crystal Integration (Unified Auth)
- Auth compartida en `crystal-auth.service.ts` (antes duplicada en pull + payment)
- Token con TTL 1h + caché disco en `data/crystal-token.json`
- Credenciales Crystal: `nicolas@crystal-desarrollo.com` (desde .env)
- Sin hardcoded fallbacks

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
- **Estado**: ✅ Verificado — búsqueda por DNI trae datos reales. Ya NO hay fallback a `/user/me` que filtrara datos de "Vilte Pablo"

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

### 7. Deploy a Producción (Completado — Railway operativo)
- **Railway**: ✅ Proyecto `quantum-fit` creado en railway.app
- **PostgreSQL**: ✅ Agregado y online (`Postgres` service, SFO region)
- **Backend**: ✅ Deployado y corriendo en https://quantum-fit-backend-production.up.railway.app
- **Health check**: ✅ `GET /health` responde OK
- **Dockerfile**: Simplificado a single stage (se eliminó multistage por problemas de permisos con appuser)
- **Variables de entorno**: ✅ JWT, MP, SMTP, Crystal, CORS configuradas
- **Webhook MP**: ✅ Actualizado con dominio real de Railway
- **Migraciones DB**: ✅ 3 migraciones aplicadas (init, roles/payments, dni/external)
- **Estado**: ✅ Backend en producción

---

## Session History

### Session 8 — Bugfixes pre-producción: Crystal auth, errores silenciosos, flujo de pago

**Goal:** Corregir bugs críticos, errores silenciosos y configurar la app móvil para producción.

**FASE 1 — Bugs que crashean la app:**
1. `alert()` → `Alert.alert()` en `BeneficiosScreen.tsx` (crash en Android)
2. Deep linking configurado en `AppNavigator.tsx` (scheme `quantumfit://`)
3. Plugin `expo-camera` + permisos iOS/Android en `app.json`
4. Interfaz `Booking` expandida en `types/index.ts` (antes solo `{ id: string }`)

**FASE 2 — Flujos críticos:**
5. `Linking.addEventListener` en `CheckoutScreen.tsx` para detectar vuelta de MercadoPago
6. `websocketService.disconnect()` en cleanup del `useEffect` de `AuthContext.tsx`
7. Race condition de refresh token corregida con cola de promesas en `api.ts`
8. Helper `isTokenExpired()` + verificación pre-carga en `AuthContext.tsx`

**FASE 3 — Errores silenciosos:**
9. `console.error()` agregado en ~15 catch blocks vacíos (AuthContext, BeneficiosScreen, external-pull, payment, mercadopago, DashboardScreen)

**FASE 4 — Config producción:**
10. `STORAGE_KEYS` exportadas desde `secureStorage.ts`; todas las keys hardcodeadas en `api.ts` reemplazadas
11. WebSocket reconexión: `5` → `20` intentos, `reconnectionDelayMax: 10000`
12. Timeout configurable vía `EXPO_PUBLIC_API_TIMEOUT` en `src/config/api.ts`
13. `SECURE_KEYS` tipado como `string[]` explícito (evita TS2345)

**FASE 5 — Refactor integración Crystal (6 problemas detectados + corregidos):**
14. **Password hardcodeado eliminado**: `external-pull.service.ts` ya no tiene `'AdN1yTq7RAfIXzZl'` como fallback
15. **Auth unificada**: Creado `src/services/crystal-auth.service.ts` — ambos servicios (pull + payment) lo importan. TTL 1h + caché en disco
16. **`renewalPrice` siempre 0 corregido**: ahora consulta `getEnrollmentStatus()` post-pago para obtener el precio real
17. **Catch blocks vacíos llenados**: 8 bloques en backend + 1 en app con `console.error` descriptivo
18. **Token persistente**: caché a disco + TTL refresh automático (1h)
19. **Mutación de parámetro eliminada**: `user.points +=` reemplazado por `prisma.update({ increment })`

**Resultado:** `npx tsc --noEmit` → **0 errores** en backend y app.

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
EXTERNAL_API_TOKEN=                         # ← Sin uso (login se hace con email+password)
EXTERNAL_USER_EMAIL=nicolas@crystal-desarrollo.com
EXTERNAL_USER_PASSWORD=test123456789!

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
- Backend: `npx tsc --noEmit` → **0 errors** ✅
- Admin: `npx tsc -p tsconfig.app.json --noEmit` → **3 errors pre-existentes en ImageUpload.tsx** ⚠️
- Landing: `npx tsc --noEmit` → **0 errors** ✅
- App: `npx tsc --noEmit` → **0 errors** ✅

---

## Deploy a Railway — Pasos para terminar

### ⚠️ Bloqueante: Generar API Token
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
railway vars set JWT_SECRET="quantum_fit_jwt_secret_key_2026_super_seguro_1234567890"
railway vars set REFRESH_TOKEN_SECRET="quantum_fit_refresh_secret_key_2026_super_seguro_abcdefgh"
railway vars set RESET_TOKEN_SECRET="quantum_fit_reset_token_secret_2026"
railway vars set ALLOWED_ORIGINS="https://admin.quantumfit.com,https://quantumfit.com"
railway vars set INTEGRATION_API_KEY="gimnasio_quantum_fit_2026_clave_secreta_xyz789"
railway vars set EXTERNAL_API_URL="https://crystal.getmifit.app"
railway vars set EXTERNAL_USER_EMAIL="nicolas@crystal-desarrollo.com"
railway vars set EXTERNAL_USER_PASSWORD="test123456789!"
railway vars set MERCADOPAGO_ACCESS_TOKEN="TEST-8770022280503036-112621-2a9e80579f6a0960d0a1d02787fecca7-462069879"
railway vars set MERCADOPAGO_NOTIFICATION_URL="https://quantumfit.railway.app/api/mercadopago/webhook"
railway vars set MERCADOPAGO_SUCCESS_URL="quantumfit://payment/success"
railway vars set MERCADOPAGO_FAILURE_URL="quantumfit://payment/failure"
railway vars set MERCADOPAGO_PENDING_URL="quantumfit://payment/pending"
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
2. **Actualizar frontend**: Cambiar `EXPO_PUBLIC_API_URL` react-native en el build de EAS a `https://quantumfit.railway.app/api`
3. **Compilar app**: `npx eas build --platform all`
4. **Configurar SMTP**: Si sigue sin funcionar, probar con otro proveedor (SendGrid, Mailgun, etc.)
5. **Verificar**: `GET /health` desde el dominio de Railway

---

## Session 9 — Deploy a Railway + Entrega

**Goal:** Deploy backend a Railway y preparar documentación de entrega.

**Hecho:**
1. ✅ Railway CLI instalado
2. ✅ Login con `nodoetico@gmail.com` via browserless OAuth
3. ✅ Proyecto `quantum-fit` inicializado
4. ✅ PostgreSQL agregado (2 instancias creadas por error, `Postgres-k41-` eliminada)
5. ✅ 16 variables de entorno configuradas
6. ✅ Backend deployado (3 intentos de build hasta éxito)
   - Fix 1: `--chown=appuser:appuser` para permisos de Prisma
   - Fix 2: Crear start.sh antes de `USER appuser`  
   - Fix 3: Simplificar Dockerfile a single stage (eliminar multistage por problema con node no-root)
7. ✅ `MERCADOPAGO_NOTIFICATION_URL` actualizada con dominio real
8. ✅ `.env` de app móvil actualizado con URL de Railway
9. ✅ Documento `ENTREGA_A_PROPIETARIA.md` creado

**Pendiente para próxima sesión:**
1. SMTP — Generar contraseña de aplicación de Gmail y setear `SMTP_PASS`
2. Build de la app — Instalar EAS CLI, configurar, y buildear
3. Migrar cuentas a Gmail genérico de la propietaria
4. MercadoPago — Cambiar de sandbox a producción

**URLs:**
- API: https://quantum-fit-backend-production.up.railway.app
- Health: https://quantum-fit-backend-production.up.railway.app/health
- Railway Dashboard: https://railway.app/project/4eff5ceb-1f3f-4ceb-b880-1f697686174b
- GitHub: https://github.com/nodoetico/quantum-fit

## Session 10 — Admin/Landing fixes + Premios CRUD + Features section + Crystal data leak fix

**Goal:** Corregir errores visuales del admin/landing, agregar Features section, agregar CRUD de canjes, y fixear fuga de datos de Crystal.

### Landing fixes:
1. ✅ Puerto cambiado a 3001 (evita conflicto con backend en 3000)
2. ✅ Root `package.json` con `concurrently` para `npm run dev` que inicia backend + landing
3. ✅ Galería: CSS `columns-*` → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (simetría)
4. ✅ Ubicaciones: `flex flex-col flex-1` para alturas iguales en cards
5. ✅ Seed: todos los upserts cambiados a `create` + `.catch(() => {})` — nunca sobrescribe datos del usuario
6. ✅ Navbar: eliminado link "Cursos"
7. ✅ "Ofertas" renombrado a "Planes" en navbar, section id, heading, Hero CTA
8. ✅ Hero CTA link corregido en DB (`#ofertas` → `#planes`)
9. ✅ Imágenes agregadas en: Nosotros (banner), CursosClases (banner), Contacto (banner + título/descripción dinámicos), Buffet (imagen de categoría)
10. ✅ DescargaApp: agregado `id="descargar"` para anchor del navbar
11. ✅ Navbar: "Testimonios" ahora es dropdown con "¿Por qué Quantum Fit?" y "Nosotros"
12. ✅ Creada sección **Features** (`Features.tsx`) que renderiza el contenido editado desde Admin > Landing > Contenido > Features

### Admin fixes:
13. ✅ Banner tab eliminado (componente `BannersSection` eliminado, tab quitado de TABS)
14. ✅ Content list: thumbnails de imágenes agregados
15. ✅ Buffet admin: imágenes mostradas en cards de items
16. ✅ Premios: texto `text-dark-400` → `text-primary-400` en tabs, filtros, empty states (era negro sobre negro)
17. ✅ Canjes (CRUD completo):
    - Backend: `POST /api/admin/rewards/redemptions` (crear canje manual para cualquier usuario)
    - Backend: `DELETE /api/admin/rewards/redemptions/:id` (eliminar canje, revierte puntos y stock)
    - Frontend: formulario para crear canje (selector de usuario + premio + notas)
    - Frontend: botón 🗑️ para eliminar canje en cada fila de la tabla

### Crystal data leak fix:
18. **`external-pull.service.ts`**: Eliminado el fallback a `/user/me` cuando falla la búsqueda por DNI. Esto paró la fuga de datos de "Vilte Pablo" a usuarios nuevos que no existen en Crystal. Ahora devuelve `null`.
19. **`auth.service.ts`**: Al registrarse un usuario con DNI, automáticamente sincroniza perfil, membresías y asistencias desde Crystal (MiFit). No bloquea el registro si Crystal no responde.

### Commits:
- `d244d9e` — NaN guards + port conflict fix + root dev script
- `107882c` — gallery grid, card heights, seed no-overwrite, navbar cleanup, Ofertas→Planes, remove Banners tab
- `c92cab1` — image display in Nosotros, Clases, Contacto, Buffet sections + admin
- `b329bd8` — Features section, canjes CRUD, Premios text colors
- `4bd7668` — navbar dropdown for Testimonios
- `3e629b4` — usersService → authService fix
- `4b175c4` — add id to DescargaApp section
- `96d9d2d` — stop Vilte data leak + auto-sync Crystal data on registration

### Current URLs/dev:
- Backend: `http://localhost:3000` (health ✅)
- Landing: `http://localhost:3001`
- Admin: `http://localhost:5173`
- Root: `npm run dev` inicia backend + landing

### Admin login:
- `admin@quantumfit.com` / `Admin123!`

### Next steps (pendientes):
1. Hacer build de la app mobile con EAS CLI
2. Deploy frontends (admin + landing) a Railway
3. Configurar SMTP funcional (contraseña de app Gmail)
4. Migrar cuentas a Gmail de la propietaria
5. MercadoPago: cambiar de sandbox a producción

---
## Running the App (Development)
```bash
# Backend
cd quantum-fit-backend
npx tsx src/index.ts

# App
cd quantum-fit-app
npx expo start

# Full stack (landing + backend)
cd quantum-fit
npm run dev
```
