# QUANTUM FIT 🏋️‍♂️

<div align="center">

![Quantum Fit Banner](./assets/icon.png)

**La aplicación móvil definitiva para la gestión de tu gimnasio**

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.io)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## 📱 Descripción

**QUANTUM FIT** es una aplicación móvil moderna y elegante diseñada para la gestión de turnos de un gimnasio contemporáneo. Con una estética minimalista y altamente visual, QUANTUM FIT combina funcionalidad con una experiencia de usuario motivadora mediante gamificación y recompensas.

### ✨ Características Principales

- 🎨 **Diseño Moderno**: Interfaz oscura minimalista con acentos en azul eléctrico y verde neón
- 🔐 **Autenticación Completa**: Login, registro y recuperación de contraseña
- 📅 **Gestión de Turnos**: Calendario visual para reservar clases y espacios
- 🏆 **Sistema de Puntos**: Gamificación con puntos por asistencia y logros
- 🎁 **Tienda de Recompensas**: Canjea puntos por productos, bebidas y descuentos
- 📊 **Estadísticas Detalladas**: Seguimiento de progreso y rendimiento
- 🎯 **Logros y Badges**: Sistema de achievements desbloqueables
- 📈 **Dashboard Personal**: Resumen completo de tu actividad

---

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ ([Descargar](https://nodejs.org))
- npm o yarn
- Expo CLI
- iOS Simulator (macOS) o Android Emulator

### Pasos de Instalación

1. **Clonar o navegar al directorio del proyecto:**
```bash
cd quantum-fit-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm start
```

4. **Ejecutar en tu dispositivo:**
   - **iOS Simulator:** Presiona `i` en la terminal
   - **Android Emulator:** Presiona `a` en la terminal
   - **Dispositivo físico:** Escanea el QR code con Expo Go

---

## 📁 Estructura del Proyecto

```
quantum-fit-app/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── constants/           # Constantes y tema
│   │   └── theme.ts        # Colores, tipografía, espaciado
│   ├── context/            # Contextos de React
│   │   └── AuthContext.tsx # Autenticación y estado global
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Navegación
│   │   └── AppNavigator.tsx
│   ├── screens/            # Pantallas principales
│   │   ├── auth/           # Login, Registro, Recuperación
│   │   ├── dashboard/      # Pantalla principal
│   │   ├── turnos/         # Gestión de turnos
│   │   ├── beneficios/     # Tienda de recompensas
│   │   └── perfil/         # Perfil de usuario
│   ├── types/              # Tipos de TypeScript
│   │   └── index.ts
│   └── utils/              # Utilidades
├── assets/                 # Imágenes y recursos
├── App.tsx                # Punto de entrada
├── app.json               # Configuración de Expo
└── package.json
```

---

## 🎨 Diseño y Tema

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary** | `#00F0FF` | Azul eléctrico neón - Acciones principales |
| **Secondary** | `#39FF14` | Verde neón - Éxitos y logros |
| **Background** | `#0A0A0A` | Negro profundo - Fondos |
| **Card** | `#1A1A1A` | Gris oscuro - Tarjetas |
| **Points** | `#FFD700` | Dorado - Sistema de puntos |

### Tipografía

- **Familia**: System (San Francisco en iOS, Roboto en Android)
- **Estilo**: Sans-serif moderna y limpia

---

## 🔐 Funcionalidades

### 1. Autenticación

- **Login**: Acceso con email y contraseña
- **Registro**: Creación de nueva cuenta
- **Recuperación**: Reset de contraseña vía email
- **Social Login**: Google y Apple (UI implementada)

### 2. Gestión de Turnos

- **Calendario Visual**: Strip de 7 días con selección intuitiva
- **Filtros**: Por actividad y dificultad
- **Disponibilidad en Tiempo Real**: Barra de ocupación
- **Reserva Rápida**: Modal de confirmación
- **Mis Reservas**: Historial de turnos reservados

### 3. Sistema de Puntos (Gamificación)

**Formas de ganar puntos:**
- ✅ Asistencia a clases: +75 pts
- ✅ Entrenamientos completados: +50 pts
- ✅ Rachas diarias: +100 pts bonus
- ✅ Logros desbloqueados: +50 a +500 pts

**Niveles:**
1. 🌱 Principiante (Nivel 1-2)
2. 💪 Intermedio (Nivel 3-4)
3. 🔥 Avanzado (Nivel 5-6)
4. ⭐ Experto (Nivel 7-8)
5. 💎 Élite (Nivel 9-10)
6. 👑 Leyenda (Nivel 11+)

### 4. Tienda de Recompensas

**Categorías:**
- 🛍️ **Productos**: Merchandising, accesorios
- 🥤 **Bebidas**: Smoothies, proteínas, barras
- 🏷️ **Descuentos**: En membresías y servicios
- 🎁 **Promociones**: Sesiones con entrenadores, guest passes

### 5. Perfil y Estadísticas

- **Estadísticas Personales**: Entrenamientos, racha, ranking
- **Gráfico Semanal**: Actividad por día
- **Logros**: Sistema de achievements
- **Historial**: Actividad reciente con puntos

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Native | 0.73+ | Framework móvil |
| Expo | 50+ | Desarrollo y build |
| TypeScript | 5+ | Tipado estático |
| React Navigation | 6+ | Navegación |
| Expo Linear Gradient | 12+ | Gradientes |
| Expo Vector Icons | 14+ | Iconos |

---

## 📱 Capturas de Pantalla

La aplicación incluye las siguientes pantallas:

1. **Login**: Autenticación con diseño moderno
2. **Dashboard**: Resumen de actividad y progreso
3. **Turnos**: Calendario y reserva de clases
4. **Beneficios**: Tienda de recompensas
5. **Perfil**: Estadísticas y logros

---

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en Web
npm run web

# Build de producción
npm run build
```

---

## 🚀 Próximas Características

- [ ] **Ranking Global**: Competencia entre usuarios
- [ ] **Notificaciones Push**: Recordatorios de turnos
- [ ] **Integración con Wearables**: Apple Health, Google Fit
- [ ] **Seguimiento de Rutinas**: Planes de entrenamiento personalizados
- [ ] **Chat con Entrenadores**: Comunicación directa
- [ ] **Modo Oscuro/Claro**: Toggle de tema
- [ ] **Pagos In-App**: Para membresías y productos

---

## 📄 Licencia

Este proyecto es parte de QUANTUM FIT y está protegido por derechos de autor.

---

## 👨‍💻 Desarrollo

### Estructura de Componentes

```typescript
// Ejemplo de uso del contexto
import { useAuth } from '../context/AuthContext';

function MiComponente() {
  const { user, points, addPoints } = useAuth();
  
  return (
    <View>
      <Text>{user.name}</Text>
      <Text>Puntos: {points}</Text>
    </View>
  );
}
```

### Tema Personalizado

```typescript
import { colors, spacing, typography } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
});
```

---

## 🎯 Filosofía de Diseño

QUANTUM FIT sigue estos principios de diseño:

1. **Minimalismo**: Menos es más
2. **Oscuridad**: Modo dark por defecto para reducir fatiga visual
3. **Neón**: Acentos vibrantes para acciones importantes
4. **Fluidez**: Animaciones suaves y transiciones naturales
5. **Motivación**: Elementos gamificados para incentivar la constancia

---

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@quantumfit.com
- Documentación: docs.quantumfit.com

---

<div align="center">

**QUANTUM FIT** - *Tu mejor versión comienza aquí*

Hecho con 💙 para la comunidad fitness

</div>
