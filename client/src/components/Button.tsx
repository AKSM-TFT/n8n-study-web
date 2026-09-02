import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'

const base =
  'inline-flex items-center justify-center rounded-btn px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-contrast border border-accent hover:opacity-90',
  secondary: 'bg-transparent text-text border border-border hover:border-accent',
  tertiary: 'bg-transparent text-text-muted border-0 hover:text-text hover:underline',
  danger: 'bg-transparent text-danger border-0 hover:underline',
}

function classesFor(variant: ButtonVariant, className?: string) {
  return [base, variantClasses[variant], className].filter(Boolean).join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button className={classesFor(variant, className)} {...props}>
      {children}
    </button>
  )
}

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant
  children: ReactNode
}

export function LinkButton({ variant = 'primary', className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={classesFor(variant, className)} {...props}>
      {children}
    </Link>
  )
}
