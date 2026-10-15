import { authClient } from '@/auth/client';
import { useFuse } from '@vueuse/integrations/useFuse';
import { computed, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { buildPageIndex, FUSE_OPTIONS, MAX_RESULTS } from './pages';

/** Reactive fuzzy page search: set `query`, read `results` (see ./pages.js for the index). */
export function usePageSearch() {
    const router = useRouter();
    const session = authClient.useSession();
    const { t } = useI18n();

    const query = shallowRef('');
    const index = computed(() => buildPageIndex(router.getRoutes(), session.value.data?.user, t));
    const { results } = useFuse(query, index, { fuseOptions: FUSE_OPTIONS, resultLimit: MAX_RESULTS });

    return { query, results: computed(() => results.value.map((result) => result.item)) };
}
