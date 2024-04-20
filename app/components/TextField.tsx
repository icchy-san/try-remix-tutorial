import { ComponentProps, FC } from 'react'
import { useField } from 'remix-validated-form'
import { css } from 'styled-system/css'

type TextFieldProps = Readonly<{
  htmlFor: string
  label: string
  type?: ComponentProps<'input'>['type']
  errorMessage?: string
}>

export const TextField: FC<TextFieldProps> = ({
  htmlFor,
  label,
  type,
  errorMessage,
}) => {
  const { error } = useField(htmlFor)

  return (
    <div className={css({ flexDir: 'column' })}>
      <label htmlFor={htmlFor} className={css({ color: 'gray.600' })}>
        {label}
      </label>
      <input
        type={type}
        id={htmlFor}
        className={css({
          width: '100%',
          padding: 2,
          borderColor: 'gray.300',
        })}
      />
      {error && (
        <span className={css({ color: 'red.500', marginBottom: 2 })}>
          {errorMessage}
        </span>
      )}
      {errorMessage && (
        <span className={css({ color: 'red.500', marginBottom: 2 })}>
          {errorMessage}
        </span>
      )}
    </div>
  )
}
