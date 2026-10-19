import { watch } from 'vue';

export const APP_NAME = 'Apollo';

/**
 * Browser tab title for a route, most specific part first: "Profile – Settings · Apollo".
 * Uses `meta.title` (one message key) or else `meta.breadcrumb` (message keys).
 */
export function pageTitle(route, t) {
    const keys = route.meta.title ? [route.meta.title] : (route.meta.breadcrumb ?? []);
    const parts = [...keys].reverse().map((key) => t(key));

    return parts.length ? `${parts.join(' – ')} · ${APP_NAME}` : APP_NAME;
}

/** Keeps `document.title` on the current page, in the current language. */
export function installPageTitle(router, i18n) {
    const update = () => {
        document.title = pageTitle(router.currentRoute.value, i18n.global.t);
    };

    router.afterEach(update);
    watch(i18n.global.locale, update);
}
