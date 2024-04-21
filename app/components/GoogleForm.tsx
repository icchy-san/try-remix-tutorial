import { Form } from '@remix-run/react'
import { FaGoogle } from 'react-icons/fa'
import { css } from 'styled-system/css'

export const GoogleForm = () => {
  return (
    <Form method='POST'>
      <button
        type='submit'
        name='_action'
        value='Sign In Google'
        className={css({
          display: 'flex',
          flexDir: 'row',
          width: '100%',
          rounded: 'xl',
          marginTop: 2,
          bg: 'white',
          paddingY: 2,
          paddingX: 3,
          color: 'white',
          fontWeight: 'semibold',
          transition: 'ease-in-out',
          transitionDuration: '300',
          _hover: { bg: 'gray.200', cursor: 'pointer' },
          border: '1px solid',
          borderColor: 'gray.600',
          justifyContent: 'center',
        })}
      >
        <FaGoogle size={22} className={css({ marginRight: 4 })} />
        <span className={css({})}>Sign In with Google</span>
      </button>
    </Form>
  )
}
