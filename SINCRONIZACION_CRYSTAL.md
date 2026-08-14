# Sincronización con Crystal/MiFit

## Problema

Nico (Crystal) no quiere crear un endpoint público que reciba un DNI y devuelva los datos del cliente. Necesitamos que cuando un socio se registre en la app, pueda ver sus datos históricos (perfil, membresías, asistencias) sin depender de un endpoint de Crystal.

## Solución: 3 estrategias combinadas

---

## Opción 1 — Carga automática post-registro (App)

**Archivo:** `quantum-fit-app/src/context/AuthContext.tsx`

### Cambios:

**`loadExternalData(dniOverride?)`** (línea 192)
- Ahora acepta un `dniOverride` opcional para pasar el DNI directamente sin depender del estado `user` (que aún no se actualizó post-registro).
- `const dni = dniOverride || user?.dni || undefined;`

**`register()`** (línea 252)
- Después de un registro exitoso, ahora llama automáticamente:
  - `loadExternalData(dni)` — trae perfil, membresías y asistencias desde Crystal (con fallback a datos locales)
  - `loadSubscription()` — carga la suscripción del usuario

### Flujo:
```
Usuario se registra (con DNI)
  → POST /api/auth/register (backend crea usuario + cachea Crystal)
  → loadExternalData(dni)
    → GET /api/external-pull/profile?dni=XXX  (perfil)
    → GET /api/external-pull/memberships?dni=XXX  (membresías)
    → GET /api/external-pull/attendances?dni=XXX  (asistencias)
  → loadSubscription()
    → GET /api/payments/subscription
```

---

## Opción 2 — Cache en backend al registrar

**Archivo:** `quantum-fit-backend/src/services/auth.service.ts` (línea 150-161)

Cuando un usuario se registra con DNI, el backend hace un **fire-and-forget** (no bloqueante) para cachear los datos de Crystal en el campo `crystalData` (JSON) del modelo User:

```typescript
if (data.dni) {
  const { pullUserProfile, pullUserMemberships } = await import('./external-pull.service');
  Promise.all([
    pullUserProfile(data.dni).catch(() => null),
    pullUserMemberships(data.dni).catch(() => null),
  ]).catch(() => {});
}
```

Estas funciones (`pullUserProfile`, `pullUserMemberships`) ya tienen lógica de **fallback**:
1. Intentan `GET /users/by-dni/{dni}/...` en Crystal
2. Si Crystal no responde, devuelven datos locales (desde `User`, `Subscription`, `CheckIn`)
3. Guardan el resultado en `User.crystalData` para no tener que consultar de nuevo

---

## Opción 3 — Sincronización programada (cron job)

### Servicio compartido

**Archivo:** `quantum-fit-backend/src/services/external-sync-scheduler.service.ts`

Exporta `syncAllUsers()` que:
1. Busca todos los usuarios activos con DNI
2. Para cada uno: sincroniza perfil, membresías y asistencias (últimos 30 días)
3. Logea resultados individuales
4. Devuelve un resumen con `{ total, processed, errors, skipped, details[] }`

### Script CLI

**Archivo:** `quantum-fit-backend/scripts/sync-all.ts`

```bash
# Ejecutar manualmente
npm run sync:all

# Programar en cron (todas las noches a las 3 AM)
0 3 * * * cd /ruta/quantum-fit-backend && npx tsx scripts/sync-all.ts >> /var/log/quantum-sync.log 2>&1
```

### Endpoint Admin

**Archivo:** `quantum-fit-backend/src/routes/admin/integration.routes.ts` (línea 50)

```
POST /api/admin/integration/sync/all
Headers: Authorization: Bearer <admin-jwt>
```

Dispara la sincronización masiva desde el panel de administración. Requiere autenticación y rol staff/admin.

### Scripts npm agregados

En `quantum-fit-backend/package.json`:

| Script | Comando | Uso |
|--------|---------|-----|
| `sync:all` | `tsx scripts/sync-all.ts` | Sincroniza todos los usuarios |
| `sync:dni` | `tsx scripts/set-dni-demo.ts` | Script legacy para asignar DNI demo |

---

## Resumen de archivos modificados/creados

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `quantum-fit-app/src/context/AuthContext.tsx` | Modificado | `loadExternalData` acepta `dniOverride`; se llama post-registro |
| `quantum-fit-backend/src/services/auth.service.ts` | Modificado | Cache no bloqueante de Crystal al registrar |
| `quantum-fit-backend/src/services/external-sync-scheduler.service.ts` | **Nuevo** | Servicio `syncAllUsers()` |
| `quantum-fit-backend/scripts/sync-all.ts` | **Nuevo** | Script para cron job |
| `quantum-fit-backend/src/routes/admin/integration.routes.ts` | Modificado | Endpoint `POST /sync/all` |
| `quantum-fit-backend/package.json` | Modificado | Scripts `sync:all` y `sync:dni` |

---

## Diagrama de flujo completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        REGISTRO                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  App: RegisterScreen                                             │
│    → AuthContext.register(name, email, password, dni)            │
│      → POST /api/auth/register (backend)                        │
│        → auth.service.ts:                                        │
│          1. Crea usuario en DB                                   │
│          2. Cachea Crystal (fire-and-forget) ◄── Opción 2       │
│             ├─ pullUserProfile(dni)  → crystalData.profile      │
│             └─ pullUserMemberships(dni) → crystalData.memberships│
│      ← returns user + tokens                                     │
│      → loadExternalData(dni) ◄── Opción 1                        │
│        ├─ GET /api/external-pull/profile?dni=XXX                 │
│        ├─ GET /api/external-pull/memberships?dni=XXX             │
│        └─ GET /api/external-pull/attendances?dni=XXX             │
│      → loadSubscription()                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SINCRONIZACIÓN PROGRAMADA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cron job (3 AM) / Admin POST /api/admin/integration/sync/all    │
│    → syncAllUsers() ◄── Opción 3                                 │
│      ├─ Itera todos los usuarios con DNI                         │
│      ├─ pullUserProfile(dni) → cachea crystalData.profile       │
│      ├─ pullUserMemberships(dni) → cachea crystalData.memberships│
│      └─ syncAttendancesFromExternal(user) → crea CheckIns locales│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
