import { t } from '@/i18n';

export const ONBOARDING_STEPS = Object.freeze([
    {
        icon: 'account_balance_wallet',
        title: t('onboarding.hiWelcomeToExpenseManager'),
        text: t('onboarding.yourInstallmentsClearAndInOnePlace'),
    },
    {
        icon: 'receipt_long',
        title: t('onboarding.addYourExpenses'),
        text: t('onboarding.logWhatYouBoughtInInstallmentsYour'),
    },
    {
        icon: 'monitoring',
        title: t('onboarding.knowWhatYouOwe'),
        text: t('onboarding.seeWhatYouOweTodayTheTotal'),
    },
    {
        icon: 'group',
        title: t('onboarding.peopleAndSharedExpenses'),
        text: t('onboarding.addARelativeOrAFriendAnd'),
    },
    {
        icon: 'event_repeat',
        title: t('onboarding.postponeWithoutLosingTrack'),
        text: t('onboarding.canTMakeItThisMonthPostpone'),
    },
]);
