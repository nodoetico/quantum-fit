import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, checkInService, userService, bookingsService, externalPullService, paymentService, isAuthenticated as checkIsAuthenticated, getToken } from '../services/api';
import { websocketService } from '../services/websocket';
import { User, Booking, Achievement, ActivityLog, WeeklyStats, LocalSubscription } from '../types';

interface ExternalProfile {
  id: number;
  name: string;
  email: string;
  dni: string;
  balance: number;
  qr_code: string;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, dni: string) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  completeResetPassword: (token: string, password: string) => Promise<boolean>;
  isResetting: boolean;
  bookings: Booking[];
  achievements: Achievement[];
  activityLog: ActivityLog[];
  weeklyStats: WeeklyStats;
  refreshUser: () => Promise<void>;
  loadActivity: () => Promise<void>;
  loadUserAchievements: () => Promise<void>;
  loadUserBookings: () => Promise<void>;
  refreshAll: () => Promise<void>;
  checkIn: (type: 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER', validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE') => Promise<any>;
  externalProfile: ExternalProfile | null;
  externalAttendances: any[];
  externalMemberships: any[];
  loadExternalData: () => Promise<void>;
  isExternalLoading: boolean;
  subscription: LocalSubscription | null;
  loadSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    currentWeek: {
      year: new Date().getFullYear(),
      week: 1,
      weekStartDate: new Date(),
      weekEndDate: new Date(),
      workoutsCompleted: 0,
      classesAttended: 0,
      totalPoints: 0,
      totalCheckIns: 0,
      attendanceRate: 0,
      activeDays: 0,
      activeDaysBitmap: 0,
      isPerfectWeek: false,
    },
    previousWeeks: [],
    summary: {
      totalWeeks: 0,
      perfectWeeks: 0,
      totalWorkouts: 0,
      totalPoints: 0,
    },
  });
  const [isResetting, setIsResetting] = useState(false);
  const [externalProfile, setExternalProfile] = useState<ExternalProfile | null>(null);
  const [externalAttendances, setExternalAttendances] = useState<any[]>([]);
  const [externalMemberships, setExternalMemberships] = useState<any[]>([]);
  const [isExternalLoading, setIsExternalLoading] = useState(false);
  const [subscription, setSubscription] = useState<LocalSubscription | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      websocketService.connect(user.id);

      const unsubscribePoints = websocketService.onPointsUpdated((data) => {
        setUser(prev => prev ? { ...prev, points: data.newBalance } : prev);
      });

      const unsubscribeAchievements = websocketService.onAchievementUnlocked((data) => {
        loadUserAchievements();
      });

      const unsubscribeStreak = websocketService.onStreakUpdated((data) => {
        setUser(prev => prev ? { ...prev, currentStreak: data.current } : prev);
      });

      return () => {
        unsubscribePoints();
        unsubscribeAchievements();
        unsubscribeStreak();
        websocketService.disconnect();
      };
    }
  }, [user?.id]);

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const loadUser = async () => {
    try {
      const isAuth = await checkIsAuthenticated();
      
      if (isAuth) {
        const token = await getToken();
        if (token && isTokenExpired(token)) {
          await authService.logout();
          setIsLoading(false);
          return;
        }
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          loadActivity();
          loadUserAchievements();
          loadUserBookings();
          loadWeeklyStats();
          loadExternalData();
          loadSubscription();
        }
      }
    } catch (error) {
      console.error('loadUser failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const data = await userService.getActivityLog(20);
      setActivityLog((data?.logs || []).map((log: any) => ({
        ...log,
        date: log.date ? new Date(log.date) : new Date(),
      })));
    } catch (error) {
      console.error('loadActivity failed:', error);
    }
  };

  const loadUserAchievements = async () => {
    try {
      const data = await userService.getAchievements();
      setAchievements(data?.all || []);
    } catch (error) {
      console.error('loadUserAchievements failed:', error);
    }
  };

  const loadUserBookings = async () => {
    try {
      const data = await bookingsService.getMyBookings();
      setBookings(data || []);
    } catch (error) {
      console.error('loadUserBookings failed:', error);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      const data = await userService.getWeeklyStats();
      if (data) {
        setWeeklyStats(data);
      }
    } catch (error) {
      console.error('loadWeeklyStats failed:', error);
    }
  };

  const loadExternalData = async () => {
    try {
      setIsExternalLoading(true);
      const dni = user?.dni || undefined;
      const [profile, membershipsData, attendancesData] = await Promise.all([
        externalPullService.getProfile(dni).catch(() => null),
        externalPullService.getMemberships(dni).catch(() => null),
        externalPullService.getAttendances(dni).catch(() => null),
      ]);
      setExternalProfile(profile);
      setExternalMemberships(membershipsData?.data || []);
      setExternalAttendances(attendancesData?.data || []);
    } catch (error) {
      console.error('loadExternalData failed:', error);
    } finally {
      setIsExternalLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const sub = await paymentService.getMySubscription();
      setSubscription(sub);
      // Sincronizar isVip del usuario con la suscripción
      if (sub && sub.isVip !== user?.isVip) {
        setUser(prev => prev ? { ...prev, isVip: sub.isVip, vipSince: sub.vipSince } : prev);
      }
    } catch (error) {
      console.error('loadSubscription failed:', error);
    }
  };

  const [loginError, setLoginError] = useState<string>('');

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoginError('');
      const userData = await authService.login(email, password);
      setUser(userData);
      websocketService.connect(userData.id);
      loadActivity();
      loadUserAchievements();
      loadWeeklyStats();
      loadExternalData();
      loadSubscription();
      return true;
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK') {
        setLoginError('No se puede conectar al servidor. Verificá que:\n1. El backend esté corriendo\n2. El teléfono esté en la misma red WiFi\n3. La IP en .env sea correcta');
      } else if (error?.response?.status === 401) {
        setLoginError('Credenciales inválidas');
      } else if (error?.response?.data?.error) {
        setLoginError(error.response.data.error);
      } else {
        setLoginError('Error de conexión: ' + (error?.message || 'desconocido'));
      }
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, dni: string): Promise<string | null> => {
    try {
      const userData = await authService.register(name, email, password, dni);
      setUser(userData);
      websocketService.connect(userData.id);
      return null;
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Error al conectar con el servidor';
      console.error('Registration failed:', msg);
      return msg;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      websocketService.disconnect();
      setUser(null);
      setBookings([]);
      setAchievements([]);
      setActivityLog([]);
      setExternalProfile(null);
      setExternalAttendances([]);
      setExternalMemberships([]);
      setSubscription(null);
    } catch (error) {
      console.error('logout failed:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsResetting(true);
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  const completeResetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      setIsResetting(true);
      await authService.resetPassword(token, password);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('refreshUser failed:', error);
    }
  };

  const refreshAll = async () => {
    await refreshUser();
    await loadActivity();
    await loadUserAchievements();
    await loadWeeklyStats();
    await loadExternalData();
    await loadSubscription();
  };

  const checkIn = async (
    type: 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER',
    validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE'
  ) => {
    const result = await checkInService.createCheckIn(type, validationMethod);
    
    if (user) {
      setUser({
        ...user,
        points: result.newBalance,
        currentStreak: result.streak.current,
      });
    }
    
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginError,
        login,
        register,
        logout,
        resetPassword,
        completeResetPassword,
        isResetting,
        bookings,
        achievements,
        activityLog,
        weeklyStats,
        refreshUser,
        loadActivity,
        loadUserAchievements,
        loadUserBookings,
        refreshAll,
        checkIn,
        externalProfile,
        externalAttendances,
        externalMemberships,
        loadExternalData,
        isExternalLoading,
        subscription,
        loadSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
