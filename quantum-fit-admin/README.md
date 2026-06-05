# QUANTUM FIT - Panel de Administración

Panel de administración web para la gestión del gimnasio QUANTUM FIT.

## 🚀 Características

- ✅ **Gestión de Reservas**: Ver, crear, editar y cancelar reservas de clases
- ✅ **Gestión de Clases**: Crear y administrar clases/cursos
- ✅ **Gestión de Usuarios**: Ver usuarios, cambiar roles, eliminar usuarios
- ✅ **Sistema de Roles**: ADMIN, MANAGER, STAFF, VIP, USER
- ✅ **Dashboard**: Resumen estadístico del gimnasio
- ✅ **Diseño Responsivo**: Funciona en desktop y móvil

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Backend de QUANTUM FIT ejecutándose en `http://localhost:3000`

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔐 Credenciales de Acceso

Después de ejecutar el script de seed en el backend:

- **Email**: `admin@quantumfit.com`
- **Contraseña**: `Admin123!`

### Crear usuario administrador

Si aún no tienes un usuario admin, ejecuta en el backend:

```bash
cd ../quantum-fit-backend
npx tsx prisma/seed-admin.ts
```

## 📁 Estructura del Proyecto

```
quantum-fit-admin/
├── src/
│   ├── config/          # Configuración de API
│   ├── context/         # Contextos de React (Auth)
│   ├── pages/           # Páginas de la aplicación
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── Reservas.tsx
│   │   ├── Clases.tsx
│   │   ├── Usuarios.tsx
│   │   ├── Premios.tsx
│   │   └── NotFound.tsx
│   ├── services/        # Servicios de API
│   ├── types/           # Tipos de TypeScript
│   ├── App.tsx          # Componente principal con rutas
│   └── main.tsx         # Punto de entrada
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables de entorno
├── package.json
├── tailwind.config.js   # Configuración de TailwindCSS
└── vite.config.ts       # Configuración de Vite
```

## 🎨 Tecnologías Utilizadas

- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **TailwindCSS** - Estilos

## 🔌 Endpoints de la API

Esta aplicación consume los siguientes endpoints del backend:

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil
- `GET /api/auth/users` - Listar usuarios (Admin)
- `PUT /api/auth/users/:id/role` - Cambiar rol (Admin)
- `DELETE /api/auth/users/:id` - Eliminar usuario (Admin)

### Reservas
- `GET /api/admin/bookings` - Listar reservas
- `GET /api/admin/bookings/:id` - Obtener reserva
- `POST /api/admin/bookings` - Crear reserva
- `PUT /api/admin/bookings/:id` - Actualizar reserva
- `DELETE /api/admin/bookings/:id` - Eliminar reserva
- `GET /api/admin/bookings/stats/resumen` - Estadísticas

### Clases
- `GET /api/admin/classes` - Listar clases
- `GET /api/admin/classes/:id` - Obtener clase
- `POST /api/admin/classes` - Crear clase
- `PUT /api/admin/classes/:id` - Actualizar clase
- `DELETE /api/admin/classes/:id` - Eliminar clase
- `GET /api/admin/classes/stats/resumen` - Estadísticas

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run preview

# Linting
npm run lint
```

## 🔒 Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Dueño/encargado principal | Acceso total |
| **MANAGER** | Gerente | Gestión completa |
| **STAFF** | Personal (recepción, trainers) | Gestión de reservas y clases |
| **VIP** | Usuario con suscripción premium | Beneficios adicionales |
| **USER** | Usuario normal | Acceso básico |

## 🐛 Solución de Problemas

### Error de CORS
Asegúrate de que el backend tenga configurado `ALLOWED_ORIGINS` en el `.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Error de autenticación
Verifica que el token se está guardando en `localStorage`.

### Error de conexión
Asegúrate de que el backend esté corriendo en el puerto correcto.

## 📱 Próximas Características

- [ ] Gestión completa de premios y canjes
- [ ] Reportes y estadísticas avanzadas
- [ ] Notificaciones en tiempo real
- [ ] Exportar datos a Excel/CSV
- [ ] Modo oscuro/claro

## 🤝 Contribución

Para contribuir, por favor abre un issue primero para discutir los cambios propuestos.

## 📄 Licencia

MIT - Ver archivo LICENSE para más detalles.

---

**QUANTUM FIT** - Sistema de gestión de gimnasio con gamificación
