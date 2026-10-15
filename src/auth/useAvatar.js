import { computed } from 'vue';
import { authClient } from './client';

export const DEFAULT_AVATAR = '/demo/images/avatar/avatar.png';

/** The signed-in user's photo (Better Auth's `user.image`), or the placeholder avatar. */
export function useAvatar() {
    const session = authClient.useSession();

    return computed(() => session.value.data?.user.image || DEFAULT_AVATAR);
}
