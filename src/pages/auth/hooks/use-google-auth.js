import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/store/use-auth-store';
import { auth, googleProvider } from '../../../../firebase';
import { signInWithPopup } from 'firebase/auth';

export function useGoogleAuth() {
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const { loginWithFirebase } = useAuth();

    const googleAvailable = Boolean(auth);

    const loginGoogle = async () => {
        if (!googleAvailable) return;

        try {
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            await loginWithFirebase({
                firebaseId: user.uid,
                email: user.email,
                name: user.displayName,
                avatar: user.photoURL,
            });

            nav('/app/dashboard', { replace: true });
        } catch (err) {
            console.error('Error con Google Auth', err);
        } finally {
            setLoading(false);
        }
    };

    return { loginGoogle, loading, googleAvailable };
}
