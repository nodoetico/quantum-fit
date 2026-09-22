import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type Props = PropsPantallaStackPrincipal<'VinculacionMyFit'>;

export default function PantallaVinculacionMyFit({ navigation }: Props) {
  const {
    usuario,
    estadoVinculacionMyFit,
    perfilExterno,
    vinculandoMyFit,
    errorVinculacionMyFit,
    vincularMyFit,
    crearCuentaMyFit,
    desvincularMyFit,
    cargandoExterno,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [usarDni, setUsarDni] = useState(false);

  const ligado = !!estadoVinculacionMyFit?.linked || !!perfilExterno;

  useEffect(() => {
    if (!ligado && !email && usuario?.email) {
      setEmail(usuario.email);
    }
    if (!ligado && !dni && usuario?.dni) {
      setDni(usuario.dni);
    }
  }, [ligado, usuario?.email, usuario?.dni, email, dni]);

  const alVincular = async () => {
    const identificador = usarDni ? dni.trim() : email.trim();
    if (!identificador || !password) {
      Alert.alert('Campos incompletos', usarDni ? 'Ingresá tu DNI y contraseña de MyFit.' : 'Ingresá tu email y contraseña de MyFit.');
      return;
    }
    const ok = await vincularMyFit(identificador, password, usarDni);
    if (ok) {
      Alert.alert('Cuenta vinculada', 'Tu cuenta MyFit se vinculó correctamente.');
      setEmail('');
      setDni('');
      setPassword('');
    } else {
      Alert.alert('Error al vincular', errorVinculacionMyFit || 'No se pudo vincular la cuenta MyFit.');
    }
  };

  const alCrearCuenta = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos incompletos', 'Completá tu email y una contraseña para crear la cuenta.');
      return;
    }
    const ok = await crearCuentaMyFit(email.trim(), password);
    if (ok) {
      Alert.alert('Cuenta creada', 'Creamos tu cuenta del gimnasio y ya podés ver tus datos reales.');
      setEmail('');
      setPassword('');
    } else {
      Alert.alert('No se pudo crear', errorVinculacionMyFit || 'No se pudo crear la cuenta en el gimnasio.');
    }
  };

  const alDesvincular = () => {
    Alert.alert(
      'Desvincular cuenta MyFit',
      '¿Seguro que querés desvincular tu cuenta MyFit? Dejarás de ver tus datos reales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            await desvincularMyFit();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const iniciales = (nombre?: string) =>
    (nombre || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
        <View style={styles.contenedorTituloEncabezado}>
          <Ionicons name="link-outline" size={20} color={colores.primario} />
          <Text style={styles.tituloEncabezado}>Cuenta MyFit</Text>
        </View>
        <View style={styles.botonVolver} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <View style={styles.tarjetaIntro}>
            <Ionicons name="sync-outline" size={40} color={colores.primario} />
            <Text style={styles.tituloIntro}>Vinculá tu cuenta MyFit</Text>
            <Text style={styles.descripcionIntro}>
              Conectá tu cuenta del gimnasio (MyFit/Crystal) para ver tus datos reales: saldo,
              membresías, asistencias y vencimientos.
            </Text>
          </View>

          {ligado ? (
            <View style={styles.contenedorVinculado}>
              <View style={styles.tarjetaEstado}>
                <View style={[styles.iconoEstado, { backgroundColor: colores.secundario + '20' }]}>
                  <Ionicons name="checkmark-circle" size={40} color={colores.secundario} />
                </View>
                <Text style={styles.tituloVinculado}>Cuenta vinculada</Text>
                {perfilExterno?.name && (
                  <View style={styles.avatarPerfil}>
                    <Text style={styles.textoAvatarPerfil}>{iniciales(perfilExterno.name)}</Text>
                  </View>
                )}
                {perfilExterno?.name && (
                  <Text style={styles.nombrePerfil}>{perfilExterno.name}</Text>
                )}
                {perfilExterno?.email && (
                  <Text style={styles.emailPerfil}>{perfilExterno.email}</Text>
                )}
                <View style={styles.filaInfo}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.etiquetaInfo}>Membresías</Text>
                    <Text style={styles.valorInfo}>
                      {cargandoExterno ? '...' : (estadoVinculacionMyFit?.profile?.id !== undefined ? 'Sí' : '—')}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.boton, styles.botonDatos]}
                onPress={() => navigation.navigate('DatosCrystal')}
              >
                <Ionicons name="eye-outline" size={20} color={colores.primario} />
                <Text style={styles.textoBotonDatos}>Ver mis datos MyFit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.boton, styles.botonDesvincular]}
                onPress={alDesvincular}
                disabled={vinculandoMyFit}
              >
                <Ionicons name="unlink-outline" size={20} color={colores.error} />
                <Text style={styles.textoBotonDesvincular}>Desvincular cuenta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contenedorFormulario}>
              <View style={styles.campo}>
                <View style={styles.selectorModo}>
                  <TouchableOpacity
                    style={[styles.opcionModo, !usarDni && styles.opcionActiva]}
                    onPress={() => setUsarDni(false)}
                  >
                    <Ionicons name="mail-outline" size={18} color={!usarDni ? colores.primario : colores.textoAtenuado} />
                    <Text style={[styles.textoOpcion, !usarDni && styles.textoOpcionActiva]}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.opcionModo, usarDni && styles.opcionActiva]}
                    onPress={() => setUsarDni(true)}
                  >
                    <Ionicons name="id-card-outline" size={18} color={usarDni ? colores.primario : colores.textoAtenuado} />
                    <Text style={[styles.textoOpcion, usarDni && styles.textoOpcionActiva]}>DNI</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!usarDni ? (
                <View style={styles.campo}>
                  <Text style={styles.etiquetaCampo}>Email de MyFit</Text>
                  <View style={styles.contenedorInput}>
                    <Ionicons name="mail-outline" size={18} color={colores.textoAtenuado} />
                    <TextInput
                      style={styles.input}
                      placeholder="tu@email.com"
                      placeholderTextColor={colores.textoAtenuado}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.campo}>
                  <Text style={styles.etiquetaCampo}>DNI</Text>
                  <View style={styles.contenedorInput}>
                    <Ionicons name="id-card-outline" size={18} color={colores.textoAtenuado} />
                    <TextInput
                      style={styles.input}
                      placeholder="12345678"
                      placeholderTextColor={colores.textoAtenuado}
                      value={dni}
                      onChangeText={setDni}
                      autoCapitalize="none"
                      keyboardType="numeric"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              )}

              <View style={styles.campo}>
                <Text style={styles.etiquetaCampo}>Contraseña</Text>
                <View style={styles.contenedorInput}>
                  <Ionicons name="lock-closed-outline" size={18} color={colores.textoAtenuado} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colores.textoAtenuado}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!mostrarContrasena}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setMostrarContrasena((v) => !v)}>
                    <Ionicons
                      name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colores.textoAtenuado}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {errorVinculacionMyFit ? (
                <Text style={styles.textoError}>{errorVinculacionMyFit}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.boton, styles.botonVincular]}
                onPress={alVincular}
                disabled={vinculandoMyFit}
              >
                {vinculandoMyFit ? (
                  <ActivityIndicator color={colores.fondo} />
                ) : (
                  <>
                    <Ionicons name="link" size={20} color={colores.fondo} />
                    <Text style={styles.textoBotonVincular}>Vincular cuenta</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.separador}>
                <View style={styles.lineaSeparador} />
                <Text style={styles.textoSeparador}>o</Text>
                <View style={styles.lineaSeparador} />
              </View>

              <TouchableOpacity
                style={[styles.boton, styles.botonCrear]}
                onPress={alCrearCuenta}
                disabled={vinculandoMyFit}
              >
                <Ionicons name="person-add-outline" size={20} color={colores.secundario} />
                <Text style={styles.textoBotonCrear}>No tengo cuenta en el gimnasio</Text>
              </TouchableOpacity>

              <Text style={styles.notaCrear}>
                Si nunca usaste la app del gimnasio, creamos tu cuenta en el sistema del gimnasio
                con tu nombre, DNI y el email de arriba. La contraseña que cargaste queda como la
                contraseña del gimnasio.
              </Text>

              <Text style={styles.notaPrivacidad}>
                Tu contraseña se envía cifrada al servidor y solo se usa para comunicarte con tu
                gimnasio. No la compartimos con terceros.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.xxl,
    paddingBottom: espaciado.md,
    backgroundColor: colores.fondoSecundario,
  },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorTituloEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  tituloEncabezado: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  contenido: {
    padding: espaciado.xl,
    paddingBottom: espaciado.xxxl,
  },
  tarjetaIntro: {
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.xl,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.xl,
  },
  tituloIntro: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginTop: espaciado.md,
  },
  descripcionIntro: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
    marginTop: espaciado.sm,
    lineHeight: 20,
  },
  contenedorFormulario: {
    gap: espaciado.md,
  },
  campo: {
    gap: espaciado.xs,
  },
  etiquetaCampo: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
    marginLeft: espaciado.xs,
  },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingHorizontal: espaciado.lg,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: tipografia.tamanos.md,
    color: colores.textoPrincipal,
  },
  textoError: {
    fontSize: tipografia.tamanos.sm,
    color: colores.error,
    marginLeft: espaciado.xs,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    padding: espaciado.lg,
    borderRadius: radioBorde.lg,
    marginTop: espaciado.sm,
  },
  botonVincular: {
    backgroundColor: colores.primario,
  },
  textoBotonVincular: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    marginVertical: espaciado.md,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: colores.borde,
  },
  textoSeparador: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
    textTransform: 'uppercase',
  },
  botonCrear: {
    backgroundColor: colores.secundario + '15',
    borderWidth: 1,
    borderColor: colores.secundario,
  },
  textoBotonCrear: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.secundario,
  },
  notaCrear: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: espaciado.lg,
  },
  notaPrivacidad: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  contenedorVinculado: {
    gap: espaciado.md,
  },
  tarjetaEstado: {
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.xl,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  iconoEstado: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  tituloVinculado: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.secundario,
    marginBottom: espaciado.md,
  },
  avatarPerfil: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
    borderWidth: 2,
    borderColor: colores.primario,
  },
  textoAvatarPerfil: {
    fontSize: 28,
    fontWeight: '700',
    color: colores.primario,
  },
  nombrePerfil: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  emailPerfil: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginTop: espaciado.xs,
    marginBottom: espaciado.md,
  },
  filaInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingTop: espaciado.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  itemInfo: {
    alignItems: 'center',
  },
  etiquetaInfo: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  valorInfo: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  botonDatos: {
    backgroundColor: colores.primario + '15',
    borderWidth: 1,
    borderColor: colores.primario,
  },
  textoBotonDatos: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.primario,
  },
  botonDesvincular: {
    backgroundColor: colores.error + '15',
    borderWidth: 1,
    borderColor: colores.error + '30',
  },
  textoBotonDesvincular: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.error,
  },
  selectorModo: {
    flexDirection: 'row',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  opcionModo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.xs,
    paddingVertical: espaciado.md,
  },
  opcionActiva: {
    backgroundColor: colores.primario + '15',
  },
  textoOpcion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoOpcionActiva: {
    color: colores.primario,
  },
});
