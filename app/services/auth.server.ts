import { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Authenticator, AuthorizationError } from 'remix-auth'
import { sessionStorage } from './session.server'
import { FormStrategy } from 'remix-auth-form'
import { prisma } from '~/libs/db'
import { GoogleStrategy } from 'remix-auth-google'
import { SupabaseStrategy } from 'remix-auth-supabase'
import { Session, supabaseClient } from './supabase.server'

const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined in .env')
}

export const supabaseStrategy = new SupabaseStrategy(
  {
    supabaseClient,
    sessionStorage,
    sessionKey: 'sb:session',
    sessionErrorKey: 'sb:error',
  },
  async ({ req, supabaseClient }) => {
    const form = await req.formData()
    const email = form.get('email') as string
    const password = form.get('password') as string

    if (!(email && password)) {
      throw new Error('Invalid Request: email and password are required.')
    }

    return supabaseClient.auth
      .signInWithPassword({ email, password })
      .then(({ data, error }): Session => {
        console.log(data)
        console.log(error)
        if (error || !data) {
          throw new AuthorizationError(
            error?.message ?? 'No user session found',
          )
        }

        return data
      })
  },
)

const authenticator = new Authenticator<Omit<User, 'password'>>(
  sessionStorage,
  {
    sessionKey: supabaseStrategy.sessionKey,
    sessionErrorKey: supabaseStrategy.sessionErrorKey,
  },
)

authenticator.use(supabaseStrategy, 'supabase')

const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get('email')
  const password = form.get('password')

  if (!(email && password)) {
    throw new Error('Invalid Request')
  }

  const user = await prisma.user.findUnique({ where: { email: String(email) } })

  if (!user) {
    throw new AuthorizationError()
  }

  const passwordsMatch = await bcrypt.compare(String(password), user.password)

  if (!passwordsMatch) {
    throw new AuthorizationError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
})

authenticator.use(formStrategy, 'user-pass')

if (
  !(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.CLIENT_URL
  )
) {
  throw new Error(
    'GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、CLIENT_URLが設定されていません。',
  )
}

const googleStrategy = new GoogleStrategy<User>(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.CLIENT_URL}/api/auth/google/callback`,
  },
  async ({ profile }) => {
    const user = await prisma.user.findUnique({
      where: { email: profile.emails[0].value },
    })

    if (user) {
      return user
    }

    const newUser = await prisma.user.create({
      data: {
        id: profile.id,
        email: profile.emails[0].value || '',
        password: '',
        name: profile.displayName,
        provider: 'google',
      },
    })

    return newUser
  },
)

authenticator.use(googleStrategy)

export { authenticator }
