// PrivateRoute: componente que protege rutas que requieren login
// Si el usuario no está autenticado lo manda a /login
// Si el usuario está logueado pero no tiene el rol requerido lo manda a /unauthorized

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: array de roles permitidos (opcional)
// Si no se pasa "roles", cualquier usuario autenticado puede acceder
export default function PrivateRoute({ children, roles }) {
    const { isAuthenticated, user } = useAuth();

    // Sin token = sin acceso, mandamos al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si se especificaron roles y el usuario no tiene ninguno de ellos: 403
    if (roles && !roles.includes(user?.rol)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Todo bien, renderizamos el contenido protegido
    return children;
}
