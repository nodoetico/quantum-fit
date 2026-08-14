import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia, sombras } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import type { PropsPantallaAuth } from '../../tipos/navegacion';

type PropsPantallaOlvideContrasena = PropsPantallaAuth<'ForgotPassword'>;

export default function PantallaOlvideContrasena({ navigation }: PropsPantallaOlvideContrasena) {
  const [email, setEmail] = useState('');
  const [tokenRestablecimiento, setTokenRestablecimiento] = useState('');
  const [paso, setPaso] = useState<'email' | 'enviado' | 'restablecer' | 'listo'>('email');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [tokenManual, setTokenManual] = useState('');
  const { restablecerContrasena, completarRestablecimiento, restableciendo } = useAuth();

  const manejarSolicitarToken = async () => {
    setError('');

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un email válido');
      return;
    }

    const ok = await restablecerContrasena(email);
    if (ok) {
      setPaso('enviado');
    } else {
      setError('Error al procesar la solicitud');
    }
  };

  const validarContrasena = (pw: string): string | null => {
    if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(pw)) return 'Debe contener al menos una mayúscula';
    if (!/[a-z]/.test(pw)) return 'Debe contener al menos una minúscula';
    if (!/[0-9]/.test(pw)) return 'Debe contener al menos un número';
    return null;
  };

  const manejarRestablecerContrasena = async () => {
    setError('');

    const errorPw = validarContrasena(contrasena);
    if (errorPw) {
      setError(errorPw);
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const token = tokenRestablecimiento || tokenManual;
    if (!token) {
      setError('Ingresá el código de restablecimiento');
      return;
    }

    const exito = await completarRestablecimiento(token, contrasena);
    if (exito) {
      setPaso('listo');
    } else {
      setError('Código inválido o expirado. Solicitá uno nuevo.');
    }
  };

  const manejarIrARestablecer = () => {
    setTokenRestablecimiento(tokenManual);
    setPaso('restablecer');
  };

  if (paso === 'listo') {
    return (
      <LinearGradient
        colors={[colores.fondo, colores.fondoSecundario]}
        style={styles.contenedor}
      >
        <View style={styles.contenedorExito}>
          <View style={styles.iconoExito}>
            <Ionicons name="checkmark-circle" size={60} color={colores.secundario} />
          </View>
          <Text style={styles.tituloExito}>¡Contraseña actualizada!</Text>
          <Text style={styles.textoExito}>
            Tu contraseña se restableció correctamente.
          </Text>

          <TouchableOpacity
            style={styles.botonEnviar}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.textoBotonEnviar}>IR AL INICIO DE SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colores.fondo, colores.fondoSecundario]}
        style={styles.contenedor}
      >
        <ScrollView
          contentContainerStyle={styles.contenidoDesplazable}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contenedorEncabezado}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.botonVolver}
            >
              <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
            </TouchableOpacity>
          </View>

          {paso === 'email' && (
            <>
              <View style={styles.contenedorIcono}>
                <View style={styles.espacioIcono}>
                  <Ionicons name="lock-closed" size={50} color={colores.primario} />
                </View>
              </View>

              <View style={styles.contenedorContenido}>
                <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
                <Text style={styles.subtitulo}>
                  Ingresa tu email para restablecer tu contraseña.
                </Text>

                <View style={styles.contenedorInput}>
                  <Ionicons name="mail-outline" size={20} color={colores.textoSecundario} style={styles.iconoInput} />
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

                {error ? <Text style={styles.textoError}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.botonEnviar}
                  onPress={manejarSolicitarToken}
                  disabled={restableciendo}
                >
                  {restableciendo ? (
                    <ActivityIndicator color={colores.fondo} />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color={colores.fondo} style={styles.iconoEnviar} />
                      <Text style={styles.textoBotonEnviar}>ENVIAR ENLACE</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonLogin}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.textoBotonLogin}>Volver al inicio de sesión</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {paso === 'enviado' && (
            <>
              <View style={styles.contenedorIcono}>
                <View style={styles.espacioIcono}>
                  <Ionicons name="mail-unread" size={50} color={colores.primario} />
                </View>
              </View>

              <View style={styles.contenedorContenido}>
                <Text style={styles.titulo}>Revisá tu email</Text>
                <Text style={styles.subtitulo}>
                  Si existe una cuenta asociada a {email}, vas a recibir instrucciones para restablecer tu contraseña.
                </Text>

                <View style={styles.contenedorInput}>
                  <Ionicons name="key-outline" size={20} color={colores.textoSecundario} style={styles.iconoInput} />
                  <TextInput
                    style={styles.input}
                    placeholder="Código de restablecimiento"
                    placeholderTextColor={colores.textoAtenuado}
                    value={tokenManual}
                    onChangeText={setTokenManual}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.botonEnviar, !tokenManual && styles.botonDeshabilitado]}
                  onPress={manejarIrARestablecer}
                  disabled={!tokenManual}
                >
                  <Ionicons name="key" size={20} color={colores.fondo} style={styles.iconoEnviar} />
                  <Text style={styles.textoBotonEnviar}>INGRESAR CÓDIGO DE RESETEO</Text>
                </TouchableOpacity>

                {error ? <Text style={styles.textoError}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.botonLogin}
                  onPress={() => setPaso('email')}
                >
                  <Text style={styles.textoBotonLogin}>Volver al paso anterior</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {paso === 'restablecer' && (
            <>
              <View style={styles.contenedorIcono}>
                <View style={styles.espacioIcono}>
                  <Ionicons name="key" size={50} color={colores.primario} />
                </View>
              </View>

              <View style={styles.contenedorContenido}>
                <Text style={styles.titulo}>Nueva contraseña</Text>
                <Text style={styles.subtitulo}>
                  Ingresá tu nueva contraseña para {email}
                </Text>

                <View style={styles.contenedorInput}>
                  <Ionicons name="lock-closed-outline" size={20} color={colores.textoSecundario} style={styles.iconoInput} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={colores.textoAtenuado}
                    value={contrasena}
                    onChangeText={setContrasena}
                    secureTextEntry
                  />
                </View>

                <View style={styles.contenedorInput}>
                  <Ionicons name="lock-closed-outline" size={20} color={colores.textoSecundario} style={styles.iconoInput} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={colores.textoAtenuado}
                    value={confirmarContrasena}
                    onChangeText={setConfirmarContrasena}
                    secureTextEntry
                  />
                </View>

                <Text style={styles.textoSugerencia}>
                  Mínimo 8 caracteres, mayúscula, minúscula y número.
                </Text>

                {error ? <Text style={styles.textoError}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.botonEnviar}
                  onPress={manejarRestablecerContrasena}
                  disabled={restableciendo}
                >
                  {restableciendo ? (
                    <ActivityIndicator color={colores.fondo} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={colores.fondo} style={styles.iconoEnviar} />
                      <Text style={styles.textoBotonEnviar}>RESTABLECER</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonLogin}
                  onPress={() => setPaso('enviado')}
                >
                  <Text style={styles.textoBotonLogin}>Volver al paso anterior</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  contenidoDesplazable: {
    flexGrow: 1,
    paddingVertical: espaciado.xxl,
  },
  contenedorEncabezado: {
    paddingHorizontal: espaciado.xl,
    marginBottom: espaciado.xl,
  },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonVolverTexto: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  contenedorIcono: {
    alignItems: 'center',
    marginBottom: espaciado.xl,
  },
  espacioIcono: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colores.primario,
  },
  contenedorContenido: {
    paddingHorizontal: espaciado.xl,
  },
  titulo: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: espaciado.md,
  },
  subtitulo: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: espaciado.xl,
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
  textoError: {
    color: colores.error,
    fontSize: tipografia.tamanos.sm,
    marginBottom: espaciado.md,
    textAlign: 'center',
  },
  textoSugerencia: {
    color: colores.textoAtenuado,
    fontSize: tipografia.tamanos.xs,
    marginBottom: espaciado.md,
    textAlign: 'center',
  },
  botonEnviar: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...sombras.brillo,
    marginBottom: espaciado.md,
  },
  iconoEnviar: {
    marginRight: espaciado.sm,
  },
  textoBotonEnviar: {
    color: colores.fondo,
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    letterSpacing: 2,
  },
  botonLogin: {
    paddingVertical: espaciado.lg,
    alignItems: 'center',
  },
  textoBotonLogin: {
    color: colores.textoSecundario,
    fontSize: tipografia.tamanos.md,
  },
  botonEnlace: {
    paddingVertical: espaciado.md,
    alignItems: 'center',
  },
  textoBotonEnlace: {
    color: colores.primario,
    fontSize: tipografia.tamanos.sm,
    textDecorationLine: 'underline',
  },
  botonPequeno: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombras.brillo,
  },
  textoBotonPequeno: {
    color: colores.fondo,
    fontSize: tipografia.tamanos.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  contenedorExito: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: espaciado.xl,
  },
  iconoExito: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.xl,
    borderWidth: 2,
    borderColor: colores.secundario,
  },
  tituloExito: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: espaciado.md,
  },
  textoExito: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: espaciado.xl,
  },
});
