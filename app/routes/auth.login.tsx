import { authenticator } from '~/services/auth.server'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { css } from 'styled-system/css'
import { ValidatedForm } from 'remix-validated-form'
import { loginValidator } from '~/types/validators/LoginValidator'
import { TextField } from '~/components/TextField'
import { Link } from '@remix-run/react'
import { GoogleForm } from '~/components/GoogleForm'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App Login' }]
}

const loginPageBaseStyles = css({
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  flexDir: 'column',
  rowGap: 5,
})

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.clone().formData()
    const action = String(formData.get('_action'))
    console.log(action)

    switch (action) {
      case 'Sign In':
        return authenticator.authenticate('user-pass', request, {
          successRedirect: '/',
          failureRedirect: '/auth/login',
        })
      case 'Sign In Google':
        return authenticator.authenticate('google', request)
      default:
        return null
    }
  } catch (error) {
    return new Response(`An error occurred: ${error}`, { status: 500 })
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })

  return user
}

const LoginPage = () => {
  return (
    <div className={loginPageBaseStyles}>
      <div
        className={css({
          rounded: '2xl',
          bg: 'white',
          padding: 6,
          width: '420px',
        })}
      >
        <ValidatedForm
          validator={loginValidator}
          method='POST'
          action='/auth/login'
        >
          <h2
            className={css({
              fontSize: '3xl',
              fontWeight: 'extrabold',
              color: 'black',
              marginBottom: 5,
            })}
          >
            Login
          </h2>
          <TextField htmlFor='email' label='Email' />
          <TextField htmlFor='password' type='password' label='Password' />
          <div className={css({ textAlign: 'center', marginTop: 5 })}>
            <button
              type='submit'
              name='_action'
              value='Sign In'
              className={css({
                rounded: 'xl',
                marginTop: 2,
                bg: 'red.500',
                paddingY: 2,
                paddingX: 3,
                color: 'white',
                fontWeight: 'semibold',
                transition: 'ease-in-out',
                transitionDuration: '300',
                _hover: { bg: 'red.600' },
              })}
            >
              Login
            </button>
          </div>
        </ValidatedForm>
        <GoogleForm />
        <p className={css({ color: 'gray.600' })}>
          Don't have an account?
          <Link to='/auth/signup'>
            <span
              className={css({
                color: 'blue.600',
                padding: 2,
                _hover: { textDecoration: 'underline' },
              })}
            >
              Sign Up
            </span>
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
