# 📋 ENTREGA DEL SISTEMA QUANTUM FIT A LA PROPIETARIA

> Documento creado: Junio 2026

---

## 1. RECOMENDACIÓN: CREAR CUENTA GENÉRICA

Antes de entregar, crear un **Gmail nuevo** tipo `quantumfit.gimnasio@gmail.com` y vincular **TODO** ahí. Así la propietaria tiene un solo usuario y contraseña para acceder a todo.

---

## 2. INVENTARIO DE RECURSOS

### 2.1 GitHub — Código fuente
| Item | Detalle |
|---|---|
| URL | https://github.com/nodoetico/quantum-fit |
| Dueño actual | `nodoetico` (tu cuenta) |
| Acceso propietaria | ✅ Invitarla como Admin desde Settings → Collaborators |
| Rama principal | `master` |
| Contenido | Backend + App Móvil + Admin Panel + Landing Page |

### 2.2 Railway — Servidor (Backend + Base de Datos)
| Item | Detalle |
|---|---|
| URL | https://railway.app |
| Proyecto | `quantum-fit` |
| Servicios | `quantum-fit-backend` (Online) + `Postgres` (Online) |
| Dominio API | https://quantum-fit-backend-production.up.railway.app |
| Salud API | `GET /health` → `{"success":true}` |
| Acceso propietaria | Ir a proyecto → Settings → Share → Invitar email como Admin |
| Plan actual | Free (limitado, considerar upgrade a $5/mes) |

**Variables de entorno configuradas:**
```
JWT_SECRET, REFRESH_TOKEN_SECRET, RESET_TOKEN_SECRET
ALLOWED_ORIGINS
INTEGRATION_API_KEY
EXTERNAL_API_URL, EXTERNAL_USER_EMAIL, EXTERNAL_USER_PASSWORD
MERCADOPAGO_ACCESS_TOKEN (SANDBOX), MERCADOPAGO_NOTIFICATION_URL
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
NODE_ENV=production, PORT=3000
```

### 2.3 MercadoPago — Pagos
| Item | Detalle |
|---|---|
| Estado actual | 🔴 **Sandbox** (solo pruebas) |
| Cuenta actual | Vinculada a tu cuenta de MP |
| Token actual | `TEST-8770022280503036-...` (SANDBOX) |
| Crédentiales de prueba | Mastercard 5031 7557 3453 0604 - CVC 123 |
| **PASO OBLIGATORIO** | Crear cuenta de MP de la propietaria → Obtener **Access Token PROD** → Actualizar en Railway |

### 2.4 Expo — Build de la App Móvil
| Item | Detalle |
|---|---|
| Estado actual | 🔴 Sin configurar |
| Cuenta necesaria | https://expo.dev (crear cuenta para la propietaria) |
| Package Android | `com.quantumfit.app` |
| Bundle iOS | `com.quantumfit.app` |
| Scheme | `quantumfit://` |

### 2.5 SMTP (Email — Olvidé Contraseña)
| Item | Detalle |
|---|---|
| Estado actual | ⚠️ Código listo, SMTP configurado con cuenta `nodoetico@gmail.com` |
| **PASO OBLIGATORIO** | Migrar a la cuenta genérica `quantumfit.gimnasio@gmail.com` |
| Configurar | Activar 2FA → Generar contraseña de aplicación → Setear `SMTP_PASS` en Railway |

### 2.6 Crystal — API del Sistema del Gimnasio
| Item | Detalle |
|---|---|
| URL | https://crystal.getmifit.app |
| Usuario actual | `nicolas@crystal-desarrollo.com` |
| **PASO OBLIGATORIO** | Pedirle al otro programador que cree un usuario de integración para la propietaria |

### 2.7 Dominio (opcional)
| Item | Detalle |
|---|---|
| Sugerencia | Comprar `quantumfit.com` o `quantumfitgym.com` |
| DNS | Apuntar a Railway → Settings → Custom Domain |

---

## 3. CREDENCIALES DE PRUEBA

| Usuario | Email | Password | Rol |
|---|---|---|---|
| Admin | `admin@quantumfit.com` | `Admin123!` | ADMIN |
| Demo | `demo@quantumfit.com` | `Demo123!` | USER |

---

## 4. ESTRUCTURA DEL SISTEMA

```
QUANTUM FIT
│
├── App Móvil (React Native / Expo)
│   └── Usuarios del gimnasio: check-in, puntos, niveles, ranking, premios
│
├── Backend API (Node.js + Express + Prisma + PostgreSQL) ☁️ Railway
│   └── https://quantum-fit-backend-production.up.railway.app
│
├── Admin Panel (React + Vite) ⏳ Pendiente de deploy
│   └── Propietaria y staff: gestionar usuarios, clases, reservas
│
├── Landing Page (Astro)
│   └── Página web del gimnasio
│
└── Integración Crystal
    └── Sincronización con software de check-in del gimnasio
```

---

## 5. FLUJO COMPLETO PARA LA PROPIETARIA

### DÍA 1 — Configuración inicial
1. Crear Gmail genérico: `quantumfit.gimnasio@gmail.com`
2. Crear cuenta en Railway con ese Gmail
3. Crear cuenta en GitHub con ese Gmail
4. Crear cuenta en MercadoPago a nombre del gimnasio
5. Crear cuenta en expo.dev con ese Gmail

### DÍA 2 — Migración
1. Transferir repositorio de GitHub a la nueva cuenta
2. Transferir proyecto de Railway (o recrear con nuevas credenciales)
3. Configurar MercadoPago PROD (Access Token de producción)
4. Configurar SMTP (contraseña de aplicación del Gmail genérico)
5. Pedir credenciales de Crystal al otro programador

### DÍA 3 — Puesta en marcha
1. Buildear la app con EAS (Android + iOS)
2. Si hay dominio: configurar DNS y SSL en Railway
3. Subir Admin Panel a Railway o Vercel
4. Probar flujo completo: registro → login → check-in → puntos → canje

---

## 6. COSTOS MENSUALES ESTIMADOS

| Servicio | Plan | Costo |
|---|---|---|
| Railway (backend + DB) | Starter ($5) o Pro ($20) | ~$5-20/mes |
| Expo (EAS Build) | Free (limitado) o $8/mes | $0-8/mes |
| MercadoPago | Comisión por transacción | ~3-5% por pago |
| Dominio (opcional) | .com .com.ar etc | ~$10-15/año |
| **Total estimado** | | **~$10-30/mes** |

---

## 7. CHECKLIST DE ENTREGA

- [ ] Repositorio GitHub transferido a propietaria
- [ ] Railway transferido (o recreado con cuenta de propietaria)
- [ ] MercadoPago en PRODUCCIÓN (token de verdad, no sandbox)
- [ ] SMTP funcionando (olvidé contraseña envía emails)
- [ ] Credenciales de Crystal actualizadas
- [ ] App buildeda y publicada (Play Store / App Store)
- [ ] Admin Panel deployado y accesible
- [ ] Dominio configurado (si aplica)
- [ ] Testing end-to-end con usuarios reales

---

## 8. COMANDOS ÚTILES PARA LA PROPIETARIA

```bash
# Deploy del backend (si necesita redeploy)
cd quantum-fit-backend
railway up

# Build de la app
cd quantum-fit-app
npx eas build --platform android
npx eas build --platform ios

# Ver logs del backend
railway logs --service quantum-fit-backend

# Ver base de datos
railway connect Postgres

# Actualizar variables de entorno
railway vars set CLAVE=valor
```

---

## 9. CONTACTOS

| Rol | Nombre | Contacto |
|---|---|---|
| Desarrollador QuantumFit | [Tu nombre] | [Tu email/teléfono] |
| Programador Crystal | [Nombre del otro dev] | [Su contacto] |
| Soporte Railway | | https://help.railway.app |
| Soporte Expo | | https://expo.dev/support |

---

> *Este documento debe actualizarse a medida que se completen los pasos de migración.*
