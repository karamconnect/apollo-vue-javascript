import { MIN_PASSWORD_LENGTH, PASSWORD_ERRORS } from '@/views/settings/password-schema';
import { z } from 'zod';

export const AUTH_ERRORS = {
    email: 'Enter a valid email address.',
    passwordRequired: 'Enter your password.',
    nameRequired: 'Enter your name.',
    terms: 'Accept the terms to continue.'
};

const email = z.string().trim().pipe(z.email(AUTH_ERRORS.email));
// Passwords are never trimmed: spaces are significant.
const newPassword = z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_ERRORS.tooShort);

function passwordsMatch(data, ctx) {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: PASSWORD_ERRORS.mismatch });
    }
}

// Every form field is listed: the PrimeVue resolver submits parsed output and z.object() drops unknown keys.
export const loginSchema = z.object({
    email,
    password: z.string().min(1, AUTH_ERRORS.passwordRequired),
    rememberMe: z.boolean()
});

export const registerSchema = z
    .object({
        name: z.string().trim().min(1, AUTH_ERRORS.nameRequired),
        email,
        password: newPassword,
        confirmPassword: z.string(),
        // A refine, not z.literal(true): a literal mismatch aborts and would skip the password-match check.
        terms: z.boolean().refine((accepted) => accepted, AUTH_ERRORS.terms)
    })
    .superRefine(passwordsMatch);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
    .object({
        password: newPassword,
        confirmPassword: z.string()
    })
    .superRefine(passwordsMatch);
