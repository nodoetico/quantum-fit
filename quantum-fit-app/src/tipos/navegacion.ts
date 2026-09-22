// Tipos de navegación de QUANTUM FIT
// IMPORTANTE: los nombres de las rutas (Login, Dashboard, Turnos, etc.) se
// mantienen igual porque se usan en los deep links y en navigation.navigate().
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type ListaParametrosStackAuth = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type ListaParametrosTabsPrincipales = {
  Dashboard: undefined;
  Turnos: undefined;
  Beneficios: undefined;
  Ranking: undefined;
  Perfil: { seccion?: 'estadisticas' | 'logros' | 'actividad' } | undefined;
};

export interface ResumenPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: string;
  color: string;
  features: string[];
  popular?: boolean;
}

export type ListaParametrosStackPrincipal = {
  MainTabs: NavigatorScreenParams<ListaParametrosTabsPrincipales>;
  Notificaciones: undefined;
  HistorialPremios: undefined;
  Configuracion: undefined;
  CheckIn: undefined;
  DatosCrystal: undefined;
  VinculacionMyFit: undefined;
  Membresia: undefined;
  Checkout: { plan: ResumenPlan; metodosPago: any[] };
  MiSuscripcion: undefined;
  HistorialPagos: undefined;
};

export type PropsPantallaAuth<T extends keyof ListaParametrosStackAuth> =
  StackScreenProps<ListaParametrosStackAuth, T>;

export type PropsPantallaStackPrincipal<T extends keyof ListaParametrosStackPrincipal> =
  StackScreenProps<ListaParametrosStackPrincipal, T>;

export type PropsPantallaTabPrincipal<T extends keyof ListaParametrosTabsPrincipales> =
  CompositeScreenProps<
    BottomTabScreenProps<ListaParametrosTabsPrincipales, T>,
    StackScreenProps<ListaParametrosStackPrincipal>
  >;
