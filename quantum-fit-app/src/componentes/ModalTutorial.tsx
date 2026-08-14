import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia, sombras } from '../constantes/tema';

interface DiapositivaTutorial {
  titulo: string;
  descripcion: string;
  icono: string;
  gradiente: [string, string];
  consejos: string[];
}

const diapositivas: DiapositivaTutorial[] = [
  {
    titulo: '¡Bienvenido a QUANTUM FIT!',
    descripcion: 'Tu compañero definitivo para alcanzar tus objetivos fitness',
    icono: '🚀',
    gradiente: [colores.primario, colores.primarioOscuro],
    consejos: [
      'Reserva turnos para tus clases favoritas',
      'Gana puntos por cada entrenamiento',
      'Canjea premios exclusivos',
    ],
  },
  {
    titulo: 'Reserva Tus Turnos',
    descripcion: 'Elige entre diferentes clases y niveles de dificultad',
    icono: '📅',
    gradiente: [colores.secundario, colores.secundarioOscuro],
    consejos: [
      'Filtra por nivel: Principiante, Intermedio o Avanzado',
      'Reserva con anticipación para asegurar tu lugar',
      'Llega 10 minutos antes para el check-in',
    ],
  },
  {
    titulo: 'Gana Puntos y Premios',
    descripcion: 'Cada entrenamiento te acerca a recompensas increíbles',
    icono: '🏆',
    gradiente: [colores.puntos, '#FFA500'],
    consejos: [
      '+50 puntos por entrenamiento completado',
      '+75 puntos por clase grupal',
      '+100 puntos por logros desbloqueados',
    ],
  },
  {
    titulo: 'Sigue Tu Progreso',
    descripcion: 'Mira tu evolución y compite en el ranking',
    icono: '📊',
    gradiente: [colores.error, '#FF6B6B'],
    consejos: [
      'Revisa tus estadísticas semanales',
      'Mantén tu racha de entrenamientos',
      'Escala posiciones en el ranking global',
    ],
  },
  {
    titulo: 'Niveles y Logros',
    descripcion: 'Sube de nivel mientras te vuelves más fuerte',
    icono: '⭐',
    gradiente: [colores.nivelDiamante, colores.primario],
    consejos: [
      'Principiante: Nivel 1-2',
      'Intermedio: Nivel 3-4',
      'Avanzado: Nivel 5+',
    ],
  },
  {
    titulo: '¡Listo para Comenzar!',
    descripcion: 'Tu transformación fitness comienza ahora',
    icono: '💪',
    gradiente: [colores.primario, colores.secundario],
    consejos: [
      'Completa tu perfil para personalizar tu experiencia',
      'Consulta las promociones disponibles',
      '¡Disfruta del viaje!',
    ],
  },
];

interface PropsModalTutorial {
  visible: boolean;
  alCompletar: () => void;
}

export default function ModalTutorial({ visible, alCompletar }: PropsModalTutorial) {
  const [diapositivaActual, setDiapositivaActual] = useState(0);

  const manejarSiguiente = () => {
    if (diapositivaActual < diapositivas.length - 1) {
      setDiapositivaActual(diapositivaActual + 1);
    } else {
      alCompletar();
    }
  };

  const manejarSaltar = () => {
    alCompletar();
  };

  const diapositiva = diapositivas[diapositivaActual];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={manejarSaltar}
    >
      <View style={styles.superposicion}>
        <View style={styles.contenedor}>
          {/* Botón Saltar */}
          <TouchableOpacity style={styles.botonSaltar} onPress={manejarSaltar}>
            <Text style={styles.textoBotonSaltar}>Saltar</Text>
            <Ionicons name="close" size={20} color={colores.textoSecundario} />
          </TouchableOpacity>

          {/* Indicador de progreso */}
          <View style={styles.contenedorProgreso}>
            {diapositivas.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.puntoProgreso,
                  index === diapositivaActual && styles.puntoProgresoActivo,
                ]}
              />
            ))}
          </View>

          {/* Contenido de la diapositiva */}
          <ScrollView
            style={styles.contenidoDiapositiva}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <LinearGradient
              colors={diapositiva.gradiente}
              style={styles.contenedorIcono}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iconoDiapositiva}>{diapositiva.icono}</Text>
            </LinearGradient>

            <Text style={styles.tituloDiapositiva}>{diapositiva.titulo}</Text>
            <Text style={styles.descripcionDiapositiva}>{diapositiva.descripcion}</Text>

            <View style={styles.contenedorConsejos}>
              <View style={styles.encabezadoConsejos}>
                <Ionicons name="star" size={20} color={colores.advertencia} />
                <Text style={styles.tituloConsejos}>Consejos</Text>
              </View>
              {diapositiva.consejos.map((consejo, index) => (
                <View key={index} style={styles.itemConsejo}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colores.primario}
                    style={styles.iconoConsejo}
                  />
                  <Text style={styles.textoConsejo}>{consejo}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Botones de navegación */}
          <View style={styles.contenedorNavegacion}>
            {diapositivaActual > 0 && (
              <TouchableOpacity
                style={styles.botonAtras}
                onPress={() => setDiapositivaActual(diapositivaActual - 1)}
              >
                <Ionicons name="arrow-back" size={20} color={colores.textoPrincipal} />
                <Text style={styles.textoBotonAtras}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.botonSiguiente}
              onPress={manejarSiguiente}
            >
              <Text style={styles.textoBotonSiguiente}>
                {diapositivaActual === diapositivas.length - 1 ? '¡Comenzar!' : 'Continuar'}
              </Text>
              <Ionicons
                name={diapositivaActual === diapositivas.length - 1 ? 'checkmark' : 'arrow-forward'}
                size={20}
                color={colores.fondo}
                style={styles.iconoSiguiente}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  superposicion: {
    flex: 1,
    backgroundColor: colores.superposicion,
    justifyContent: 'flex-end',
  },
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondoTarjeta,
    borderTopLeftRadius: radioBorde.xxl,
    borderTopRightRadius: radioBorde.xxl,
    padding: espaciado.xl,
    paddingBottom: espaciado.xxl,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  botonSaltar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: espaciado.sm,
    gap: espaciado.xs,
  },
  textoBotonSaltar: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  contenedorProgreso: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: espaciado.lg,
    gap: espaciado.sm,
  },
  puntoProgreso: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.borde,
  },
  puntoProgresoActivo: {
    width: 24,
    backgroundColor: colores.primario,
  },
  contenidoDiapositiva: {
    flex: 1,
  },
  contenedorIcono: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: espaciado.xl,
    ...sombras.grande,
  },
  iconoDiapositiva: {
    fontSize: 56,
  },
  tituloDiapositiva: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: espaciado.md,
  },
  descripcionDiapositiva: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: espaciado.xl,
  },
  contenedorConsejos: {
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  encabezadoConsejos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.md,
    gap: espaciado.sm,
  },
  tituloConsejos: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.advertencia,
  },
  itemConsejo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: espaciado.md,
    gap: espaciado.sm,
  },
  iconoConsejo: {
    marginTop: 2,
  },
  textoConsejo: {
    flex: 1,
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    lineHeight: 20,
  },
  contenedorNavegacion: {
    flexDirection: 'row',
    gap: espaciado.md,
    marginTop: espaciado.xl,
    paddingTop: espaciado.xl,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  botonAtras: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.lg,
    paddingHorizontal: espaciado.xl,
    borderRadius: radioBorde.lg,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.xs,
  },
  textoBotonAtras: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  botonSiguiente: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.lg,
    paddingHorizontal: espaciado.xl,
    borderRadius: radioBorde.lg,
    backgroundColor: colores.primario,
    ...sombras.brillo,
    gap: espaciado.xs,
  },
  textoBotonSiguiente: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },
  iconoSiguiente: {
    marginLeft: espaciado.xs,
  },
});
