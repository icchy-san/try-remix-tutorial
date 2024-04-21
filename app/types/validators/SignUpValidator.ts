import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

const signUpFormSchema = z.object({
  name: z
    .string()
    .min(1, 'user name is required')
    .max(64, 'user name must be 64 characters or less'),
  email: z
    .string()
    .email('invalid email address')
    .max(128, 'email must be 128 characters or less'),
  password: z
    .string()
    .min(8, 'password must be at least 8 characters long')
    .max(128, 'password must be 128 characters or less')
    .refine(
      (password: string) => /[A-Za-z]/.test(password) && /[0-9]/.test(password),
      'password must contain at least one letter and one number',
    ),
})

export const signUpValidator = withZod(signUpFormSchema)
