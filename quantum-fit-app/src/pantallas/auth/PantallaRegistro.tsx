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

type PropsPantallaRegistro = PropsPantallaAuth<'Register'>;

export default function PantallaRegistro({ navigation }: PropsPantallaRegistro) {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const { registrar } = useAuth();

  const manejarRegistro = async () => {
    setError('');

    if (!nombre || !dni || !email || !contrasena || !confirmarContrasena) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      setError('Ingresá un DNI válido (7 u 8 dígitos)');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(contrasena)) {
      setError('La contraseña debe tener al menos una mayúscula');
      return;
    }
    if (!/[a-z]/.test(contrasena)) {
      setError('La contraseña debe tener al menos una minúscula');
      return;
    }
    if (!/[0-9]/.test(contrasena)) {
      setError('La contraseña debe tener al menos un número');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresá un email válido');
      return;
    }

    setRegistrando(true);
    const mensajeError = await registrar(nombre, email, contrasena, dni);
    setRegistrando(false);
    if (mensajeError) {
      setError(mensajeError);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.vistaTeclado}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <LinearGradient
        colors={[colores.fondo, colores.fondoSecundario]}
        style={styles.contenedor}
      >
        <ScrollView
          contentContainerStyle={styles.contenidoDesplazable}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* Encabezado */}
          <View style={styles.contenedorEncabezado}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.botonVolver}
            >
              <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
            </TouchableOpacity>
            <View style={styles.contenedorLogo}>
              <Ionicons name="fitness" size={40} color={colores.primario} />
              <Text style={styles.textoLogo}>QUANTUM</Text>
              <Text style={styles.textoLogoSecundario}>FIT</Text>
            </View>
            <Text style={styles.eslogan}>Únete a la revolución fitness</Text>
          </View>

          {/* Formulario */}
          <View style={styles.contenedorFormulario}>
            <View style={styles.contenedorInput}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colores.textoSecundario}
                style={styles.iconoInput}
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={colores.textoAtenuado}
                value={nombre}
                onChangeText={(v) => { setError(''); setNombre(v); }}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.contenedorInput}>
              <Ionicons
                name="card-outline"
                size={20}
                color={colores.textoSecundario}
                style={styles.iconoInput}
              />
              <TextInput
                style={styles.input}
                placeholder="DNI"
                placeholderTextColor={colores.textoAtenuado}
                value={dni}
                onChangeText={(v) => { setError(''); setDni(v); }}
                keyboardType="number-pad"
                maxLength={8}
              />
            </View>

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
                onChangeText={(v) => { setError(''); setEmail(v); }}
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
                onChangeText={(v) => { setError(''); setContrasena(v); }}
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

            <View style={styles.contenedorInput}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colores.textoSecundario}
                style={styles.iconoInput}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={colores.textoAtenuado}
                value={confirmarContrasena}
                onChangeText={(v) => { setError(''); setConfirmarContrasena(v); }}
                secureTextEntry={!mostrarConfirmarContrasena}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                style={styles.botonMostrarContrasena}
              >
                <Ionicons
                  name={mostrarConfirmarContrasena ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colores.textoSecundario}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.textoError}>{error}</Text> : null}

            {/* Beneficios */}
            <View style={styles.contenedorBeneficios}>
              <View style={styles.itemBeneficio}>
                <Ionicons name="checkmark-circle" size={20} color={colores.primario} />
                <Text style={styles.textoBeneficio}>Acceso a todas las clases</Text>
              </View>
              <View style={styles.itemBeneficio}>
                <Ionicons name="checkmark-circle" size={20} color={colores.primario} />
                <Text style={styles.textoBeneficio}>Sistema de recompensas</Text>
              </View>
              <View style={styles.itemBeneficio}>
                <Ionicons name="checkmark-circle" size={20} color={colores.primario} />
                <Text style={styles.textoBeneficio}>Seguimiento de progreso</Text>
              </View>
              <View style={styles.itemBeneficio}>
                <Ionicons name="checkmark-circle" size={20} color={colores.primario} />
                <Text style={styles.textoBeneficio}>Comunidad exclusiva</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botonRegistro}
              onPress={manejarRegistro}
              disabled={registrando}
            >
              {registrando ? (
                <ActivityIndicator color={colores.fondo} />
              ) : (
                <Text style={styles.textoBotonRegistro}>CREAR CUENTA</Text>
              )}
            </TouchableOpacity>

            {/* Login */}
            <View style={styles.contenedorLogin}>
              <Text style={styles.textoLogin}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.enlaceLogin}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  vistaTeclado: {
    flex: 1,
  },
  contenedor: {
    flex: 1,
  },
  contenidoDesplazable: {
    flexGrow: 1,
    paddingVertical: espaciado.xxl,
  },
  contenedorEncabezado: {
    paddingHorizontal: espaciado.xl,
    marginBottom: espaciado.xxl,
  },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.lg,
  },
  contenedorLogo: {
    alignItems: 'center',
    marginBottom: espaciado.lg,
  },
  textoLogo: {
    fontSize: 28,
    fontWeight: '800',
    color: colores.textoPrincipal,
    letterSpacing: 3,
  },
  textoLogoSecundario: {
    fontSize: 28,
    fontWeight: '800',
    color: colores.primario,
    letterSpacing: 3,
    marginTop: -6,
  },
  eslogan: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
    letterSpacing: 1,
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
  contenedorBeneficios: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginBottom: espaciado.xl,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  itemBeneficio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.md,
    gap: espaciado.md,
  },
  textoBeneficio: {
    color: colores.textoSecundario,
    fontSize: tipografia.tamanos.md,
  },
  botonRegistro: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    alignItems: 'center',
    ...sombras.brillo,
  },
  textoBotonRegistro: {
    color: colores.fondo,
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    letterSpacing: 2,
  },
  contenedorLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: espaciado.xxl,
  },
  textoLogin: {
    color: colores.textoSecundario,
    fontSize: tipografia.tamanos.md,
  },
  enlaceLogin: {
    color: colores.primario,
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
  },
});
