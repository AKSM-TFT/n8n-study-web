import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { Header } from '../components/Header'
import { Button, LinkButton } from '../components/Button'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/directories')
    } else {
      setInfo('Check your email to confirm your account, then log in.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <div className="flex flex-col gap-6 rounded-card border border-border bg-surface p-8">
          <div className="text-center">
            <h1 className="font-serif text-2xl text-accent">Study Assistant</h1>
            <p className="mt-1 text-sm text-text-muted">Create your account to begin</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Email address
              <span className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-btn border border-border bg-surface px-3 py-2 pr-9 text-text focus:border-accent focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-accent/25"
                />
                <Mail size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              </span>
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Password
              <span className="relative">
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-btn border border-border bg-surface px-3 py-2 pr-9 text-text focus:border-accent focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-accent/25"
                />
                <Lock size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              </span>
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Confirm password
              <span className="relative">
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-btn border border-border bg-surface px-3 py-2 pr-9 text-text focus:border-accent focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-accent/25"
                />
                <Lock size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              </span>
            </label>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="text-sm text-text-muted">
                {info}
              </p>
            )}
          </form>

          <p className="text-center text-sm text-text-muted">
            Already have an account? <LinkButton to="/login" variant="tertiary">Log in</LinkButton>
          </p>
        </div>
      </main>
    </div>
  )
}
