# Pendiente para la próxima sesión

## Estado del código
- Backend: `npx tsc --noEmit` → 0 errors ✅
- App: `npx tsc --noEmit` → 0 errors ✅
- Todo listo para producción

## Bloqueante: Token de Railway (para deploy)
- Ir a https://railway.app
- Login con GitHub (`nodoetico`)
- Avatar → Profile Settings → Tokens → Generate New Token
- Pegarlo en la terminal: `railway login --token <token>`

## Después del deploy
1. Railway: `railway init` → `add postgres` → `vars set` → `up`
2. SMTP: Activar 2FA en Gmail → generar contraseña de aplicación → setear `SMTP_PASS`
3. App: Setear `EXPO_PUBLIC_API_URL` con URL de Railway → `npx eas build --platform all`

→ Pasos detallados en `SESSION_CONTEXT.md` (sección "Deploy a Railway")
