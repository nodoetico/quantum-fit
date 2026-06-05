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
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

interface TutorialSlide {
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
  tips: string[];
}

const slides: TutorialSlide[] = [
  {
    title: '¡Bienvenido a QUANTUM FIT!',
    description: 'Tu compañero definitivo para alcanzar tus objetivos fitness',
    icon: '🚀',
    gradient: [colors.primary, colors.primaryDark],
    tips: [
      'Reserva turnos para tus clases favoritas',
      'Gana puntos por cada entrenamiento',
      'Canjea premios exclusivos',
    ],
  },
  {
    title: 'Reserva Tus Turnos',
    description: 'Elige entre diferentes clases y niveles de dificultad',
    icon: '📅',
    gradient: [colors.secondary, colors.secondaryDark],
    tips: [
      'Filtra por nivel: Principiante, Intermedio o Avanzado',
      'Reserva con anticipación para asegurar tu lugar',
      'Llega 10 minutos antes para el check-in',
    ],
  },
  {
    title: 'Gana Puntos y Premios',
    description: 'Cada entrenamiento te acerca a recompensas increíbles',
    icon: '🏆',
    gradient: [colors.points, '#FFA500'],
    tips: [
      '+50 puntos por entrenamiento completado',
      '+75 puntos por clase grupal',
      '+100 puntos por logros desbloqueados',
    ],
  },
  {
    title: 'Sigue Tu Progreso',
    description: 'Mira tu evolución y compite en el ranking',
    icon: '📊',
    gradient: [colors.error, '#FF6B6B'],
    tips: [
      'Revisa tus estadísticas semanales',
      'Mantén tu racha de entrenamientos',
      'Escala posiciones en el ranking global',
    ],
  },
  {
    title: 'Niveles y Logros',
    description: 'Sube de nivel mientras te vuelves más fuerte',
    icon: '⭐',
    gradient: [colors.levelDiamond, colors.primary],
    tips: [
      'Principiante: Nivel 1-2',
      'Intermedio: Nivel 3-4',
      'Avanzado: Nivel 5+',
    ],
  },
  {
    title: '¡Listo para Comenzar!',
    description: 'Tu transformación fitness comienza ahora',
    icon: '💪',
    gradient: [colors.primary, colors.secondary],
    tips: [
      'Completa tu perfil para personalizar tu experiencia',
      'Consulta las promociones disponibles',
      '¡Disfruta del viaje!',
    ],
  },
];

interface TutorialModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function TutorialModal({ visible, onComplete }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Saltar</Text>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentSlide && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Slide Content */}
          <ScrollView
            style={styles.slideContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <LinearGradient
              colors={slide.gradient}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.slideIcon}>{slide.icon}</Text>
            </LinearGradient>

            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>

            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Ionicons name="star" size={20} color={colors.warning} />
                <Text style={styles.tipsHeaderTitle}>Consejos</Text>
              </View>
              {slide.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.primary}
                    style={styles.tipIcon}
                  />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentSlide > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentSlide(currentSlide - 1)}
              >
                <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? '¡Comenzar!' : 'Continuar'}
              </Text>
              <Ionicons
                name={currentSlide === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
                size={20}
                color={colors.background}
                style={styles.nextIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  skipButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  slideContent: {
    flex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
    ...shadows.large,
  },
  slideIcon: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  tipsContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tipsHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.warning,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    ...shadows.glow,
    gap: spacing.xs,
  },
  nextButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },
  nextIcon: {
    marginLeft: spacing.xs,
  },
});
