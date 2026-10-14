import { zodResolver } from '@primevue/forms/resolvers/zod';
import { describe, expect, it } from 'vitest';
import { EMAIL_ERROR, profileSchema } from '../profile-schema';

const validProfile = { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', bio: 'Mathematician' };

function emailErrors(email) {
    const result = profileSchema.safeParse({ ...validProfile, email });

    return result.success ? [] : result.error.issues.filter((issue) => issue.path[0] === 'email').map((issue) => issue.message);
}

describe('profileSchema', () => {
    it('accepts a complete, valid profile', () => {
        expect(profileSchema.safeParse(validProfile)).toEqual({ success: true, data: validProfile });
    });

    describe('email', () => {
        it.each(['ada@example.com', 'first.last+tag@sub.example.co.uk', 'a@b.io'])('accepts %s', (email) => {
            expect(emailErrors(email)).toEqual([]);
        });

        it('is optional: an empty string is valid', () => {
            expect(emailErrors('')).toEqual([]);
        });

        it('treats whitespace-only input as empty', () => {
            const result = profileSchema.safeParse({ ...validProfile, email: '   ' });

            expect(result.success).toBe(true);
            expect(result.data.email).toBe('');
        });

        it('trims surrounding whitespace before validating and saving', () => {
            const result = profileSchema.safeParse({ ...validProfile, email: '  ada@example.com  ' });

            expect(result.success).toBe(true);
            expect(result.data.email).toBe('ada@example.com');
        });

        it.each(['not-an-email', 'ada@', '@example.com', 'ada@example', 'ada example@example.com', 'ada@@example.com'])('rejects %s with a friendly message', (email) => {
            expect(emailErrors(email)).toEqual([EMAIL_ERROR]);
        });

        it('rejects a missing or non-string value', () => {
            expect(profileSchema.safeParse({ ...validProfile, email: undefined }).success).toBe(false);
            expect(profileSchema.safeParse({ ...validProfile, email: 42 }).success).toBe(false);
        });
    });

    it('trims names but keeps the bio exactly as typed', () => {
        const result = profileSchema.safeParse({ ...validProfile, firstName: '  Ada ', lastName: ' Lovelace  ', bio: '  Line one\nLine two  ' });

        expect(result.data).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', bio: '  Line one\nLine two  ' });
    });

    it('allows every field to be empty', () => {
        expect(profileSchema.safeParse({ firstName: '', lastName: '', email: '', bio: '' }).success).toBe(true);
    });
});

// The Profile form consumes the schema through PrimeVue's resolver, so check that boundary too.
describe('profileSchema via zodResolver', () => {
    const resolver = zodResolver(profileSchema);

    it('reports an invalid email under the email field', async () => {
        const { errors } = await resolver({ values: { ...validProfile, email: 'nope' } });

        expect(Object.keys(errors)).toEqual(['email']);
        expect(errors.email[0].message).toBe(EMAIL_ERROR);
    });

    it('returns all profile fields (cleaned) when valid, so nothing is dropped on save', async () => {
        const { errors, values } = await resolver({ values: { ...validProfile, firstName: ' Ada ', email: ' ada@example.com ' } });

        expect(errors).toEqual({});
        expect(values).toEqual({ ...validProfile, firstName: 'Ada', email: 'ada@example.com' });
    });
});
