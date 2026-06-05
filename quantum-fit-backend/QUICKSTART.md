# 🚀 Guía de Inicio Rápido - QUANTUM FIT Backend

## Paso 1: Instalar PostgreSQL

### Windows
1. Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Instalar con configuración por defecto
3. Recordar la contraseña del usuario `postgres`

### O usar Docker (recomendado)
```bash
docker run --name quantumfit-db \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=quantumfit \
  -p 5432:5432 \
  -d postgres:15
```

---

## Paso 2: Instalar Node.js

Descargar desde [nodejs.org](https://nodejs.org) (versión LTS 18+)

Verificar instalación:
```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
```

---

## Paso 3: Configurar el Proyecto

```bash
# Navegar al directorio del backend
cd quantum-fit-backend

# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env
```

---

## Paso 4: Configurar Base de Datos

### Opción A: PostgreSQL Local

Editar `.env` y actualizar `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:tu-contraseña@localhost:5432/quantumfit?schema=public"
```

Crear base de datos:
```bash
# Usando psql
psql -U postgres
CREATE DATABASE quantumfit;
\q
```

### Opción B: Docker

Si usaste Docker en el Paso 1, el `.env` ya está configurado correctamente:
```env
DATABASE_URL="postgresql://quantumfit:password123@localhost:5432/quantumfit?schema=public"
```

---

## Paso 5: Ejecutar Migraciones

```bash
# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones (crea las tablas)
npm run prisma:migrate

# (Opcional) Insertar datos de ejemplo
npm run prisma:seed
```

---

## Paso 6: Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev
```

Verás algo como:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏋️  QUANTUM FIT API - Servidor Iniciado                ║
║                                                           ║
║   🌐 Puerto: 3000                                         ║
║   📊 Environment: development                             ║
║   🔗 Health: http://localhost:3000/health                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Paso 7: Probar la API

### Health Check
```bash
curl http://localhost:3000/health
```

### Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Juan Pérez\",
    \"email\": \"juan@example.com\",
    \"password\": \"Password123!\"
  }"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"juan@example.com\",
    \"password\": \"Password123!\"
  }"
```

### Usar Usuario Demo (si ejecutaste el seed)
```
Email: demo@quantumfit.com
Password: Demo123!
```

---

## Paso 8: Conectar la App Móvil

Editar `quantum-fit-app/.env` (si existe) o actualizar la URL de la API en el código:

```typescript
// En tu app móvil
const API_URL = 'http://192.168.1.XX:3000/api';
// Reemplaza XX con la IP de tu computadora
```

Para encontrar tu IP:
```bash
# Windows
ipconfig

# Busca "IPv4" en la sección de Wi-Fi
```

---

## 📚 Comandos Útiles

```bash
# Ver base de datos (Prisma Studio)
npm run prisma:studio

# Resetear base de datos (CUIDADO: borra todo)
npm run prisma:reset

# Build para producción
npm run build

# Iniciar en producción
npm start
```

---

## ❌ Solución de Problemas

### Error: "connect ECONNREFUSED"
- PostgreSQL no está corriendo
- Iniciar Docker o el servicio de PostgreSQL

### Error: "database does not exist"
- Crear la base de datos: `createdb -U postgres quantumfit`

### Error: "Cannot find module '@prisma/client'"
- Ejecutar: `npm run prisma:generate`

### Error: "Already registered a check-in today"
- El usuario ya tiene un check-in hoy
- Es el comportamiento esperado (anti-fraude)

---

## 📞 Soporte

Si tienes problemas:
1. Verificar que PostgreSQL esté corriendo
2. Verificar que el `.env` tenga la URL correcta
3. Revisar los logs de error en la terminal

---

<div align="center">

**QUANTUM FIT** - *Tu mejor versión comienza aquí*

</div>
