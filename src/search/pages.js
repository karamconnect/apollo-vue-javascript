import Fuse from 'fuse.js';

// Page search for the topbar. Routes opt in with `meta.search: { icon, keywords, title? }`;
// the title defaults to the breadcrumb ("Settings / Account"). Titles and breadcrumbs are i18n keys, passed through `translate`.
export const FUSE_OPTIONS = {
    keys: [
        { name: 'title', weight: 2 },
        { name: 'keywords', weight: 1 }
    ],
    threshold: 0.4, // 0 = exact, 1 = anything; 0.4 tolerates typos like "pasword"
    ignoreLocation: true // match anywhere in a keyword, not just near the start
};

export const MAX_RESULTS = 8;

/** Searchable pages from the router's records, hiding pages whose `meta.roles` exclude the user. */
export function buildPageIndex(routes, user, translate = (key) => key) {
    return routes
        .filter((route) => route.name && route.meta?.search)
        .filter((route) => !route.meta.roles || route.meta.roles.includes(user?.role))
        .map((route) => ({
            name: route.name,
            title: route.meta.search.title ? translate(route.meta.search.title) : (route.meta.breadcrumb?.map(translate).join(' / ') ?? String(route.name)),
            icon: route.meta.search.icon ?? 'pi pi-file',
            keywords: route.meta.search.keywords ?? []
        }));
}

/** Fuzzy-matches `query` against the index, best match first. */
export function searchPages(index, query) {
    return new Fuse(index, FUSE_OPTIONS).search(query, { limit: MAX_RESULTS }).map((result) => result.item);
}
