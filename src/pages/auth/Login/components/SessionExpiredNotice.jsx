import Icon from '@/components/Icon';

export default function SessionExpiredNotice() {
    return (
        <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100"
        >
            <Icon name="schedule" className="text-amber-300" />
            <div>
                <p className="font-semibold">Tu sesión venció</p>
                <p className="text-amber-100/80">Volvé a iniciar sesión para continuar.</p>
            </div>
        </div>
    );
}
