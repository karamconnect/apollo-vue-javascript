import { PASSWORD_ERRORS } from '@/views/settings/password-schema';
import { describe, expect, it } from 'vitest';
import { AUTH_ERRORS, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../schemas';

function issues(schema, data) {
    const result = schema.safeParse(data);

    return result.success ? [] : result.error.issues.map((issue) => [issue.path.join('.'), issue.message]);
}

const validRegistration = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret-123', confirmPassword: 'secret-123', terms: true };

describe('loginSchema', () => {
    it('accepts an email and any non-empty password, trimming the email', () => {
        expect(loginSchema.parse({ email: ' ada@example.com ', password: ' x ', rememberMe: false })).toEqual({ email: 'ada@example.com', password: ' x ', rememberMe: false });
    });

    it('requires a valid email and a password', () => {
        expect(issues(loginSchema, { email: 'nope', password: '', rememberMe: true })).toEqual([
            ['email', AUTH_ERRORS.email],
            ['password', AUTH_ERRORS.passwordRequired]
        ]);
    });
});

describe('registerSchema', () => {
    it('accepts a complete registration', () => {
        expect(registerSchema.safeParse(validRegistration).success).toBe(true);
    });

    it('requires a name', () => {
        expect(issues(registerSchema, { ...validRegistration, name: '   ' })).toEqual([['name', AUTH_ERRORS.nameRequired]]);
    });

    it('requires at least 8 characters', () => {
        expect(issues(registerSchema, { ...validRegistration, password: 'short12', confirmPassword: 'short12' })).toEqual([['password', PASSWORD_ERRORS.tooShort]]);
    });

    it('requires matching passwords', () => {
        expect(issues(registerSchema, { ...validRegistration, confirmPassword: 'secret-124' })).toEqual([['confirmPassword', PASSWORD_ERRORS.mismatch]]);
    });

    it('requires the terms to be accepted', () => {
        expect(issues(registerSchema, { ...validRegistration, terms: false })).toEqual([['terms', AUTH_ERRORS.terms]]);
    });

    // Regression: z.literal(true) for terms aborted parsing and hid the mismatch error.
    it('still reports a password mismatch when the terms are not accepted', () => {
        expect(issues(registerSchema, { ...validRegistration, password: 'short', confirmPassword: 'shorty', terms: false })).toEqual([
            ['password', PASSWORD_ERRORS.tooShort],
            ['terms', AUTH_ERRORS.terms],
            ['confirmPassword', PASSWORD_ERRORS.mismatch]
        ]);
    });
});

describe('forgotPasswordSchema', () => {
    it('requires a valid email', () => {
        expect(forgotPasswordSchema.safeParse({ email: 'ada@example.com' }).success).toBe(true);
        expect(issues(forgotPasswordSchema, { email: '' })).toEqual([['email', AUTH_ERRORS.email]]);
    });
});

describe('resetPasswordSchema', () => {
    it('accepts matching passwords of 8+ characters', () => {
        expect(resetPasswordSchema.safeParse({ password: 'secret-123', confirmPassword: 'secret-123' }).success).toBe(true);
    });

    it('reports a short and mismatched password together', () => {
        expect(issues(resetPasswordSchema, { password: 'abc', confirmPassword: 'abd' })).toEqual([
            ['password', PASSWORD_ERRORS.tooShort],
            ['confirmPassword', PASSWORD_ERRORS.mismatch]
        ]);
    });
});
