import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

const loginFormSchema = z.object({
  email: z
    .string()
    .email('Input the correct email format')
    .max(128, 'email length must be less than 128'),
  password: z
    .string()
    .min(8, 'password must be 8')
    .max(128, 'password length must be less than 128')
    .refine(
      (password: string) => /[A-Za-z]/.test(password) && /[0-9]/.test(password),
      'password should include alphabet and number',
    ),
})

export const loginValidator = withZod(loginFormSchema)
