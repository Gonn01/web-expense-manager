export const ShareOutcome = Object.freeze({
    SHARED: 'shared',
    CANCELLED: 'cancelled',
    UNAVAILABLE: 'unavailable',
    ERROR: 'error',
});

export function canShareText(nav = globalThis.navigator, text = '') {
    if (!nav || typeof nav.share !== 'function') return false;
    if (typeof nav.canShare !== 'function') return true;
    try {
        return nav.canShare({ text }) === true;
    } catch {
        return false;
    }
}

export async function shareText(text, nav = globalThis.navigator) {
    if (!canShareText(nav, text)) return ShareOutcome.UNAVAILABLE;
    try {
        await nav.share({ text });
        return ShareOutcome.SHARED;
    } catch (err) {
        return err?.name === 'AbortError' ? ShareOutcome.CANCELLED : ShareOutcome.ERROR;
    }
}
