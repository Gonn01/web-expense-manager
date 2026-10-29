export default function AdjuntosSection({ adjuntos, onSeleccionAdjuntos }) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Archivos Adjuntos</h2>

                <label className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-[#29382f] text-sm font-bold hover:bg-opacity-80 transition-all flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Subir archivo
                    <input type="file" multiple className="hidden" onChange={onSeleccionAdjuntos} />
                </label>
            </div>

            {adjuntos.length === 0 && (
                <div className="text-sm text-slate-500 dark:text-[#9eb7a8]">Sin adjuntos.</div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {adjuntos.map((f, i) => (
                    <img
                        key={i}
                        alt={f.name}
                        className="aspect-square w-full rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        src={f.url}
                    />
                ))}

                <div className="aspect-square w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-gray-700 grid place-content-center text-center p-4">
                    <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-gray-600">
                        add_photo_alternate
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Añadir más</p>
                </div>
            </div>
        </section>
    );
}
