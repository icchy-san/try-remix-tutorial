import type { MetaFunction } from '@remix-run/node'
import { css } from 'styled-system/css'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div>
      <div
        className={css({ fontSize: '4xl', fontWeight: 'bold', color: 'red' })}
      >
        Hello 🐼!
      </div>
    </div>
  )
}
