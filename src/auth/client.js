import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/vue';
import { mockAuthFetch } from './mock-server';

// Set VITE_AUTH_URL (e.g. https://api.example.com/api/auth) to talk to a real Better Auth server.
// Without it, requests are answered by the in-browser mock, which accepts any password.
const authURL = import.meta.env.VITE_AUTH_URL;

export const isMockAuth = !authURL;

export const authClient = createAuthClient({
    baseURL: authURL || `${window.location.origin}/api/auth`,
    fetchOptions: isMockAuth ? { customFetchImpl: mockAuthFetch } : {},
    // Server needs the matching emailOTP() plugin (verification codes after sign-up).
    plugins: [emailOTPClient()]
});
