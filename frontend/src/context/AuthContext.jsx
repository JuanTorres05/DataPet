// Context de autenticación
// Usamos React Context para que cualquier componente pueda saber si el usuario está logueado
// sin tener que pasar props por todos los niveles del árbol de componentes

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Claves para localStorage - así si los cambiamos lo hacemos en un solo lugar
const TOKEN_KEY = 'datavet_token';
const USER_KEY = 'datavet_user';

// AuthProvider: envuelve toda la app (ver App.jsx) y da acceso al estado de auth
export function AuthProvider({ children }) {
    // Iniciamos el estado leyendo de localStorage para que la sesión persista
    // aunque el usuario recargue la página
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            // Si el JSON está corrupto, empezamos sin sesión
            return null;
        }
    });

    // Función que se llama cuando el usuario hace login exitoso
    // Guarda el token y datos en localStorage Y en el estado de React
    const login = useCallback((newToken, newUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    // Función de logout: limpia todo
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            token,
            user,
            isAuthenticated: !!token, // true si hay token, false si no
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto más fácil
// En vez de useContext(AuthContext) escribimos useAuth()
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
