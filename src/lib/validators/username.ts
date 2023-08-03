import * as z from 'zod';

export const UserNameValidator = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/)
});

export type UserNameRequest = z.infer<typeof UserNameValidator>;