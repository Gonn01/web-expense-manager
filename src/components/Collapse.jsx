export default function Collapse({ open, children }) {
    return (
        <div
            className={`grid transition-[grid-template-rows] duration-300 ease-snappy motion-reduce:transition-none ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
            inert={!open}
        >
            <div className="min-h-0 overflow-hidden">{children}</div>
        </div>
    );
}
