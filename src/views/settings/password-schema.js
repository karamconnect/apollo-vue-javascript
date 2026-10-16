import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

// vue-i18n keys (`tooShort` takes `{min}`), translated where they are shown (components/forms/FieldError.vue).
export const PASSWORD_ERRORS = {
    currentRequired: 'validation.currentPasswordRequired',
    tooShort: 'validation.passwordTooShort',
    mismatch: 'validation.passwordMismatch'
};

// Validates the Account > Password form. Passwords are never trimmed: spaces are significant.
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, PASSWORD_ERRORS.currentRequired),
        newPassword: z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_ERRORS.tooShort),
        confirmPassword: z.string()
    })
    // Length errors don't abort parsing, so the match check still runs while the new password is too short.
    .superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: PASSWORD_ERRORS.mismatch });
        }
    });
