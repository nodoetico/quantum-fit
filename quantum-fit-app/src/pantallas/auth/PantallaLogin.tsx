import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia, sombras } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import logoImage from '../../../assets/logo.png';
import type { PropsPantallaAuth } from '../../tipos/navegacion';

type PropsPantallaLogin = PropsPantallaAuth<'Login'>;

export default function PantallaLogin({ navigation }: PropsPantallaLogin) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [iniciandoSesion, setIniciandoSesion] = useState(false);
  const { iniciarSesion, errorLogin } = useAuth();

  // Animaciones del logo
  const escalaLogo = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animarLogo = Animated.loop(
      Animated.sequence([
        Animated.timing(escalaLogo, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(escalaLogo, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    animarLogo.start();

    return () => {
      animarLogo.stop();
    };
  }, []);

  const manejarLogin = async () => {
    setError('');

    if (!email || !contrasena) {
      setError('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un email válido');
      return;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIniciandoSesion(true);
    await iniciarSesion(email, contrasena);
    setIniciandoSesion(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.contenedor}>
        <ScrollView
          contentContainerStyle={styles.contenidoDesplazable}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo con animación */}
          <View style={styles.contenedorLogo}>
            <Animated.Image
              source={logoImage}
              style={[
                styles.logo,
                { transform: [{ scale: escalaLogo }] },
              ]}
              resizeMode="contain"
            />
            <Text style={styles.eslogan}>Tu mejor versión comienza aquí</Text>
          </View>

          {/* Formulario */}
          <View style={styles.contenedorFormulario}>
            <View style={styles.contenedorInput}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colores.textoSecundario}
                style={styles.iconoInput}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colores.textoAtenuado}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.contenedorInput}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colores.textoSecundario}
                style={styles.iconoInput}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colores.textoAtenuado}
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry={!mostrarContrasena}
              />
              <TouchableOpacity
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
                style={styles.botonMostrarContrasena}
              >
                <Ionicons
                  name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colores.textoSecundario}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.textoError}>{error}</Text> : null}
            {errorLogin ? <Text style={styles.textoError}>{errorLogin}</Text> : null}

            <TouchableOpacity
              style={styles.olvideContrasena}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.textoOlvideContrasena}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonIngresar}
              onPress={manejarLogin}
              disabled={iniciandoSesion}
            >
              {iniciandoSesion ? (
                <ActivityIndicator color={colores.fondo} />
              ) : (
                <Text style={styles.textoBotonIngresar}>INGRESAR</Text>
              )}
            </TouchableOpacity>

            {/* Divisor */}
            <View style={styles.contenedorDivisor}>
              <View style={styles.divisor} />
              <Text style={styles.textoDivisor}>O continúa con</Text>
              <View style={styles.divisor} />
            </View>

            {/* Login social */}
            <View style={styles.contenedorBotonesSociales}>
              <TouchableOpacity style={styles.botonSocial} onPress={() => Alert.alert('Próximamente', 'El inicio de sesión con Google estará disponible pronto.')}>
                <Ionicons name="logo-google" size={20} color={colores.textoPrincipal} />
                <Text style={styles.textoBotonSocial}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonSocial} onPress={() => Alert.alert('Próximamente', 'El inicio de sesión con Apple estará disponible pronto.')}>
                <Ionicons name="logo-apple" size={20} color={colores.textoPrincipal} />
                <Text style={styles.textoBotonSocial}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Registro */}
            <View style={styles.contenedorRegistro}>
              <Text style={styles.textoRegistro}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.enlaceRegistro}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoDesplazable: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: espaciado.xl,
  },
  contenedorLogo: {
    alignItems: 'center',
    marginBottom: 17,
  },
  logo: {
    width: 400,
    height: 250,
  },
  eslogan: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    letterSpacing: 2,
    marginTop: espaciado.lg,
  },
  contenedorFormulario: {
    paddingHorizontal: espaciado.xl,
  },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },
  iconoInput: {
    marginRight: espaciado.md,
  },
  input: {
    flex: 1,
    paddingVertical: espaciado.lg,
    color: colores.textoPrincipal,
    fontSize: tipografia.tamanos.md,
  },
  botonMostrarContrasena: {
    padding: espaciado.sm,
  },
  textoError: {
    color: colores.error,
    fontSize: tipografia.tamanos.sm,
    marginBottom: espaciado.md,
    textAlign: 'center',
  },
  olvideContrasena: {
    alignSelf: 'flex-end',
    marginBottom: espaciado.xl,
  },
  textoOlvideContrasena: {
    color: colores.primario,
    fontSize: tipografia.tamanos.sm,
  },
  botonIngresar: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    alignItems: 'center',
    ...sombras.brillo,
  },
  textoBotonIngresar: {
    color: colores.fondo,
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    letterSpacing: 2,
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
    fontSize: tipografia.tamanos.sm,
  },
  contenedorBotonesSociales: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espaciado.md,
  },
  botonSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.sm,
  },
  textoBotonSocial: {
    color: colores.textoPrincipal,
    fontSize: tipografia.tamanos.md,
    fontWeight: '500',
  },
  contenedorRegistro: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: espaciado.xxl,
  },
  textoRegistro: {
    color: colores.textoSecundario,
    fontSize: tipografia.tamanos.md,
  },
  enlaceRegistro: {
    color: colores.primario,
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
  },
});
