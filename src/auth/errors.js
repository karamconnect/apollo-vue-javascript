import { i18n } from '@/i18n';

/**
 * Translated message for a Better Auth error. Known error codes have a message under `auth.errors`
 * (INVALID_EMAIL_OR_PASSWORD -> auth.errors.invalidEmailOrPassword); anything else gets `fallback`
 * (an already translated text) or a generic "try again".
 */
export function authErrorMessage(error, fallback) {
    const { t, te } = i18n.global;
    const code = String(error?.code ?? '')
        .toLowerCase()
        .replace(/_(.)/g, (_, letter) => letter.toUpperCase());
    const key = `auth.errors.${code}`;

    if (code && te(key)) return t(key);

    return fallback ?? t('common.tryAgain');
}
