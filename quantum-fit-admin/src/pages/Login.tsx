import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'reset' | 'done'>('email');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');
    setRecoveryLoading(true);
    try {
      await authService.forgotPassword(recoveryEmail);
      setRecoverySuccess('Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
      setRecoveryStep('done');
    } catch {
      setRecoveryError('Error al solicitar recuperación. Intentá de nuevo.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');
    setRecoveryLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setRecoverySuccess('Contraseña restablecida correctamente. Ya podés iniciar sesión.');
      setRecoveryStep('done');
    } catch {
      setRecoveryError('Token inválido o expirado. Solicitá uno nuevo.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const openRecovery = () => {
    setRecoveryStep('email');
    setRecoveryEmail('');
    setResetToken('');
    setNewPassword('');
    setRecoveryError('');
    setRecoverySuccess('');
    setShowRecovery(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-700 via-dark-600 to-dark-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efecto de fondo neón */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 glow-primary">
            <span className="text-4xl font-bold text-white">Q</span>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">
            QUANTUM FIT
          </h1>
          <p className="text-primary-400 text-lg">Panel de Administración</p>
        </div>

        {/* Form */}
        <div className="bg-dark-200/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-primary-500/30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/50 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="admin@quantumfit.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-dark-500 disabled:to-dark-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center glow-primary-hover"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={openRecovery}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors underline underline-offset-2">
              ¿Olvidaste tu contraseña? — Recuperala
            </button>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-dark-200/70 backdrop-blur-sm rounded-lg border border-primary-500/30">
          <p className="text-xs text-primary-300 text-center mb-2">🔑 Credenciales de prueba:</p>
          <code className="text-xs text-primary-400 block text-center font-semibold">
            admin@quantumfit.com / Admin123!
          </code>
        </div>
      </div>

      {/* Modal Recuperar Contraseña */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-dark-200 rounded-2xl border border-primary-500/30 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recuperar Contraseña</h2>
              <button type="button" onClick={() => setShowRecovery(false)}
                className="text-primary-400 hover:text-primary-300 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {recoveryError && (
              <div className="mb-4 p-3 bg-error/10 border border-error/50 rounded-lg text-error text-sm">{recoveryError}</div>
            )}
            {recoverySuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">{recoverySuccess}</div>
            )}

            {recoveryStep === 'email' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">Email registrado</label>
                  <input type="email" value={recoveryEmail} required
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <p className="text-xs text-primary-400">Recibirás un token por email para restablecer tu contraseña.</p>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowRecovery(false)}
                    className="flex-1 px-4 py-3 bg-dark-400 hover:bg-dark-300 text-white rounded-lg transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={recoveryLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg transition-all disabled:opacity-50">
                    {recoveryLoading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => { setRecoveryStep('reset'); setRecoveryError(''); setRecoverySuccess(''); }}
                    className="text-xs text-primary-500 hover:text-primary-400 underline underline-offset-2">
                    Ya tengo un token — restablecer ahora
                  </button>
                </div>
              </form>
            )}

            {recoveryStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">Token de recuperación</label>
                  <input type="text" value={resetToken} required
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Ingresá el token recibido por email"
                    className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">Nueva contraseña</label>
                  <input type="password" value={newPassword} required minLength={8}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
                    className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setRecoveryStep('email'); setRecoveryError(''); setRecoverySuccess(''); }}
                    className="flex-1 px-4 py-3 bg-dark-400 hover:bg-dark-300 text-white rounded-lg transition-all">
                    Volver
                  </button>
                  <button type="submit" disabled={recoveryLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg transition-all disabled:opacity-50">
                    {recoveryLoading ? 'Restableciendo...' : 'Restablecer'}
                  </button>
                </div>
              </form>
            )}

            {recoveryStep === 'done' && (
              <div className="text-center space-y-4">
                <button type="button" onClick={() => setShowRecovery(false)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg transition-all">
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
