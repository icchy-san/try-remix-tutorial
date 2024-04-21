import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useActionData } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { GoogleForm } from '../components/GoogleForm'
import { TextField } from '../components/TextField'
import { authenticator } from '../services/auth.server'
import { createUser } from '../services/signup.server'
import { css } from 'styled-system/css'
import { signUpValidator } from '~/types/validators/SignUpValidator'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })

  return { user }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.clone().formData()
  const action = String(formData.get('_action'))

  switch (action) {
    case 'Sign Up': {
      const name = String(formData.get('name'))
      const email = String(formData.get('email'))
      const password = String(formData.get('password'))
      const errors: { [key: string]: string } = {}

      if (
        typeof action !== 'string' ||
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string'
      ) {
        return json(
          { error: 'Invalid Form Data', form: action },
          { status: 400 },
        )
      }

      const result = await createUser({ name, email, password })

      if (result.error) {
        errors.email = result.error.message
      }

      if (Object.keys(errors).length > 0) {
        return json({ errors })
      }

      return await authenticator.authenticate('user-pass', request, {
        successRedirect: '/',
        failureRedirect: '/auth/signup',
        context: { formData },
      })
    }

    case 'Sign In Google':
      return authenticator.authenticate('google', request)

    default:
      return null
  }
}

const SignUpPage = () => {
  const actionData = useActionData<typeof action>()
  const errors = (actionData as { errors?: { [key: string]: string } })?.errors

  return (
    <div className={css({})}>
      <div className={css({})}>
        <ValidatedForm validator={signUpValidator} method='POST'>
          <h2 className={css({})}>Create an account</h2>
          <TextField htmlFor='name' type='name' label='Name' />
          <TextField
            htmlFor='email'
            label='Email'
            errorMessage={errors?.email}
          />
          <TextField htmlFor='password' type='password' label='Password' />
          <div className={css({})}>
            <button
              type='submit'
              name='_action'
              value='Sign Up'
              className={css({})}
            >
              Create an account
            </button>
          </div>
        </ValidatedForm>
        <GoogleForm />
      </div>
      <p className={css({})}>
        Already have an account?
        <Link to='/auth/login'>
          <span className={css({})}>Sign In</span>
        </Link>
      </p>
    </div>
  )
}

export default SignUpPage
