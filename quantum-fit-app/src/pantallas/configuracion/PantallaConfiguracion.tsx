import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { EncabezadoPantalla } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type Props = PropsPantallaStackPrincipal<'Configuracion'>;

interface PropsItemConfiguracion {
  icono: keyof typeof Ionicons.glyphMap;
  etiqueta: string;
  alPresionar: () => void;
  color?: string;
}

function ItemConfiguracion({ icono, etiqueta, alPresionar, color }: PropsItemConfiguracion) {
  return (
    <TouchableOpacity style={styles.itemConfiguracion} onPress={alPresionar}>
      <View style={[styles.iconoConfiguracion, { backgroundColor: (color || colores.primario) + '20' }]}>
        <Ionicons name={icono} size={20} color={color || colores.primario} />
      </View>
      <Text style={styles.etiquetaConfiguracion}>{etiqueta}</Text>
      <Ionicons name="chevron-forward" size={20} color={colores.textoAtenuado} />
    </TouchableOpacity>
  );
}

export default function PantallaConfiguracion({ navigation }: Props) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla
        titulo="Configuración"
        alVolver={() => navigation.goBack()}
        style={{ paddingTop: espaciado.xxl, paddingBottom: espaciado.md, backgroundColor: colores.fondoSecundario }}
      />

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccionPerfil}>
          <View style={styles.avatar}>
            <Text style={styles.textoAvatar}>
              {usuario?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.nombrePerfil}>{usuario?.name}</Text>
          <Text style={styles.emailPerfil}>{usuario?.email}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>CUENTA</Text>
          <ItemConfiguracion
            icono="person-outline"
            etiqueta="Editar Perfil"
            color={colores.primario}
            alPresionar={() => navigation.navigate('MainTabs', { screen: 'Perfil' })}
          />
          <ItemConfiguracion
            icono="card-outline"
            etiqueta="Mi Suscripción"
            color={colores.secundario}
            alPresionar={() => navigation.navigate('MiSuscripcion')}
          />
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>PREFERENCIAS</Text>
          <ItemConfiguracion
            icono="notifications-outline"
            etiqueta="Notificaciones"
            color={colores.advertencia}
            alPresionar={() => navigation.navigate('Notificaciones')}
          />
          <ItemConfiguracion
            icono="lock-closed-outline"
            etiqueta="Privacidad"
            color={colores.informacion}
            alPresionar={() => Alert.alert(
              'Privacidad',
              'QuantumFit respeta tu privacidad. No compartimos tus datos personales con terceros sin tu consentimiento.\n\nPodés gestionar tus datos desde tu perfil o contactarnos en nodoetico@gmail.com.',
              [{ text: 'Entendido' }]
            )}
          />
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>SOPORTE</Text>
          <ItemConfiguracion
            icono="help-circle-outline"
            etiqueta="Ayuda"
            color={colores.puntos}
            alPresionar={() => Alert.alert(
              'Ayuda',
              'Si tenés alguna duda o problema con la app, escribinos a:\n\nnodoetico@gmail.com\n\nTe responderemos a la brevedad.',
              [{ text: 'Entendido' }]
            )}
          />
          <ItemConfiguracion
            icono="information-circle-outline"
            etiqueta="Acerca de"
            color={colores.textoAtenuado}
            alPresionar={() => Alert.alert(
              'QuantumFit',
              'Versión 1.0.0\n\nSistema de gestión de gimnasio con gamificación.\n\nDesarrollado por Nodo Etico.\n© 2026',
              [{ text: 'Entendido' }]
            )}
          />
        </View>

        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color={colores.error} />
          <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    paddingBottom: espaciado.xxxl,
  },
  seccionPerfil: {
    alignItems: 'center',
    paddingVertical: espaciado.xl,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    marginBottom: espaciado.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.primario + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  textoAvatar: {
    fontSize: 32,
    fontWeight: '700',
    color: colores.primario,
  },
  nombrePerfil: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  emailPerfil: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
    marginTop: espaciado.xs,
  },
  seccion: {
    marginBottom: espaciado.lg,
    paddingHorizontal: espaciado.xl,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '700',
    color: colores.textoAtenuado,
    letterSpacing: 1,
    marginBottom: espaciado.sm,
    marginLeft: espaciado.sm,
  },
  itemConfiguracion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginBottom: espaciado.sm,
    gap: espaciado.md,
  },
  iconoConfiguracion: {
    width: 36,
    height: 36,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etiquetaConfiguracion: {
    flex: 1,
    fontSize: tipografia.tamanos.md,
    fontWeight: '500',
    color: colores.textoPrincipal,
  },
  botonCerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    marginHorizontal: espaciado.xl,
    marginTop: espaciado.lg,
    padding: espaciado.lg,
    backgroundColor: colores.error + '15',
    borderRadius: radioBorde.lg,
    borderWidth: 1,
    borderColor: colores.error + '30',
  },
  textoCerrarSesion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.error,
  },
  version: {
    textAlign: 'center',
    color: colores.textoAtenuado,
    fontSize: tipografia.tamanos.xs,
    marginTop: espaciado.xl,
  },
});
