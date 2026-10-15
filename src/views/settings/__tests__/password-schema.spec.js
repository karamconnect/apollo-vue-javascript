import { zodResolver } from '@primevue/forms/resolvers/zod';
import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH, PASSWORD_ERRORS, changePasswordSchema } from '../password-schema';

const valid = { currentPassword: 'old-secret', newPassword: 'n3w-secret', confirmPassword: 'n3w-secret' };

// Error messages grouped by field, e.g. { newPassword: ['Use at least 8 characters.'] }.
function errorsFor(values) {
    const result = changePasswordSchema.safeParse(values);

    if (result.success) return {};

    return result.error.issues.reduce((errors, issue) => {
        const field = issue.path.join('.');
        (errors[field] ||= []).push(issue.message);

        return errors;
    }, {});
}

describe('changePasswordSchema', () => {
    it('accepts a valid change', () => {
        expect(changePasswordSchema.safeParse(valid)).toEqual({ success: true, data: valid });
    });

    it('requires the current password', () => {
        expect(errorsFor({ ...valid, currentPassword: '' })).toEqual({ currentPassword: [PASSWORD_ERRORS.currentRequired] });
    });

    describe('new password length', () => {
        it(`accepts exactly ${MIN_PASSWORD_LENGTH} characters`, () => {
            const password = 'a'.repeat(MIN_PASSWORD_LENGTH);

            expect(errorsFor({ ...valid, newPassword: password, confirmPassword: password })).toEqual({});
        });

        it(`rejects ${MIN_PASSWORD_LENGTH - 1} characters`, () => {
            const password = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);

            expect(errorsFor({ ...valid, newPassword: password, confirmPassword: password })).toEqual({ newPassword: [PASSWORD_ERRORS.tooShort] });
        });

        it('counts spaces and does not trim them', () => {
            const password = '  pass  ';
            const result = changePasswordSchema.safeParse({ ...valid, newPassword: password, confirmPassword: password });

            expect(result.success).toBe(true);
            expect(result.data.newPassword).toBe(password);
        });
    });

    describe('confirmation', () => {
        it('reports a mismatch on the confirm field only', () => {
            expect(errorsFor({ ...valid, confirmPassword: 'n3w-secreT' })).toEqual({ confirmPassword: [PASSWORD_ERRORS.mismatch] });
        });

        it('is case-sensitive', () => {
            expect(errorsFor({ ...valid, confirmPassword: valid.newPassword.toUpperCase() })).toHaveProperty('confirmPassword');
        });

        it('flags an empty confirmation as a mismatch', () => {
            expect(errorsFor({ ...valid, confirmPassword: '' })).toEqual({ confirmPassword: [PASSWORD_ERRORS.mismatch] });
        });

        it('still checks the match while the new password is too short', () => {
            expect(errorsFor({ ...valid, newPassword: 'abc', confirmPassword: 'abd' })).toEqual({
                newPassword: [PASSWORD_ERRORS.tooShort],
                confirmPassword: [PASSWORD_ERRORS.mismatch]
            });
        });
    });

    it('reports every problem at once on an empty form', () => {
        expect(errorsFor({ currentPassword: '', newPassword: '', confirmPassword: '' })).toEqual({
            currentPassword: [PASSWORD_ERRORS.currentRequired],
            newPassword: [PASSWORD_ERRORS.tooShort]
        });
    });

    it('rejects non-string values', () => {
        expect(changePasswordSchema.safeParse({ ...valid, newPassword: 12345678 }).success).toBe(false);
    });
});

describe('changePasswordSchema via zodResolver', () => {
    const resolver = zodResolver(changePasswordSchema);

    it('puts the mismatch error on confirmPassword so the form shows it under that field', async () => {
        const { errors } = await resolver({ values: { ...valid, confirmPassword: 'different!' } });

        expect(Object.keys(errors)).toEqual(['confirmPassword']);
        expect(errors.confirmPassword[0].message).toBe(PASSWORD_ERRORS.mismatch);
    });

    it('returns no errors for a valid change', async () => {
        const { errors } = await resolver({ values: valid });

        expect(errors).toEqual({});
    });
});
