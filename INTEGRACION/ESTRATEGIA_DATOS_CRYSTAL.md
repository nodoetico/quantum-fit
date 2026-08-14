# Estrategia de Datos Crystal — Pull por DNI

## Fecha
Junio 2026

## Contexto

La app QuantumFit necesita mostrar a cada socio sus datos reales de MiFit (perfil, membresías, asistencias, transacciones). El backend de QuantumFit se autentica en Crystal con **una sola cuenta global** (la del gimnasio: `nodoetico@gmail.com`), por lo que llamar a `/user/me`, `/user/memberships`, etc. **siempre devuelve los datos del dueño de esa cuenta** (Vilte), NO los del socio que está usando la app.

## El Problema

Crystal API está diseñada para que cada usuario final se loguee individualmente. QuantumFit necesita un endpoint que acepte un DNI como parámetro y devuelva los datos de ESE usuario específico, autenticando con el token global del gimnasio.

**Nico (Crystal Desarrollo S.R.L.)** no quiere construir ese endpoint porque no entiende el caso de uso: "¿Para qué querés datos de un usuario sin sesión iniciada?".

## Lo que YA funciona por DNI (sin depender de Nico)

Crystal ya expone algunos endpoints que aceptan DNI como parámetro de ruta, autenticados con el Bearer token global:

| Endpoint | Usado en | Status |
|---|---|---|
| `GET /users/by-dni/{dni}/enrollment` | `payment.service.ts:108` | ✅ Funciona |
| `GET /users/by-dni/{dni}/transactions` | `payment.service.ts:194` | ✅ Funciona |

Estos endpoints ya son consumidos por el `PaymentController` y devuelven datos **correctos por usuario**.

## Lo que NO funciona (devuelve datos incorrectos)

Los endpoints del `ExternalPullController` llaman a Crystal SIN pasar el DNI:

| Endpoint | Llama a Crystal | Problema |
|---|---|---|
| `GET /api/external-pull/profile?dni=X` | `GET /user/me` | Ignora el DNI, devuelve datos de Vilte |
| `GET /api/external-pull/memberships?dni=X` | `GET /user/memberships` | Ignora el DNI, devuelve datos de Vilte |
| `GET /api/external-pull/attendances?dni=X` | `GET /user/attendances` | Ignora el DNI, devuelve datos de Vilte |
| `GET /api/external-pull/transactions?dni=X` | `GET /user/transactions` | Ignora el DNI, devuelve datos de Vilte |

## Solución Implementada (Junio 2026)

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `quantum-fit-backend/prisma/schema.prisma` | Se agregó `crystalData Json?` al modelo User |
| `quantum-fit-backend/src/services/external-pull.service.ts` | Reescribir completo con estrategia cache-first + by-dni |

### Estrategia: Cache local + fallback a datos propios

Cada función de pull sigue este orden:

```
1. ¿Hay datos cacheados en User.crystalData?
   ├── Sí → devolver cache
   └── No → ir al paso 2

2. ¿Crystal tiene endpoint /users/by-dni/{dni}/...?
   ├── Sí (200) → cachear + devolver
   └── No (404/500) → ir al paso 3

3. ¿Tenemos datos locales equivalentes?
   ├── Profile → devolver name/email/dni del User local
   ├── Memberships → devolver Subscription local
   ├── Attendances → devolver CheckIn locales
   └── Transactions → devolver Payment locales
```

### Detalle por función

#### `pullUserProfile(dni)`
1. Revisa `User.crystalData.profile`
2. Intenta `GET /users/by-dni/{dni}/profile`
3. Si falla, intenta `GET /users/by-dni/{dni}` (por si existe el endpoint base)
4. Si todo falla, mapea `User.name`, `User.email`, `User.dni` a un objeto `ExternalUser` con `balance: 0`, `qr_code: ''`, `phone: null`
5. Cachea el resultado

**Dato perdido:** No podemos obtener `balance`, `qr_code`, `phone`, `gender`, `blood_type`, `emergency_contact` sin un endpoint de Crystal. Si el usuario completa esos datos en la app, podríamos guardarlos localmente.

#### `pullUserMemberships(dni)`
1. Revisa `User.crystalData.memberships`
2. Intenta `GET /users/by-dni/{dni}/memberships`
3. Si falla, devuelve la `Subscription` local del usuario (status, fechas, tipo de plan)
4. Cachea el resultado

#### `pullUserAttendances(dni, startDate, endDate)`
1. Intenta `GET /users/by-dni/{dni}/attendances` (con parámetros de fecha)
2. Si falla, devuelve los `CheckIn` locales del usuario
3. **No cachea** porque las asistencias cambian constantemente

#### `pullUserTransactions(dni, startDate, endDate)`
1. Intenta `GET /users/by-dni/{dni}/transactions`
2. Si falla, devuelve los `Payment` locales del usuario
3. **No cachea** porque las transacciones cambian constantemente

### Cache: `User.crystalData`

Campo JSON en el modelo User con esta estructura:

```typescript
interface CrystalCache {
  profile?: ExternalUser | null;   // Perfil cacheado de Crystal
  memberships?: ExternalMembership[];  // Membresías cacheadas
  fetchedAt: string;  // ISO timestamp de la última sincronización
}
```

El cache se actualiza cuando:
- Una llamada a Crystal por DNI es exitosa
- Se invoca `syncMembershipsFromExternal` o `syncAttendancesFromExternal`

## Endpoints Push (NO requieren endpoint de Crystal)

QuantumFit ya tiene endpoints para RECIBIR datos de Crystal (push), lo que permite poblar la base local sin depender de pull por DNI:

| Endpoint | Método | Auth | Propósito |
|---|---|---|---|
| `/api/external/checkin` | POST | X-API-Key | Recibir check-in individual |
| `/api/external/checkin/batch` | POST | X-API-Key | Recibir lote de check-ins |
| `/api/external/user/{dni}` | GET | X-API-Key | Verificar si usuario existe |
| `/api/external/sync/status` | POST | X-API-Key | Consultar estado de sync |

Estos endpoints están documentados para Nico en `INSTRUCCIONES_PARA_PROGRAMADOR.md`.

## Lo que todavía depende de Nico

Si Crystal implementa estos endpoints, el sistema los va a usar automáticamente (ya están codificados como `tryCrystalByDni`):

| Endpoint a pedir | Qué datos traería |
|---|---|
| `GET /users/by-dni/{dni}` o `GET /users/by-dni/{dni}/profile` | name, email, dni, balance, qr_code, phone |
| `GET /users/by-dni/{dni}/memberships` | plan, fechas, estado |
| `GET /users/by-dni/{dni}/attendances` | fechas, locación, tipo |

### Argumento para Nico

> "Ya tenés endpoints por DNI para enrollment y transactions (`/users/by-dni/{dni}/enrollment`, `/users/by-dni/{dni}/transactions`) que funcionan perfecto. Solo necesitamos extender el mismo patrón a profile, memberships y attendances para que los socios puedan ver sus datos en la app. Es exactamente el mismo patrón que ya existe."

## Diagrama de Flujo Actual

```
App Móvil                          Backend QuantumFit                   Crystal MiFit
   │                                     │                                  │
   │──── GET /external-pull/profile ────→│                                  │
   │     ?dni=12345678                    │                                  │
   │                                     │──── GET /users/by-dni/12345678/profile ──→│
   │                                     │←── 404 (no existe) ────────────────│
   │                                     │                                  │
   │                                     │── busca en User.crystalData ──→   │
   │                                     │── no hay cache ──→               │
   │                                     │                                  │
   │                                     │── arma perfil desde User local ──→│
   │                                     │   (name, email, dni)              │
   │                                     │                                  │
   │←── { name, email, dni, balance:0 } ──│                                  │
   │                                     │                                  │
   │                                     │── cachea en crystalData ────────→│
```

## Próximos Pasos Recomendados

1. **Corto plazo:** Pedir a Nico los endpoints `GET /users/by-dni/{dni}/profile`, `/memberships`, `/attendances`. El patrón ya existe, solo hay que extenderlo.

2. **Mediano plazo:** Configurar el push de check-ins desde Crystal hacia QuantumFit (`POST /api/external/checkin`). Así las asistencias llegan en tiempo real aunque no haya endpoint de pull por DNI.

3. **Largo plazo:** Si Nico no construye los endpoints, evaluar:
   - Exportar datos de Crystal a un archivo CSV/JSON periódico e importarlos
   - Pedir a los usuarios que escaneen su QR de MiFit al registrarse para vincular cuentas
   - Implementar un mini-flujo OAuth donde el usuario autorice a QuantumFit a leer sus datos de Crystal
