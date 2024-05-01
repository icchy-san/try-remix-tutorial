import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node'
import { Link, useActionData } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { GoogleForm } from '../components/GoogleForm'
import { TextField } from '../components/TextField'
import { authenticator } from '../services/auth.server'
import { createUser } from '../services/signup.server'
import { css } from 'styled-system/css'
import { signUpValidator } from '~/types/validators/SignUpValidator'
import { supabaseClient } from '~/services/supabase.server'

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

      const result = await createUser({
        name,
        email,
        password,
        provider: 'local',
      })

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

    case 'Sign Up Supabase': {
      // TODO: better to expose helper or something like that
      const name = String(formData.get('name'))
      const email = String(formData.get('email'))
      const password = String(formData.get('password'))

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

      // To avoid `Unexpected lexical declaration in case block`, this scope is used {} in case block
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_name: name
          }
        }
      })

      if (error) {
        return json({ error })
      }

      const result = await createUser({
        name,
        email,
        password,
        provider: 'supabase',
      })
      if (result.error) {
        return json({ error: result.error.message })
      }

      return redirect('/')
    }

    default:
      return null
  }
}

const SignUpPage = () => {
  const actionData = useActionData<typeof action>()
  const errors = (actionData as { errors?: { [key: string]: string } })?.errors

  return (
    <div className={css({})}>
      <div
        className={css({
          rounded: '2xl',
          bg: 'white',
          padding: 6,
          width: '80%',
        })}
      >
        <ValidatedForm validator={signUpValidator} method='POST'>
          <h2 className={css({})}>Create an account</h2>
          <TextField htmlFor='name' type='name' label='Name' />
          <TextField
            htmlFor='email'
            label='Email'
            errorMessage={errors?.email}
          />
          <TextField htmlFor='password' type='password' label='Password' />
          <div
            className={css({
              textAlign: 'center',
              marginBottom: 5,
              display: 'flex',
              marginTop: 5,
              justifyContent: 'space-between',
            })}
          >
            <button
              type='submit'
              name='_action'
              value='Sign Up'
              className={css({
                width: '45%',
                rounded: 'xl',
                marginTop: 2,
                bg: 'green.500',
                paddingY: 2,
                paddingX: 3,
                color: 'white',
                fontWeight: 'semibold',
                transition: 'ease-in-out',
                transitionDuration: '300',
                _hover: { bg: 'green.600' },
              })}
            >
              Create an account in Local
            </button>
            <button
              type='submit'
              name='_action'
              value='Sign Up Supabase'
              className={css({
                width: '45%',
                rounded: 'xl',
                marginTop: 2,
                bg: 'red.500',
                paddingY: 2,
                paddingX: 3,
                color: 'green.500',
                fontWeight: 'semibold',
                transition: 'ease-in-out',
                transitionDuration: '300',
                _hover: { bg: 'red.600' },
              })}
            >
              Create an account in Supabase
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
