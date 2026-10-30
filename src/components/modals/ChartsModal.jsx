import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import CuotasChart from '@/components/CuotasChart';
import MontoChart from '@/components/MontoChart';
import CategoriaChart from '@/components/CategoriaChart';

export default function ChartsModal({ gastos, onClose }) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60" onMouseDown={onClose} />
            <div className="relative z-10 w-[92vw] max-w-4xl max-h-[90dvh] overflow-y-auto rounded-2xl shadow-xl bg-white dark:bg-[#111714] border border-slate-200 dark:border-[#29382f]">
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-[#29382f] px-4 sm:px-6 py-4 bg-white dark:bg-[#111714]">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <Icon name="bar_chart" className="text-primary" />
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                            Gráficos
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </header>
                <div className="p-3 sm:p-6 grid grid-cols-1 gap-4">
                    <CuotasChart gastos={gastos} />
                    <MontoChart gastos={gastos} />
                    <CategoriaChart gastos={gastos} />
                </div>
            </div>
        </div>,
        document.body,
    );
}
