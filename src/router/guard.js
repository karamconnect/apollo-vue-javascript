// Route meta (looked up through the matched records, so children inherit it):
// - `requiresAuth`: needs a session; signed-out users go to login with a `redirect` back.
// - `guestOnly`: login/register/…; signed-in users are sent home.
// - `roles`: array of user roles allowed in (implies `requiresAuth`); others see Access Denied.
// `getUser` resolves to the signed-in user or null. While the app is locked (`isLocked`),
// in-app navigation is blocked so the page under the lock screen keeps its state.
export function createAuthGuard({ getUser, isLocked = () => false }) {
    return async function authGuard(to, from) {
        // `from.matched` is empty on the initial navigation (e.g. a reload while locked).
        if (isLocked() && from?.matched.length) return false;

        const meta = (key) => to.matched.findLast((record) => record.meta[key] !== undefined)?.meta[key];
        const roles = meta('roles');
        const requiresAuth = Boolean(meta('requiresAuth') || roles);
        const guestOnly = Boolean(meta('guestOnly'));
        if (!requiresAuth && !guestOnly) return true;

        const user = await getUser();

        if (requiresAuth && !user) {
            return { name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } };
        }
        if (guestOnly && user) return { path: '/' };
        if (roles && !roles.includes(user.role)) return { name: 'access-denied', query: { from: to.fullPath } };

        return true;
    };
}

/** Only allow same-app paths as post-login redirects. */
export function safeRedirect(value) {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
