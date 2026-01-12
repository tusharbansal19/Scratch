import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
    email: string;
    full_name: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (token, user) => {
        Cookies.set('auth_token', token, { expires: 7 }); // 7 days
        localStorage.setItem('auth_user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        Cookies.remove('auth_token');
        localStorage.removeItem('auth_user');
        set({ token: null, user: null, isAuthenticated: false });
    },

    checkAuth: () => {
        const token = Cookies.get('auth_token');
        const userStr = localStorage.getItem('auth_user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ token, user, isAuthenticated: true, isLoading: false });
            } catch (e) {
                Cookies.remove('auth_token');
                localStorage.removeItem('auth_user');
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        } else {
            set({ isLoading: false, isAuthenticated: false });
        }
    }
}));
