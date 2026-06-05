# Crystal API — Autenticación y Flujo de Integración

## ⚠️ ERROR CORREGIDO: X-Api-Token en el Login

### Síntoma
`POST https://crystal.getmifit.app/api/login` respondía con **HTML 404** (página Inertia).

### Causa Raíz
Se enviaba `X-Api-Token` como header en el request de login:

```
POST /api/login
X-Api-Token: rlEoY...   ← ESTO ROMPE EL LOGIN
Content-Type: application/json

{"email":"...","password":"..."}
```

El endpoint `/api/login` es **público** (`security=[]` en OpenAPI). Enviarle headers de autenticación confunde a Laravel/Inertia y responde con un redirect a la web app (404).

### Fix Aplicado
Se eliminó `X-Api-Token` del POST a `/api/login` en:
- `backend/src/services/payment.service.ts:getBearerToken()`
- `backend/src/services/external-pull.service.ts:getBearerToken()`

## ✅ Flujo Correcto

### 1. Login (PÚBLICO — sin headers de auth)

```
POST https://crystal.getmifit.app/api/login
Content-Type: application/json
Accept: application/json

{"email":"nodoetico@gmail.com","password":"AdN1yTq7RAfIXzZl"}
```

→ `200 {"token":"4358|...", "user":{...}}`

### 2. APIs Protegidas (solo Bearer)

```
GET https://crystal.getmifit.app/api/payment-methods
Authorization: Bearer 4358|...
Accept: application/json
```

**NO** incluir `X-Api-Token`. Enviar ambos headers (Bearer + X-Api-Token) causa error 404.

### 3. Endpoints Verificados

| Endpoint | Auth | Status |
|---|---|---|
| `POST /api/login` | Ninguna | ✅ 200 |
| `GET /api/payment-methods` | Bearer | ✅ 200 |
| `GET /api/user/enrollment` | Bearer | ✅ 200 |
| `GET /api/user/me` | Bearer | ✅ 200 |
| `GET /api/user/memberships` | Bearer | ✅ 200 |
| `GET /api/user/transactions` | Bearer | ✅ 200 |

## 🔐 Headers Correctos (Resumen)

| Contexto | Headers |
|---|---|
| Login | `Content-Type`, `Accept` |
| APIs Crystal | `Authorization: Bearer <token>`, `Content-Type`, `Accept` |
| `X-Api-Token` | **NO USAR** — causa 404 cuando se combina con Bearer |

## 📁 Archivos Modificados

- `backend/src/services/payment.service.ts` — `getBearerToken()` y `getApiClient()` sin X-Api-Token
- `backend/src/services/external-pull.service.ts` — `getBearerToken()` y `getApiClient()` sin X-Api-Token
- `backend/src/controllers/payment.controller.ts` — se eliminó extracción de `x-api-token` header
- `backend/.env` — contiene las credenciales de Crystal
