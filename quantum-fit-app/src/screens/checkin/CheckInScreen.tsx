import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenHeader, LoadingState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type CheckInScreenProps = MainStackScreenProps<'CheckIn'>;

export default function CheckInScreen({ navigation }: CheckInScreenProps) {
  const { checkIn, user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInType, setCheckInType] = useState<'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER'>('OPEN_GYM');

  // Manejar código QR escaneado
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // {"gymId":"gym_001","type":"CLASS","zone":"A"}
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type) {
        setCheckInType(qrData.type as 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER');
      }
      
      await performCheckIn('QR_SCAN', qrData.gymLocation || 'Gimnasio Principal');
      setShowCamera(false);
    } catch (error) {
      Alert.alert(
        'QR Inválido',
        'El código QR escaneado no es válido. Escaneá el código QR oficial del gimnasio.',
        [{ text: 'Aceptar' }]
      );
      setShowCamera(false);
    }
  };

  // Realizar check-in
  const performCheckIn = async (
    validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE',
    gymLocation?: string
  ) => {
    try {
      setIsCheckingIn(true);
      
      const result = await checkIn(checkInType, validationMethod);
      
      // Mostrar éxito
      Alert.alert(
        '✅ ¡Check-in Exitoso!',
        `Ganaste ${result.pointsEarned} puntos\n🔥 Racha: ${result.streak.current} días`,
        [
          {
            text: '¡Genial!',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Dashboard' }),
          },
        ]
      );
    } catch (error: any) {
      const message = error.message || 'Error al registrar check-in';
      
      if (message.includes('ya registraste')) {
        Alert.alert(
          '⚠️ Ya registraste un check-in hoy',
          'Solo podés registrar un check-in por día',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo registrar el check-in. Intenta de nuevo.', [{ text: 'Aceptar' }]);
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Check-in manual (sin QR)
  const handleManualCheckIn = async () => {
    Alert.alert(
      'Seleccionar Tipo de Check-in',
      '¿Qué tipo de entrenamiento vas a realizar?',
      [
        {
          text: '🏋️ Clase Grupal',
          onPress: () => performCheckIn('STAFF_VALIDATION', 'Gimnasio Principal'),
        },
        {
          text: '💪 Entrenamiento Libre',
          onPress: () => performCheckIn('STAFF_VALIDATION', 'Gimnasio Principal'),
        },
        {
          text: '🏃 Entrenador Personal',
          onPress: () => performCheckIn('STAFF_VALIDATION', 'Gimnasio Principal'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Solicitar permiso de cámara
  const requestCameraPermission = async () => {
    const { granted } = await requestPermission();
    
    if (granted) {
      setShowCamera(true);
    } else {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a la cámara para escanear el código QR',
        [{ text: 'Aceptar' }]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Check-in" onBack={() => navigation.goBack()} />

      {/* Contenido Principal */}
      <View style={styles.content}>
        {/* Información del Usuario */}
        <View style={styles.userCard}>
          <Text style={styles.greetingText}>Hola, {user?.name.split(' ')[0]}!</Text>
          <Text style={styles.pointsText}>
            🏆 {user?.points.toLocaleString()} puntos
          </Text>
          <Text style={styles.streakText}>
            🔥 {user?.currentStreak} días de racha
          </Text>
        </View>

        {/* Instrucciones */}
        <View style={styles.instructionsCard}>
          <Ionicons name="qr-code-outline" size={48} color={colors.primary} />
          <Text style={styles.instructionsTitle}>
            Escaneá el código QR
          </Text>
          <Text style={styles.instructionsText}>
            El código QR se encuentra en la recepción del gimnasio
          </Text>
        </View>

        {/* Botón de Escanear QR */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={requestCameraPermission}
          disabled={isCheckingIn}
        >
          {isCheckingIn ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons name="scan-outline" size={24} color={colors.background} />
              <Text style={styles.scanButtonText}>Escanear QR</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.divider} />
        </View>

        {/* Botón de Check-in Manual */}
        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualCheckIn}
          disabled={isCheckingIn}
        >
          <Ionicons name="fitness" size={24} color={colors.primary} />
          <Text style={styles.manualButtonText}>Check-in Manual</Text>
        </TouchableOpacity>

        {/* Información Adicional */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.infoText}>
            Podés registrar un check-in por día. Los puntos se suman automáticamente a tu cuenta.
          </Text>
        </View>
      </View>

      {/* Modal de Cámara */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          
          {/* Overlay */}
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
          </View>

          {/* Botón de Cerrar */}
          <TouchableOpacity
            style={styles.closeCameraButton}
            onPress={() => setShowCamera(false)}
          >
            <Ionicons name="close" size={32} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Instrucciones */}
          <View style={styles.cameraInstructions}>
            <Text style={styles.cameraInstructionsText}>
              Apuntá al código QR del gimnasio
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  userCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greetingText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pointsText: {
    fontSize: typography.sizes.md,
    color: colors.points,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  streakText: {
    fontSize: typography.sizes.md,
    color: colors.secondary,
    fontWeight: '600',
  },
  instructionsCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...{
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  },
  scanButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.background,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    fontSize: typography.sizes.md,
  },
  manualButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  closeCameraButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInstructions: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  cameraInstructionsText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
});
