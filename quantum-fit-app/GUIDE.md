# 📖 Guía de Uso - QUANTUM FIT

## 🚀 Inicio Rápido

### Ejecutar la Aplicación

1. **Iniciar el servidor de desarrollo:**
```bash
cd quantum-fit-app
npm start
```

2. **Seleccionar plataforma:**
   - Presiona `i` para iOS Simulator
   - Presiona `a` para Android Emulator
   - Escanea el QR con Expo Go en tu dispositivo físico

---

## 📱 Navegación

La aplicación cuenta con una barra de navegación inferior con 4 pestañas:

### 🏠 Inicio (Dashboard)
- **Resumen de actividad**: Puntos, nivel, rachas
- **Próximo turno**: Visualiza tu próxima clase reservada
- **Accesos rápidos**: Botones directos a las secciones principales
- **Logros recientes**: Tus últimos achievements desbloqueados

### 📅 Turnos
- **Calendario semanal**: Strip de 7 días para seleccionar fecha
- **Filtros**: Por tipo de actividad y nivel de dificultad
- **Disponibilidad**: Barra de ocupación en tiempo real
- **Reservar**: Modal de confirmación con detalles de la clase

### 🎁 Premios (Beneficios)
- **Saldo de puntos**: Tus puntos disponibles
- **Categorías**: Productos, Bebidas, Descuentos, Promociones
- **Canjear**: Modal de confirmación de canje
- **Historial**: Premios canjeados anteriormente

### 👤 Perfil
- **Estadísticas**: Grid con todas tus métricas
- **Logros**: Achievements desbloqueados y pendientes
- **Actividad**: Historial detallado con puntos ganados

---

## 🔐 Cuentas de Demostración

La aplicación incluye datos mock para demostración:

**Usuario por defecto:**
- Email: `alex@quantumfit.com`
- Contraseña: cualquier contraseña funciona
- Nivel: 5 (Avanzado)
- Puntos: 2450
- Rachas: 12 días

---

## 🎮 Sistema de Puntos

### Cómo Ganar Puntos

| Actividad | Puntos |
|-----------|--------|
| Asistencia a clase | +75 |
| Entrenamiento completado | +50 |
| Racha de 7 días | +100 |
| Logro desbloqueado | +50-500 |
| Primer visita | +100 |

### Niveles

| Nivel | Nombre | Puntos Requeridos |
|-------|--------|-------------------|
| 1-2 | 🌱 Principiante | 0-1000 |
| 3-4 | 💪 Intermedio | 2000-4000 |
| 5-6 | 🔥 Avanzado | 4000-6000 |
| 7-8 | ⭐ Experto | 6000-8000 |
| 9-10 | 💎 Élite | 8000-10000 |
| 11+ | 👑 Leyenda | 10000+ |

---

## 🏆 Logros (Achievements)

### Sistema de Achievements

La aplicación incluye un sistema de logros gamificado:

**Logros incluidos:**
1. 🎯 **Primera Visita** - Completa tu primera sesión
2. 🔥 **Constante** - Mantén 7 días de racha
3. 💪 **Guerrero** - Completa 25 entrenamientos
4. ⭐ **Estrella** - Alcanza el Top 10 del ranking
5. 👑 **Legendario** - Alcanza el nivel 10
6. 👥 **Social** - Invita a 5 amigos

---

## 🎨 Diseño y Tema

### Paleta de Colores

- **Azul Eléctrico** `#00F0FF` - Acciones principales, primary
- **Verde Neón** `#39FF14` - Éxitos, confirmaciones
- **Dorado** `#FFD700` - Puntos, recompensas
- **Negro** `#0A0A0A` - Fondos principales
- **Gris Oscuro** `#1A1A1A` - Tarjetas y elementos

### Principios de Diseño

1. **Dark Mode First**: Diseñado para modo oscuro por defecto
2. **Neon Accents**: Colores vibrantes para elementos importantes
3. **Minimalismo**: Interfaz limpia sin elementos innecesarios
4. **Microinteracciones**: Animaciones suaves en todas las acciones

---

## ⚙️ Configuración

### Archivos Principales

```
src/
├── constants/
│   └── theme.ts          # Colores, tipografía, espaciado
├── context/
│   └── AuthContext.tsx   # Estado global y autenticación
├── types/
│   └── index.ts          # Tipos de TypeScript
└── utils/
    └── helpers.ts        # Funciones utilitarias
```

### Personalización

**Cambiar colores:**
```typescript
// src/constants/theme.ts
export const colors = {
  primary: '#00F0FF',  // Cambiar color principal
  secondary: '#39FF14', // Cambiar color secundario
  // ...
};
```

**Agregar nuevas pantallas:**
1. Crear archivo en `src/screens/nueva-pantalla/`
2. Agregar ruta en `src/navigation/AppNavigator.tsx`

---

## 🐛 Solución de Problemas

### La aplicación no inicia

```bash
# Limpiar caché
npm start -- --clear

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Errores de TypeScript

```bash
# Verificar tipos
npx tsc --noEmit

# Si hay errores, ejecutar:
npm run fix-types
```

### Problemas con Expo

```bash
# Actualizar Expo CLI
npm install -g expo-cli

# Verificar versión
expo --version
```

---

## 📝 Características Implementadas

### ✅ Completadas

- [x] Autenticación (Login, Registro, Recuperación)
- [x] Dashboard con resumen de actividad
- [x] Gestión de turnos con calendario
- [x] Sistema de puntos y niveles
- [x] Tienda de recompensas
- [x] Perfil con estadísticas
- [x] Sistema de logros
- [x] Navegación por tabs
- [x] Diseño responsive
- [x] Modo oscuro

### 🔄 Próximas Características

- [ ] Ranking global entre usuarios
- [ ] Notificaciones push
- [ ] Integración con Apple Health / Google Fit
- [ ] Chat con entrenadores
- [ ] Seguimiento de rutinas personalizadas
- [ ] Pagos in-app
- [ ] Modo claro/oscuro toggle
- [ ] Backend real con API

---

## 📞 Soporte

Para reportar bugs o solicitar características:
- Email: soporte@quantumfit.com
- GitHub Issues: github.com/quantumfit/app/issues

---

<div align="center">

**QUANTUM FIT** - *Tu mejor versión comienza aquí*

</div>
