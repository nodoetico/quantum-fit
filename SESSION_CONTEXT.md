# QuantumFit — Session Context

> Este archivo se actualiza al final de cada sesión para que al retomar sepas exactamente dónde quedamos.
> Última actualización: 4 de junio de 2026 (fin de Sesión 5)

---

## Project Overview

QuantumFit es un sistema de gestión de gimnasio con gamificación (niveles, puntos, logros, rachas). Tiene 3 componentes:

| Componente | Ubicación | Tech Stack |
|---|---|---|
| App Móvil (Expo) | `quantum-fit-app/` | React Native, Expo SDK 54, React Navigation |
| Backend API | `quantum-fit-backend/` | Node.js, Express, Prisma, PostgreSQL |
| Landing Page | `quantum-fit-landing/` | (no intervenido) |

---

## Test Credentials

| Usuario | Email | Password | Nivel | Puntos |
|---|---|---|---|---|
| Admin | `admin@quantumfit.com` | `Admin123!` | 1 | 0 |
| Demo | `demo@quantumfit.com` | `Demo123!` | 5 | 3250 |

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

```
NavigationContainer
├── isLoading == true → SplashScreen
├── !isAuthenticated → AuthStack (AuthStack.tsx)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
└── isAuthenticated → MainStack (MainStack.tsx)
    ├── MainTabs (MainTabs.tsx)
    │   ├── Dashboard ("Inicio")
    │   ├── Turnos
    │   ├── Beneficios ("Premios")
    │   ├── Ranking
    │   └── Perfil [params: {tab?: 'stats'|'achievements'|'activity'}]
    ├── Notificaciones
    ├── HistorialPremios
    ├── Configuracion
    ├── CheckIn
    ├── DatosCrystal
    ├── Membresia
    ├── Checkout {plan, paymentMethods}
    ├── MiSuscripcion
    └── HistorialPagos
```

### Theme (Dark / Neon)
- `colors.primary` = `#00F0FF` (cyan neón)
- `colors.secondary` = `#39FF14` (verde neón)
- `colors.background` = `#0A0A0A`
- `colors.backgroundCard` = `#1A1A1A`
- `spacing.md` = 12, `spacing.lg` = 16, `spacing.xl` = 24

### API Connection
- `EXPO_PUBLIC_API_URL=http://192.168.100.28:3000/api` (IP local para pruebas con teléfono)
- 401 interceptor salta refresh para `/auth/login` y `/auth/register`

---

## Session History

### Session 5 — Email enumeration fix + servicio de email (Nodemailer)

**Goal:** Eliminar email enumeration en forgot-password e implementar envío real de emails.

**Problema:** El endpoint `POST /api/auth/forgot-password` devolvía el token de reseteo al cliente cuando el email existía, y `''` cuando no. La app usaba eso para decidir si mostrar el paso 2 o un error, permitiendo enumerar qué emails están registrados.

**Fixes:**
1. **`backend/src/services/auth.service.ts`** — `forgotPassword` ahora retorna `void`. El token ya no se devuelve al cliente. Se delega el envío a `email.service.ts`.
2. **`backend/src/services/email.service.ts`** — **Nuevo.** Servicio de email con Nodemailer:
   - Si `SMTP_HOST`, `SMTP_USER` y `SMTP_PASS` están configurados en `.env` → envía email real con HTML template (neon themed)
   - Si no hay SMTP configurado → muestra el token en consola (desarrollo)
   - Compatible con Gmail, Outlook, cualquier SMTP
3. **`app/src/context/AuthContext.tsx`** — `resetPassword` cambió de `Promise<string>` a `Promise<boolean>` (ya no espera token del backend)
4. **`app/src/screens/auth/ForgotPasswordScreen.tsx`** — Nuevo flujo: email → pantalla genérica "Revisá tu email" (sin distinguir si existe o no) → opción "Ingresar código de reseteo" manual + formulario de nueva contraseña
5. **`.env.example`** — `SENDGRID_API_KEY` reemplazado por `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**TypeScript:** `npx tsc --noEmit` → 0 errores (backend y app).

### Session 4 — Redundancy cleanup & navigation modularization

**Goal:** Eliminar código duplicado/poco usado y dividir AppNavigator en módulos.

**Step 3: Historial de pagos simplificado**
- `MiSuscripcionScreen.tsx` (400→316 lines): eliminada la lista inline de pagos locales que duplicaba `HistorialPagosScreen`.
- Reemplazada por botón "Ver historial completo de pagos" → navega a `HistorialPagosScreen`.
- Eliminados: `LocalPayment`, `EmptyState`, `getPaymentStatusLabel`, `paymentService.getMyPaymentHistory()`.

**Step 4: AppNavigator modularizado**
- `AppNavigator.tsx` (257→16 lines): root que importa módulos.
- Nuevos archivos en `src/navigation/`:
  - `SplashScreen.tsx` — splash con logo neón + spinner
  - `AuthStack.tsx` — Login, Register, ForgotPassword
  - `MainTabs.tsx` — 5 tabs (Inicio, Turnos, Premios, Ranking, Perfil)
  - `MainStack.tsx` — MainTabs + 9 pantallas stack
- `tsc --noEmit`: 0 errores (app y backend).

### Session 3 — Security audit & hardening

**Goal:** Revisar vulnerabilidades de seguridad y corregir las críticas.

**Security audit findings:**
| Severidad | Hallazgo |
|---|---|
| 🔴 CRÍTICO | Backend sin `.gitignore` — `.env` con secrets reales (DB password, JWT, Crystal API token) a punto de committearse |
| 🔴 CRÍTICO | JWT secrets con fallbacks hardcodeados (`'default-secret-change-me'`) — cualquiera puede firmar tokens |
| 🔴 CRÍTICO | Password policy débil — solo 6 caracteres mínimo, sin complejidad requerida |
| 🟠 ALTO | Access token expira en 7 días (debería ser 15-60 min) |
| 🟠 ALTO | Refresh token expira en 30 días |
| 🟠 ALTO | CORS default `*` si no se configura `ALLOWED_ORIGINS` |
| 🟠 ALTO | Login sin rate limiting específico — 100 req/15min facilita brute force |
| 🟡 MEDIO | Email enumeration en forgot-password |
| 🟡 MEDIO | Tokens JWT en AsyncStorage (sin encriptar) |
| 🟡 MEDIO | Conexión HTTP en desarrollo |
| 🟡 MEDIO | Sin bloqueo por intentos fallidos de login |

**Fixes aplicados:**

1. **🔴 `.gitignore` backend creado** — Excluye `.env`, `node_modules/`, `dist/`, logs, etc.
2. **🔴 JWT secrets seguros** (`jwt.ts`):
   - Eliminados fallbacks hardcodeados. Ahora usa `requireEnv()` con lazy getters (se evalúan en runtime, después de `dotenv.config()`).
   - Si `JWT_SECRET` o `REFRESH_TOKEN_SECRET` no están configurados, el server falla al arrancar con mensaje claro.
3. **🔴 Password policy reforzada** (`password.ts` + app):
   - Mínimo 8 caracteres (antes 6).
   - Requiere al menos 1 mayúscula, 1 minúscula, 1 número.
   - Backend y app (LoginScreen, RegisterScreen) sincronizados.
   - Cuentas existentes (`Admin123!`, `Demo123!`) siguen funcionando.
4. **🟠 Expiración de tokens reducida** — Access token: 7d → 15m. Refresh token: 30d → 7d.
5. **🟠 Login rate limiter** — 10 intentos máximo por 15 minutos por IP (antes solo global 100/15min).
6. **🟡 SecureStore para tokens** — Creado `services/secureStorage.ts` que usa `expo-secure-store` para `@quantumfit_token` y `@quantumfit_refresh_token`. AsyncStorage se sigue usando para datos no sensibles (`@quantumfit_user`).
7. **🟠 `.env` y `.env.example` actualizados** — Expiración corregida, `RESET_TOKEN_SECRET` agregado a example.

**Nota:** Quedan pendientes 🟡 medio (email enumeration en forgot-password, conexión HTTP, bloqueo por intentos fallidos) y la recomendación de siempre usar HTTPS en producción.

### Session 2 — Navigation architecture + bugfixes

**Goal:** Revisar y limpiar navegación, fixear bugs de UI.

**Goal:** Limpiar errores de UI/datos, ordenar datos de Crystal, preparar integración.

**Bug principal — Login no funcionaba:**
- `getCurrentUser()` (`api.ts:121`) devolvía el usuario cachead de `AsyncStorage` sin llamar a la API. Aunque el token hubiera expirado o fuera inválido, la app mostraba datos viejos y creía estar autenticada. Al hacer cualquier request que validara el token, el backend respondía 401 y el interceptor intentaba refrescar el token, incluso en endpoints de login — causando un loop de errores.
- **Fix 1 (`getCurrentUser`):** Ahora siempre llama `GET /api/auth/me` primero. Si el token es válido, actualiza la caché. Si el backend responde 401, devuelve `null` (la app cierra sesión). Solo usa el cache de AsyncStorage como fallback si hay un error de red (sin conexión).
- **Fix 2 (401 interceptor):** Se agregó `AUTH_ENDPOINTS = ['/auth/login', '/auth/register']` para que el interceptor **no** intente refresh automático en esos endpoints. Antes, al poner credenciales incorrectas en login, el backend devolvía 401 y el interceptor intentaba refrescar con un token vacío/antiguo, rompiendo el flujo de error.

**Otras correcciones:**
1. **AuthContext.tsx** — Fix `loadUserAchievements`: `data?.all || []`.
2. **AuthContext.tsx** — Fix `loadActivity`: `data?.logs || []`.
3. **DB seed** — Eliminados 6 usuarios duplicados/test, solo quedan admin y demo.
4. **DatosCrystalScreen.tsx** — Rediseño completo: profile card, membresías con dot+badge, asistencias timeline, transacciones cards.
5. **DashboardScreen.tsx** — Sección Crystal: avatar + stats row reemplazan filas tipo formulario.
6. **RankingScreen.tsx** — Reesciro: podium adaptativo 1-3 users, lista global completa, "Tu Posición".
7. **PerfilScreen.tsx** — Stats tab: 3 botones verticales reemplazados por fila compacta (Membresía, Crystal, Ajustes). Logout movido a Configuración.
8. **TypeScript**: `tsc --noEmit` — 0 errores.

### Session 2 (current) — Navigation architecture + bugfixes

**Goal:** Revisar y limpiar navegación, fixear bugs de UI.

#### Issue 1: Ruta muerta `TurnosDetalle`
- **Problem:** `TurnosDetalle` registrado en MainStack pero nunca usado, reusaba TurnosScreen con `as any`.
- **Fix:** Eliminado de `navigation.ts` (MainStackParamList) y de `AppNavigator.tsx` (screen registration).

#### Issue 2: Modal mock vs pantalla real de Configuración
- **Problem:** PerfilScreen tenía modal local con opciones mock ("Próximamente disponible") + botón a ConfiguracionScreen real → confuso.
- **Fix:** Eliminado `settingsModalVisible` state, todo el `<Modal>` block y sus estilos. Solo queda el botón de settings que navega a `ConfiguracionScreen`.

#### Issue 3: Sin loading screen en auth check
- **Problem:** `isLoading` no se usaba en AppNavigator → pantalla parpadeaba al iniciar.
- **Fix:** Creado `SplashScreen` con logo "QUANTUM FIT" neón + `ActivityIndicator`. Se muestra mientras `isLoading === true`.

#### Issue 4: Activity tab — `toLocaleDateString` crash
- **Problem:** API devuelve fechas como string (ISO 8601), no Date. `log.date.toLocaleDateString()` explotaba.
- **Fix:** `AuthContext.tsx:120` — convertir `log.date` a `new Date()` en `loadActivity`. Fallback a `new Date()` si undefined. Plus guard `instanceof Date` en el render.

#### Issue 5: Stats footer icons amontonados
- **Problem:** 3 botones (Membresía, Crystal, Ajustes) en fila con iconos 40px se veían apretados.
- **Fix:** Iconos reducidos 40→32px, `paddingVertical` lg→md (16→12), gap 8→4. `statsFooter` ahora tiene `width: '100%'` para que los `flex: 1` se distribuyan parejo.

---

## Files Modified (Session 4)

| File | Changes |
|---|---|
| `app/src/screens/membresia/MiSuscripcionScreen.tsx` | Removido inline payment history. Botón "Ver historial completo de pagos" → HistorialPagosScreen. Eliminados LocalPayment, EmptyState, getPaymentStatusLabel. |
| `app/src/navigation/AppNavigator.tsx` | Reescripto (257→16 lines). Root que importa módulos. |
| `app/src/navigation/SplashScreen.tsx` | Nuevo — extraído de AppNavigator. |
| `app/src/navigation/AuthStack.tsx` | Nuevo — extraído de AppNavigator. |
| `app/src/navigation/MainTabs.tsx` | Nuevo — extraído de AppNavigator. |
| `app/src/navigation/MainStack.tsx` | Nuevo — extraído de AppNavigator. |

## Files Modified (Session 3)

| File | Changes |
|---|---|
| `backend/.gitignore` | Nuevo — excluye .env, node_modules, dist, logs |
| `backend/src/utils/jwt.ts` | Lazy getters con `requireEnv()`. Expiración: 15m access, 7d refresh |
| `backend/src/utils/password.ts` | Mín 8 chars + mayúscula + minúscula + número |
| `backend/.env` | Expiración actualizada |
| `backend/.env.example` | Expiración actualizada + RESET_TOKEN_SECRET |
| `backend/src/index.ts` | Login rate limiter (10 req/15min) |
| `app/src/services/secureStorage.ts` | Nuevo — wrapper SecureStore + AsyncStorage |
| `app/src/services/api.ts` | Migrado de AsyncStorage a secureStorage para tokens |
| `app/src/screens/auth/LoginScreen.tsx` | Password validation: 8 chars mín |
| `app/src/screens/auth/RegisterScreen.tsx` | Password validation: mayúscula + minúscula + número + 8 chars |

## Files Modified (Overall)

| File | Sessions |
|---|---|
| `quantum-fit-app/src/context/AuthContext.tsx` | 1, 2 |
| `quantum-fit-app/src/services/api.ts` | 1, 3 |
| `quantum-fit-app/src/services/secureStorage.ts` | 3 |
| `quantum-fit-app/src/navigation/AppNavigator.tsx` | 2, 4 |
| `quantum-fit-app/src/navigation/SplashScreen.tsx` | 4 |
| `quantum-fit-app/src/navigation/AuthStack.tsx` | 4 |
| `quantum-fit-app/src/navigation/MainTabs.tsx` | 4 |
| `quantum-fit-app/src/navigation/MainStack.tsx` | 4 |
| `quantum-fit-app/src/types/navigation.ts` | 2 |
| `quantum-fit-app/src/screens/membresia/MiSuscripcionScreen.tsx` | 4 |
| `quantum-fit-app/src/screens/perfil/PerfilScreen.tsx` | 1, 2 |
| `quantum-fit-app/src/screens/auth/LoginScreen.tsx` | 3 |
| `quantum-fit-app/src/screens/auth/RegisterScreen.tsx` | 3 |
| `quantum-fit-app/src/screens/externo/DatosCrystalScreen.tsx` | 1 |
| `quantum-fit-app/src/screens/dashboard/DashboardScreen.tsx` | 1 |
| `quantum-fit-app/src/screens/dashboard/RankingScreen.tsx` | 1 |
| `quantum-fit-backend/.gitignore` | 3 |
| `quantum-fit-backend/.env` | 3 |
| `quantum-fit-backend/.env.example` | 3 |
| `quantum-fit-backend/src/index.ts` | 3 |
| `quantum-fit-backend/src/utils/jwt.ts` | 3 |
| `quantum-fit-backend/src/utils/password.ts` | 3 |
| `quantum-fit-backend/prisma/seed.ts` | 1 |

---

## Crystal Integration Status

**Blocked** — Esperando cuenta de prueba de Nico.

Crystal API solo expone:
- `/user/me`
- `/user/memberships`
- `/user/enrollment`
- `/user/transactions`

NO existen endpoints para listar socios ni consultar por DNI.

**Estrategia:** Usar cuenta compartida de Crystal en backend `.env`. Para que cada usuario de QF vea sus propios datos de Crystal, futuro campo `crystalDni` en modelo User.

**Conexión actual backend:**
```
EXTERNAL_USER_EMAIL=nodoetico@gmail.com
EXTERNAL_USER_PASSWORD=AdN1yTq7RAfIXzZl
```

---

## Remaining Issues / Next Steps

### High Priority
1. **(blocked)** Probar flujo Crystal con cuenta real de Nico.
2. Probar flujo Membresía (Checkout → MiSuscripcion → HistorialPagos) con datos reales.

### Medium Priority
3. ~~**Historial de pagos redundante**~~ — Hecho (Sesión 4). Inline reemplazado por botón a HistorialPagosScreen.
4. ~~**Modularizar navigators**~~ — Hecho (Sesión 4). AppNavigator.tsx partido en 5 archivos.
5. ~~**🟡 Email enumeration en forgot-password**~~ — Hecho (Sesión 5). Respuesta genérica + token nunca se devuelve al cliente. Servicio de email con Nodemailer (SMTP configurable).

### Low Priority
6. TurnosScreen muestra back button en tab (no hay a dónde ir).
7. `membresiaButtonContent`, `membresiaButtonText`, `membresiaBadge`, `membresiaBadgeText` styles no usados en PerfilScreen (remnant de viejo diseño).
8. `logoutButton` / `logoutText` styles no usados en PerfilScreen.

### Configuración SMTP (cuando tengas el mail)
- Editar `.env` del backend:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=quantumfit.gym@gmail.com
  SMTP_PASS=xxxx xxxx xxxx xxxx
  EMAIL_FROM=quantumfit.gym@gmail.com
  ```
- Si es Gmail: activar verificación en 2 pasos → generar contraseña de aplicación
- Si es otro proveedor: usar los datos SMTP que te den
- Sin SMTP configurado: el token se muestra en la consola del servidor (desarrollo)

---

## TypeScript Status
- `npx tsc --noEmit` → 0 errors (app y backend, fin de Sesión 4).

---

## Running the App
```bash
cd quantum-fit-app
npx expo start
```
Asegurar que el teléfono esté en la misma red que el servidor backend. IP backend configurada en `.env`.
