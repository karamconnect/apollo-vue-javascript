import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_STORAGE_KEY, mockAuthFetch } from '../mock-server';

// Goes through the real Better Auth client, so request paths and response shapes are exercised end to end.
function createClient() {
    return createAuthClient({ baseURL: 'http://localhost/api/auth', fetchOptions: { customFetchImpl: mockAuthFetch }, plugins: [emailOTPClient()] });
}

describe('mock auth server', () => {
    let client;
    let info;

    beforeEach(() => {
        localStorage.clear();
        client = createClient();
        // The mock logs reset links and verification codes; keep test output quiet.
        info = vi.spyOn(console, 'info').mockImplementation(() => {});
    });

    afterEach(() => vi.restoreAllMocks());

    it('has no session to start with', async () => {
        const { data, error } = await client.getSession();

        expect(error).toBeNull();
        expect(data).toBeNull();
    });

    it('signs in with any password and creates the user on the fly', async () => {
        const { data, error } = await client.signIn.email({ email: 'Ada@Example.com ', password: 'anything' });

        expect(error).toBeNull();
        expect(data.user).toMatchObject({ email: 'ada@example.com', name: 'ada', emailVerified: false });
        expect(data.token).toEqual(expect.any(String));

        const session = await client.getSession();
        expect(session.data.user.email).toBe('ada@example.com');
        expect(session.data.session.userId).toBe(data.user.id);
    });

    it('rejects a sign-in without a password', async () => {
        const { data, error } = await client.signIn.email({ email: 'ada@example.com', password: '' });

        expect(data).toBeNull();
        expect(error).toMatchObject({ status: 401, code: 'INVALID_EMAIL_OR_PASSWORD' });
    });

    it('signs up, keeping the given name, and starts a session', async () => {
        const { data } = await client.signUp.email({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret-123' });

        expect(data.user.name).toBe('Ada Lovelace');
        expect((await client.getSession()).data.user.id).toBe(data.user.id);
    });

    it('refuses to sign up the same email twice', async () => {
        await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'secret-123' });
        const { error } = await client.signUp.email({ name: 'Ada', email: 'ADA@example.com', password: 'secret-123' });

        expect(error).toMatchObject({ status: 422, code: 'USER_ALREADY_EXISTS' });
    });

    it('signs out', async () => {
        await client.signIn.email({ email: 'ada@example.com', password: 'x' });
        const { data } = await client.signOut();

        expect(data).toEqual({ success: true });
        expect((await client.getSession()).data).toBeNull();
    });

    it('ignores an expired session', async () => {
        await client.signIn.email({ email: 'ada@example.com', password: 'x' });
        const state = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY));
        state.session.expiresAt = new Date(Date.now() - 1000).toISOString();
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));

        expect((await client.getSession()).data).toBeNull();
    });

    it('gives a shorter session when rememberMe is off', async () => {
        await client.signIn.email({ email: 'ada@example.com', password: 'x', rememberMe: false });
        const { session } = (await client.getSession()).data;

        expect(new Date(session.expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });

    it('never stores passwords', async () => {
        await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'super-secret-pw' });
        await client.signIn.email({ email: 'ada@example.com', password: 'another-secret' });

        expect(localStorage.getItem(MOCK_STORAGE_KEY)).not.toMatch(/secret/);
    });

    it('logs a reset link and accepts any reset token', async () => {
        const request = await client.requestPasswordReset({ email: 'ada@example.com', redirectTo: 'http://localhost/auth/reset-password' });
        expect(request.data.status).toBe(true);
        expect(info).toHaveBeenCalledWith(expect.stringMatching(/http:\/\/localhost\/auth\/reset-password\?token=/));

        const reset = await client.resetPassword({ newPassword: 'new-secret-1', token: 'abc' });
        expect(reset.data).toEqual({ status: true });
    });

    it('changes the password only when signed in', async () => {
        expect((await client.changePassword({ currentPassword: 'a', newPassword: 'b'.repeat(8) })).error.status).toBe(401);

        await client.signIn.email({ email: 'ada@example.com', password: 'x' });
        const { data, error } = await client.changePassword({ currentPassword: 'a', newPassword: 'b'.repeat(8) });

        expect(error).toBeNull();
        expect(data.user.email).toBe('ada@example.com');
    });

    it('deletes the user and ends the session', async () => {
        await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'secret-123' });
        const { data } = await client.deleteUser();

        expect(data.success).toBe(true);
        expect((await client.getSession()).data).toBeNull();
        expect((await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'secret-123' })).error).toBeNull();
    });

    it('gives admin@ users the admin role and everyone else the user role', async () => {
        expect((await client.signIn.email({ email: 'admin@example.com', password: 'x' })).data.user.role).toBe('admin');
        expect((await client.signIn.email({ email: 'ada@example.com', password: 'x' })).data.user.role).toBe('user');
    });

    describe('email OTP', () => {
        it('sends a code on sign-up', async () => {
            await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'secret-123' });

            expect(info).toHaveBeenCalledWith(expect.stringMatching(/Verification code for ada@example\.com: \d{6}/));
        });

        it('resends a code on request', async () => {
            const { data } = await client.emailOtp.sendVerificationOtp({ email: 'ada@example.com', type: 'email-verification' });

            expect(data).toEqual({ success: true });
            expect(info).toHaveBeenCalledTimes(1);
        });

        it('verifies the email with any 6-digit code and refreshes the session user', async () => {
            await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'secret-123' });
            const { data, error } = await client.emailOtp.verifyEmail({ email: 'ada@example.com', otp: '123456' });

            expect(error).toBeNull();
            expect(data.user.emailVerified).toBe(true);
            expect((await client.getSession()).data.user.emailVerified).toBe(true);
        });

        it.each(['12345', '1234567', 'abcdef', ''])('rejects the code %j', async (otp) => {
            await client.signUp.email({ name: 'Ada', email: 'ada@example.com', password: 'secret-123' });
            const { error } = await client.emailOtp.verifyEmail({ email: 'ada@example.com', otp });

            expect(error).toMatchObject({ status: 400, code: 'INVALID_OTP' });
        });
    });

    it('answers unknown endpoints with 404', async () => {
        const { error } = await client.$fetch('/list-sessions');

        expect(error.status).toBe(404);
    });
});
