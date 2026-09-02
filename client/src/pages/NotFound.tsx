import { Header } from '../components/Header'
import { LinkButton } from '../components/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-start justify-center gap-4 px-6 py-16">
        <h1 className="text-2xl text-text">Page not found</h1>
        <p className="text-sm text-text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <LinkButton to="/" variant="secondary">
          Back to home
        </LinkButton>
      </main>
    </div>
  )
}
