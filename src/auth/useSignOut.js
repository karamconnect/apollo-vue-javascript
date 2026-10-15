import { useLockStore } from '@/stores/lock';
import { useRouter } from 'vue-router';
import { authClient } from './client';

/** Returns a function that ends the session, clears the lock screen and goes to the login page. */
export function useSignOut() {
    const router = useRouter();
    const lock = useLockStore();

    return async function signOut() {
        await authClient.signOut();
        lock.unlock();
        router.push({ name: 'login' });
    };
}
