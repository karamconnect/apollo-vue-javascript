// Stand-in for a Better Auth server, plugged into the client via `customFetchImpl`.
// It answers the endpoints the app uses with Better Auth's response shapes (core + the
// emailOTP plugin), accepts any password and any 6-digit code, and keeps users + the current
// session in localStorage. Passwords are never stored. Emails aren't sent: reset links and
// verification codes are logged to the console. Users whose email starts with `admin@` get the
// `admin` role (as with the admin plugin); everyone else is `user`.
// Remove it (see `client.js`) once a real server is available.

export const MOCK_STORAGE_KEY = 'app.auth.mock';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // Better Auth's default session.expiresIn
const SHORT_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // rememberMe: false
const OTP_PATTERN = /^\d{6}$/; // emailOTP plugin default: 6 digits

function loadState() {
    try {
        const stored = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY));
        if (stored && typeof stored === 'object') return { users: stored.users ?? {}, session: stored.session ?? null };
    } catch {
        // ignore malformed storage
    }

    return { users: {}, session: null };
}

function saveState(state) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function error(status, code, message) {
    return json({ code, message }, status);
}

function nameFromEmail(email) {
    return email.split('@')[0];
}

function createUser(email, name) {
    const now = new Date().toISOString();

    const role = email.startsWith('admin@') ? 'admin' : 'user';

    return { id: crypto.randomUUID(), name: name || nameFromEmail(email), email, emailVerified: false, image: null, role, createdAt: now, updatedAt: now };
}

function sendVerificationCode(email) {
    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

    console.info(`[mock auth] Verification code for ${email}: ${code} (any 6-digit code is accepted)`);
}

function createSession(user, rememberMe = true) {
    const now = Date.now();

    return {
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        userId: user.id,
        expiresAt: new Date(now + (rememberMe ? SESSION_TTL_MS : SHORT_SESSION_TTL_MS)).toISOString(),
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
        ipAddress: null,
        userAgent: typeof navigator === 'undefined' ? null : navigator.userAgent
    };
}

function currentUser(state) {
    const { session } = state;
    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null;

    return Object.values(state.users).find((user) => user.id === session.userId) ?? null;
}

function normalizeEmail(email) {
    return String(email ?? '')
        .trim()
        .toLowerCase();
}

const handlers = {
    'GET /get-session'(state) {
        const user = currentUser(state);

        return json(user ? { session: state.session, user } : null);
    },

    'POST /sign-up/email'(state, body) {
        const email = normalizeEmail(body.email);
        if (!email) return error(400, 'INVALID_EMAIL', 'Invalid email');
        if (state.users[email]) return error(422, 'USER_ALREADY_EXISTS', 'User already exists. Use another email.');

        const user = createUser(email, body.name);
        state.users[email] = user;
        state.session = createSession(user, body.rememberMe ?? true);
        saveState(state);
        sendVerificationCode(email); // emailOTP({ sendVerificationOnSignUp: true })

        return json({ token: state.session.token, user });
    },

    // Any password works. Unknown emails get an account on the fly.
    'POST /sign-in/email'(state, body) {
        const email = normalizeEmail(body.email);
        if (!email || !body.password) return error(401, 'INVALID_EMAIL_OR_PASSWORD', 'Invalid email or password');

        const user = state.users[email] ?? (state.users[email] = createUser(email));
        state.session = createSession(user, body.rememberMe ?? true);
        saveState(state);

        return json({ redirect: false, token: state.session.token, url: undefined, user });
    },

    'POST /sign-out'(state) {
        state.session = null;
        saveState(state);

        return json({ success: true });
    },

    'POST /request-password-reset'(state, body) {
        const token = crypto.randomUUID();
        const url = new URL(body.redirectTo || '/auth/reset-password', window.location.origin);
        url.searchParams.set('token', token);

        // No email is sent; the link is logged so the flow can be tried in development.
        console.info(`[mock auth] Password reset link for ${normalizeEmail(body.email)}: ${url}`);

        return json({ status: true, message: 'If this email exists in our system, check your email for the reset link' });
    },

    'POST /reset-password'(state, body) {
        if (!body.token) return error(400, 'INVALID_TOKEN', 'Invalid token');

        return json({ status: true });
    },

    'POST /change-password'(state) {
        const user = currentUser(state);
        if (!user) return error(401, 'UNAUTHORIZED', 'Unauthorized');

        return json({ token: null, user });
    },

    'POST /update-user'(state, body) {
        const user = currentUser(state);
        if (!user) return error(401, 'UNAUTHORIZED', 'Unauthorized');

        if (body.name !== undefined) user.name = body.name;
        if (body.image !== undefined) user.image = body.image;
        user.updatedAt = new Date().toISOString();
        saveState(state);

        return json({ status: true });
    },

    'POST /email-otp/send-verification-otp'(state, body) {
        const email = normalizeEmail(body.email);
        if (!email) return error(400, 'INVALID_EMAIL', 'Invalid email');

        sendVerificationCode(email);

        return json({ success: true });
    },

    'POST /email-otp/verify-email'(state, body) {
        const user = state.users[normalizeEmail(body.email)];
        if (!OTP_PATTERN.test(String(body.otp ?? ''))) return error(400, 'INVALID_OTP', 'Invalid OTP');
        if (!user) return error(400, 'USER_NOT_FOUND', 'User not found');

        user.emailVerified = true;
        user.updatedAt = new Date().toISOString();
        saveState(state);

        return json({ status: true, token: null, user });
    },

    'POST /delete-user'(state) {
        const user = currentUser(state);
        if (!user) return error(401, 'UNAUTHORIZED', 'Unauthorized');

        delete state.users[user.email];
        state.session = null;
        saveState(state);

        return json({ success: true, message: 'User deleted' });
    }
};

/** A `fetch` replacement that answers Better Auth client requests locally. */
export async function mockAuthFetch(input, init = {}) {
    const request = input instanceof Request ? input : null;
    const url = new URL(request ? request.url : String(input), window.location.origin);
    const method = (init.method ?? request?.method ?? 'GET').toUpperCase();
    const path = url.pathname.replace(/^.*\/api\/auth/, '');
    const handler = handlers[`${method} ${path}`];

    if (!handler) return error(404, 'NOT_FOUND', `Mock auth server has no handler for ${method} ${path}`);

    const rawBody = init.body ?? (request ? await request.text() : undefined);
    let body = {};

    try {
        body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
        return error(400, 'INVALID_BODY', 'Invalid JSON body');
    }

    return handler(loadState(), body);
}
