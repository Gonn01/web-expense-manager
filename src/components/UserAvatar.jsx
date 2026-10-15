import { useState } from 'react';

function getInitials(name) {
    return (
        (name ?? '')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? '')
            .join('') || '?'
    );
}

/**
 * Foto de perfil del usuario. Si no hay URL o la imagen falla al cargar
 * (p. ej. una URL de Google vencida), muestra las iniciales del nombre.
 */
export default function UserAvatar({ src, name, className = 'size-10 text-sm' }) {
    const [failedSrc, setFailedSrc] = useState(null);
    const base = `rounded-full shrink-0 ${className}`;

    if (src && failedSrc !== src) {
        return (
            <img
                src={src}
                alt={name ? `Foto de perfil de ${name}` : 'Foto de perfil'}
                referrerPolicy="no-referrer"
                onError={() => setFailedSrc(src)}
                className={`${base} object-cover`}
            />
        );
    }

    return (
        <div
            role="img"
            aria-label={name ? `Avatar de ${name}` : 'Avatar'}
            className={`${base} flex items-center justify-center bg-primary/15 text-primary font-bold`}
        >
            {getInitials(name)}
        </div>
    );
}
