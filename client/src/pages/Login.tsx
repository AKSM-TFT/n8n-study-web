import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { Button, LinkButton } from '../components/Button'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/directories')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
        <div className="flex flex-col gap-6 rounded-card border border-border bg-surface p-8">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-accent">Study Assistant</h1>
          <p className="mt-1 text-sm text-text-muted">Access your academic workspace</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Email
            <input
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-btn border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-accent/25"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-btn border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-accent/25"
            />
          </label>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account? <LinkButton to="/register" variant="tertiary">Register</LinkButton>
        </p>
        </div>
      </main>
    </div>
  )
}
