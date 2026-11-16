export default function Icon({ name, className = '', filled = false, style }) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={filled ? { fontVariationSettings: "'FILL' 1", ...style } : style}
        >
            {name}
        </span>
    );
}
