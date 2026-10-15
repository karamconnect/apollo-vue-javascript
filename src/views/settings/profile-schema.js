import { z } from 'zod';

export const EMAIL_ERROR = 'Enter a valid email address.';

// Validates the Profile settings form. Every profile field is listed because the
// PrimeVue resolver submits the parsed output, and z.object() drops unknown keys.
export const profileSchema = z.object({
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    // Optional, but must be a valid address when filled in.
    email: z
        .string()
        .trim()
        .pipe(z.union([z.literal(''), z.email(EMAIL_ERROR)])),
    bio: z.string()
});
