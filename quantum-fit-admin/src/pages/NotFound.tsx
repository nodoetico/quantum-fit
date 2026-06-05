import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Página no encontrada</h2>
        <p className="text-dark-400 mb-8">
          La página que estás buscando no existe o fue movida.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all"
        >
          ← Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
