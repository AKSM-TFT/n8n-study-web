import { Header } from '../components/Header'
import { Button, LinkButton } from '../components/Button'

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl text-text">Log in</h1>

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Email
            <input
              type="email"
              disabled
              className="rounded-btn border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Password
            <input
              type="password"
              disabled
              className="rounded-btn border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline-none"
            />
          </label>
          <Button variant="primary" disabled>
            Log in
          </Button>
          <p className="text-sm text-text-muted">Not implemented yet.</p>
        </form>

        <p className="text-sm text-text-muted">
          Don&apos;t have an account? <LinkButton to="/register" variant="tertiary">Register</LinkButton>
        </p>
      </main>
    </div>
  )
}
