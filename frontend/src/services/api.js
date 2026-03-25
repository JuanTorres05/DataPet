// Instancia de Axios configurada para comunicarse con el backend
// En vez de usar fetch() en cada componente, centralizamos las peticiones acá

import axios from 'axios';

// La URL base viene de las variables de entorno de Vite
// En .env.local: VITE_API_URL=http://localhost:3000/api
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor de peticiones: antes de enviar cualquier request
// revisa si hay un token guardado y lo adjunta al header automáticamente
// Así no tenemos que acordarnos de ponerlo en cada llamada
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('datavet_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuestas: si el backend devuelve 401 (token vencido o inválido)
// limpiamos la sesión local y mandamos al usuario al login
// Esto maneja el caso de "la sesión se venció mientras trabajabas"
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('datavet_token');
            localStorage.removeItem('datavet_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
