# Pendiente para la próxima sesión

## Estado del código
- Backend: `npx tsc --noEmit` → 0 errors ✅
- App: `npx tsc --noEmit` → 0 errors ✅
- Backend deployado en Railway ✅ → https://quantum-fit-backend-production.up.railway.app
- Dockerfile: single stage (simplificado) ✅

## Próximos pasos (por orden)

### 1. SMTP (Email — Olvidé contraseña)
- Activar Verificación en dos pasos en Gmail (cuenta genérica o `nodoetico@gmail.com`)
- Generar contraseña de aplicación en https://myaccount.google.com/apppasswords
- Setear en Railway: `railway vars set SMTP_PASS="contraseña-generada"`
- Redeploy: `railway up`

### 2. Build de la App Móvil (EAS)
- Instalar EAS CLI: `npm install -g eas-cli`
- Login con cuenta Expo: `eas login`
- Configurar: `eas build:configure`
- Build Android: `eas build --platform android`
- Build iOS: `eas build --platform ios`

### 3. Migrar cuentas a propietaria
- Crear Gmail genérico: `quantumfit.gimnasio@gmail.com`
- Transferir GitHub → invitar como collaborator Admin
- Transferir Railway → Share project con ese email
- Migrar SMTP al Gmail de ella
- Migrar MercadoPago a cuenta de ella (PROD)

### 4. MercadoPago — Producción
- Crear cuenta MP de la propietaria
- Obtener Access Token de producción
- Reemplazar `MERCADOPAGO_ACCESS_TOKEN` en Railway
- Configurar Notification URL con dominio real de Railway

### 5. Admin Panel (posterior)
- Crear Dockerfile para `quantum-fit-admin/`
- Deployar en Railway o Vercel
- Varias correcciones pendientes en la UI

## URLs útiles
- API: https://quantum-fit-backend-production.up.railway.app
- Health: https://quantum-fit-backend-production.up.railway.app/health
- Railway: https://railway.app/project/4eff5ceb-1f3f-4ceb-b880-1f697686174b
- GitHub: https://github.com/nodoetico/quantum-fit
- Documento entrega: `ENTREGA_A_PROPIETARIA.md`
