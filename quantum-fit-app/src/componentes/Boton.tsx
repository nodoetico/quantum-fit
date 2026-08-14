import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, sombras, tipografia } from '../constantes/tema';

interface PropsBoton {
  titulo: string;
  onPress: () => void;
  variante?: 'principal' | 'secundario' | 'contorno' | 'fantasma' | 'gradiente';
  tamano?: 'pequena' | 'mediana' | 'grande';
  icono?: keyof typeof Ionicons.glyphMap;
  posicionIcono?: 'izquierda' | 'derecha';
  cargando?: boolean;
  deshabilitado?: boolean;
  anchoCompleto?: boolean;
  style?: ViewStyle;
  estiloTexto?: TextStyle;
}

export default function Boton({
  titulo,
  onPress,
  variante = 'principal',
  tamano = 'mediana',
  icono,
  posicionIcono = 'izquierda',
  cargando = false,
  deshabilitado = false,
  anchoCompleto = false,
  style,
  estiloTexto,
}: PropsBoton) {
  const estilosBoton = [
    styles.boton,
    styles[variante],
    styles[tamano],
    anchoCompleto && styles.anchoCompleto,
    deshabilitado && styles.deshabilitado,
    style,
  ];

  const estilosTexto = [
    styles.texto,
    variante !== 'gradiente' && styles[`texto${variante[0].toUpperCase()}${variante.slice(1)}`],
    styles[`texto${tamano[0].toUpperCase()}${tamano.slice(1)}`],
    deshabilitado && styles.textoDeshabilitado,
    estiloTexto,
  ];

  const renderizarContenido = () => {
    if (cargando) {
      return <ActivityIndicator color={variante === 'contorno' || variante === 'fantasma' ? colores.primario : colores.fondo} />;
    }

    return (
      <>
        {icono && posicionIcono === 'izquierda' && (
          <Ionicons
            name={icono}
            size={tamano === 'pequena' ? 16 : tamano === 'mediana' ? 20 : 24}
            color={variante === 'contorno' || variante === 'fantasma' ? colores.primario : colores.fondo}
            style={styles.icono}
          />
        )}
        <Text style={estilosTexto}>{titulo}</Text>
        {icono && posicionIcono === 'derecha' && (
          <Ionicons
            name={icono}
            size={tamano === 'pequena' ? 16 : tamano === 'mediana' ? 20 : 24}
            color={variante === 'contorno' || variante === 'fantasma' ? colores.primario : colores.fondo}
            style={styles.icono}
          />
        )}
      </>
    );
  };

  if (variante === 'gradiente') {
    return (
      <TouchableOpacity
        style={[anchoCompleto && styles.anchoCompleto]}
        onPress={onPress}
        disabled={deshabilitado || cargando}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colores.primario, colores.primarioOscuro]}
          style={[styles.boton, styles[tamano], style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderizarContenido()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={estilosBoton}
      onPress={onPress}
      disabled={deshabilitado || cargando}
      activeOpacity={0.8}
    >
      {renderizarContenido()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radioBorde.lg,
    ...sombras.mediana,
  },
  anchoCompleto: {
    width: '100%',
  },
  // Variantes
  principal: {
    backgroundColor: colores.primario,
    ...sombras.brillo,
  },
  secundario: {
    backgroundColor: colores.secundario,
  },
  contorno: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colores.primario,
  },
  fantasma: {
    backgroundColor: 'transparent',
  },
  gradiente: {
    // Se maneja por separado
  },
  // Tamaños
  pequena: {
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  mediana: {
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.xl,
  },
  grande: {
    paddingVertical: espaciado.lg,
    paddingHorizontal: espaciado.xxl,
  },
  // Deshabilitado
  deshabilitado: {
    opacity: 0.5,
  },
  // Texto
  texto: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  textoPrincipal: {
    color: colores.fondo,
  },
  textoSecundario: {
    color: colores.fondo,
  },
  textoContorno: {
    color: colores.primario,
  },
  textoFantasma: {
    color: colores.primario,
  },
  textoPequena: {
    fontSize: tipografia.tamanos.sm,
  },
  textoMediana: {
    fontSize: tipografia.tamanos.md,
  },
  textoGrande: {
    fontSize: tipografia.tamanos.lg,
  },
  textoDeshabilitado: {
    opacity: 0.7,
  },
  // Icono
  icono: {
    marginHorizontal: espaciado.sm,
  },
});
