import { create } from 'zustand';
import { login, loginWithFirebase } from '../services/api';

const getStoredAuthData = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken || null,
    };
};

const useAuth = create((set) => ({
    ...getStoredAuthData(),
    loading: false,
    error: null,

    login: async (formData) => {
        set({ loading: true, error: null });
        try {
            const response = await login(formData);

            const { user, token } = response;

            set({ user, token, loading: false });

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            return user;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    loginWithFirebase: async (firebaseData) => {
        set({ loading: true, error: null });
        try {
            const response = await loginWithFirebase(firebaseData);

            const { user, token } = response;

            set({ user, token, loading: false });

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            return user;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    logout: () => {
        set({ user: null, token: null, error: null });

        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    replaceToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
    },

    updateUser: (partial) =>
        set((state) => {
            const newUser = { ...(state.user || {}), ...partial };
            localStorage.setItem('user', JSON.stringify(newUser));
            return { user: newUser };
        }),
}));

export default useAuth;
