import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { authenticator } from '~/services/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login',
  })

  console.log(user)

  return user
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()
  const action = data.get('action')

  switch (action) {
    case 'logout': {
      return await authenticator.logout(request, { redirectTo: '/auth/login' })
    }

    default:
      return null
  }
}

const Index = () => {
  const { user, provider, name } = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Name: {name ?? 'No Name'}</h1>
      <div>
        <h2>Tutorial Application</h2>
        {provider ?? user.id ? (
          <Form method='POST'>
            <button type='submit' name='action' value='logout'>
              Logout
            </button>
          </Form>
        ) : null}
      </div>
    </>
  )
}

export default Index
