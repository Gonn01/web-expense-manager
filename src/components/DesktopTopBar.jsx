import NotificationsBell from './notifications/NotificationsBell';

export default function DesktopTopBar() {
    return (
        <header className="flex h-12 shrink-0 items-center justify-end border-b border-black/10 bg-white/50 px-5 dark:border-white/10 dark:bg-background-dark">
            <NotificationsBell />
        </header>
    );
}
