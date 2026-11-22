import Snackbar from '@/components/Snackbar';
import { AparienciaCard } from './components/AparienciaCard';
import { IdiomaCard } from './components/IdiomaCard';
import { PasswordCard } from './components/PasswordCard';
import { PerfilCard } from './components/PerfilCard';
import { PreferenciasCard } from './components/PreferenciasCard';
import { SueldoCard } from './components/SueldoCard';
import { TutorialCard } from './components/TutorialCard';
import { useConfiguracionUI } from './hooks/use-configuracion-ui';
import { t } from '@/i18n';

export default function Configuracion() {
    const {
        user,
        preview,
        nombreVisible,

        moneda,
        setMoneda,
        loadingMoneda,
        onSaveMoneda,

        sueldo,
        setSueldo,
        sueldoMoneda,
        setSueldoMoneda,
        loadingSueldo,
        onSaveSueldo,

        hasPassword,
        loadingPassword,
        onSavePassword,

        themeMode,

        setThemeMode,

        languagePreference,
        onChangeLanguage,

        onOpenTutorial,

        snackbar,

        closeSnackbar,
    } = useConfiguracionUI();

    return (
        <div className="sm:p-2 lg:p-6 flex flex-col gap-6">
            {snackbar && (
                <Snackbar message={snackbar.message} type={snackbar.type} onClose={closeSnackbar} />
            )}

            <header>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {t('configuracion.accountSettings')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {t('configuracion.customizeYourDetailsAndBasicPreferences')}
                </p>
            </header>

            <section className="grid gap-6 md:grid-cols-2">
                <PerfilCard preview={preview} nombreVisible={nombreVisible} email={user?.email} />

                <PreferenciasCard
                    moneda={moneda}
                    setMoneda={setMoneda}
                    loading={loadingMoneda}
                    onSave={onSaveMoneda}
                />

                <PasswordCard
                    hasPassword={hasPassword}
                    loading={loadingPassword}
                    onSave={onSavePassword}
                />

                <AparienciaCard themeMode={themeMode} setThemeMode={setThemeMode} />

                <IdiomaCard
                    languagePreference={languagePreference}
                    onChangeLanguage={onChangeLanguage}
                />

                <SueldoCard
                    sueldo={sueldo}
                    setSueldo={setSueldo}
                    moneda={sueldoMoneda}
                    setMoneda={setSueldoMoneda}
                    loading={loadingSueldo}
                    onSave={onSaveSueldo}
                />

                <TutorialCard onOpenTutorial={onOpenTutorial} />
            </section>
        </div>
    );
}
