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
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { EncabezadoPantalla, EstadoCargando } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type PropsPantallaCheckIn = PropsPantallaStackPrincipal<'CheckIn'>;

export default function PantallaCheckIn({ navigation }: PropsPantallaCheckIn) {
  const { realizarCheckIn, usuario } = useAuth();
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [registrandoCheckIn, setRegistrandoCheckIn] = useState(false);
  const [tipoCheckIn, setTipoCheckIn] = useState<'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER'>('OPEN_GYM');

  // Manejar código QR escaneado
  const manejarCodigoEscaneado = async ({ data }: { data: string }) => {
    // {"gymId":"gym_001","type":"CLASS","zone":"A"}
    try {
      const datosQr = JSON.parse(data);
      
      if (datosQr.type) {
        setTipoCheckIn(datosQr.type as 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER');
      }
      
      await ejecutarCheckIn('QR_SCAN', datosQr.gymLocation || 'Gimnasio Principal');
      setMostrarCamara(false);
    } catch (error) {
      Alert.alert(
        'QR Inválido',
        'El código QR escaneado no es válido. Escaneá el código QR oficial del gimnasio.',
        [{ text: 'Aceptar' }]
      );
      setMostrarCamara(false);
    }
  };

  // Realizar check-in
  const ejecutarCheckIn = async (
    metodoValidacion: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE',
    ubicacionGimnasio?: string
  ) => {
    try {
      setRegistrandoCheckIn(true);
      
      const resultado = await realizarCheckIn(tipoCheckIn, metodoValidacion);
      
      // Mostrar éxito
      Alert.alert(
        '✅ ¡Check-in Exitoso!',
        `Ganaste ${resultado.pointsEarned} puntos\n🔥 Racha: ${resultado.streak.current} días`,
        [
          {
            text: '¡Genial!',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Dashboard' }),
          },
        ]
      );
    } catch (error: any) {
      const mensaje = error.message || 'Error al registrar check-in';
      
      if (mensaje.includes('ya registraste')) {
        Alert.alert(
          '⚠️ Ya registraste un check-in hoy',
          'Solo podés registrar un check-in por día',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo registrar el check-in. Intenta de nuevo.', [{ text: 'Aceptar' }]);
      }
    } finally {
      setRegistrandoCheckIn(false);
    }
  };

  // Check-in manual (sin QR)
  const manejarCheckInManual = async () => {
    Alert.alert(
      'Seleccionar Tipo de Check-in',
      '¿Qué tipo de entrenamiento vas a realizar?',
      [
        {
          text: '🏋️ Clase Grupal',
          onPress: () => ejecutarCheckIn('STAFF_VALIDATION', 'Gimnasio Principal'),
        },
        {
          text: '💪 Entrenamiento Libre',
          onPress: () => ejecutarCheckIn('STAFF_VALIDATION', 'Gimnasio Principal'),
        },
        {
          text: '🏃 Entrenador Personal',
          onPress: () => ejecutarCheckIn('STAFF_VALIDATION', 'Gimnasio Principal'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Solicitar permiso de cámara
  const solicitarPermisoCamara = async () => {
    const { granted } = await solicitarPermiso();
    
    if (granted) {
      setMostrarCamara(true);
    } else {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a la cámara para escanear el código QR',
        [{ text: 'Aceptar' }]
      );
    }
  };

  if (!permiso) {
    return (
      <View style={styles.contenedor}>
        <EstadoCargando />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Check-in" alVolver={() => navigation.goBack()} />

      {/* Contenido Principal */}
      <View style={styles.contenido}>
        {/* Información del Usuario */}
        <View style={styles.tarjetaUsuario}>
          <Text style={styles.textoSaludo}>Hola, {usuario?.name.split(' ')[0]}!</Text>
          <Text style={styles.textoPuntos}>
            🏆 {usuario?.points.toLocaleString()} puntos
          </Text>
          <Text style={styles.textoRacha}>
            🔥 {usuario?.currentStreak} días de racha
          </Text>
        </View>

        {/* Instrucciones */}
        <View style={styles.tarjetaInstrucciones}>
          <Ionicons name="qr-code-outline" size={48} color={colores.primario} />
          <Text style={styles.tituloInstrucciones}>
            Escaneá el código QR
          </Text>
          <Text style={styles.textoInstrucciones}>
            El código QR se encuentra en la recepción del gimnasio
          </Text>
        </View>

        {/* Botón de Escanear QR */}
        <TouchableOpacity
          style={styles.botonEscanear}
          onPress={solicitarPermisoCamara}
          disabled={registrandoCheckIn}
        >
          {registrandoCheckIn ? (
            <ActivityIndicator color={colores.fondo} />
          ) : (
            <>
              <Ionicons name="scan-outline" size={24} color={colores.fondo} />
              <Text style={styles.textoBotonEscanear}>Escanear QR</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.contenedorDivisor}>
          <View style={styles.divisor} />
          <Text style={styles.textoDivisor}>o</Text>
          <View style={styles.divisor} />
        </View>

        {/* Botón de Check-in Manual */}
        <TouchableOpacity
          style={styles.botonManual}
          onPress={manejarCheckInManual}
          disabled={registrandoCheckIn}
        >
          <Ionicons name="fitness" size={24} color={colores.primario} />
          <Text style={styles.textoBotonManual}>Check-in Manual</Text>
        </TouchableOpacity>

        {/* Información Adicional */}
        <View style={styles.tarjetaInfo}>
          <Ionicons name="information-circle-outline" size={20} color={colores.textoAtenuado} />
          <Text style={styles.textoInfo}>
            Podés registrar un check-in por día. Los puntos se suman automáticamente a tu cuenta.
          </Text>
        </View>
      </View>

      {/* Modal de Cámara */}
      <Modal
        visible={mostrarCamara}
        animationType="slide"
        onRequestClose={() => setMostrarCamara(false)}
      >
        <View style={styles.contenedorCamara}>
          <CameraView
            style={styles.camara}
            onBarcodeScanned={manejarCodigoEscaneado}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          
          {/* Overlay */}
          <View style={styles.superposicionCamara}>
            <View style={styles.marcoEscaneo} />
          </View>

          {/* Botón de Cerrar */}
          <TouchableOpacity
            style={styles.botonCerrarCamara}
            onPress={() => setMostrarCamara(false)}
          >
            <Ionicons name="close" size={32} color={colores.textoPrincipal} />
          </TouchableOpacity>

          {/* Instrucciones */}
          <View style={styles.instruccionesCamara}>
            <Text style={styles.textoInstruccionesCamara}>
              Apuntá al código QR del gimnasio
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flex: 1,
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.xl,
  },
  tarjetaUsuario: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    marginBottom: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoSaludo: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.sm,
  },
  textoPuntos: {
    fontSize: tipografia.tamanos.md,
    color: colores.puntos,
    fontWeight: '600',
    marginBottom: espaciado.xs,
  },
  textoRacha: {
    fontSize: tipografia.tamanos.md,
    color: colores.secundario,
    fontWeight: '600',
  },
  tarjetaInstrucciones: {
    alignItems: 'center',
    padding: espaciado.xl,
    marginBottom: espaciado.xl,
  },
  tituloInstrucciones: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginTop: espaciado.md,
    marginBottom: espaciado.sm,
  },
  textoInstrucciones: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  botonEscanear: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    ...{
      shadowColor: colores.primario,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  },
  textoBotonEscanear: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.fondo,
  },
  contenedorDivisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: espaciado.xl,
  },
  divisor: {
    flex: 1,
    height: 1,
    backgroundColor: colores.borde,
  },
  textoDivisor: {
    color: colores.textoAtenuado,
    marginHorizontal: espaciado.md,
    fontSize: tipografia.tamanos.md,
  },
  botonManual: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoBotonManual: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.primario,
  },
  tarjetaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    marginTop: espaciado.xl,
    gap: espaciado.sm,
  },
  textoInfo: {
    flex: 1,
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    lineHeight: 20,
  },
  contenedorCamara: {
    flex: 1,
    backgroundColor: '#000',
  },
  camara: {
    flex: 1,
  },
  superposicionCamara: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marcoEscaneo: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colores.primario,
    borderRadius: radioBorde.lg,
    backgroundColor: 'transparent',
  },
  botonCerrarCamara: {
    position: 'absolute',
    top: espaciado.xl,
    right: espaciado.xl,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruccionesCamara: {
    position: 'absolute',
    bottom: espaciado.xxl,
    left: espaciado.xl,
    right: espaciado.xl,
    alignItems: 'center',
  },
  textoInstruccionesCamara: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoPrincipal,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: espaciado.md,
    borderRadius: radioBorde.lg,
  },
});
