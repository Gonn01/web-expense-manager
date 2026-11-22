const REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

export function createFirebaseAuth(config = {}, { initializeApp, getAuth }) {
    const isConfigured = REQUIRED_FIELDS.every((field) => config[field]?.trim());

    if (!isConfigured) {
        console.warn(
            'Inicio con Google desactivado: faltan variables VITE_FIREBASE_* en el entorno.',
        );
        return null;
    }

    return getAuth(initializeApp(config));
}
