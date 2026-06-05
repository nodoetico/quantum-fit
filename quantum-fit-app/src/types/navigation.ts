import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Turnos: undefined;
  Beneficios: undefined;
  Ranking: undefined;
  Perfil: { tab?: 'stats' | 'achievements' | 'activity' } | undefined;
};

export interface PlanSummary {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: string;
  color: string;
  features: string[];
  popular?: boolean;
}

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Notificaciones: undefined;
  HistorialPremios: undefined;
  Configuracion: undefined;
  CheckIn: undefined;
  DatosCrystal: undefined;
  Membresia: undefined;
  Checkout: { plan: PlanSummary; paymentMethods: any[] };
  MiSuscripcion: undefined;
  HistorialPagos: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  StackScreenProps<MainStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    StackScreenProps<MainStackParamList>
  >;
