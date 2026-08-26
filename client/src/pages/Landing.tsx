import { FolderPlus, MessageSquare, Upload } from 'lucide-react'
import { Header } from '../components/Header'
import { LinkButton } from '../components/Button'

const steps = [
  {
    icon: FolderPlus,
    title: 'Create a directory',
    body: 'Start a directory for each topic or course you are studying.',
  },
  {
    icon: Upload,
    title: 'Add your material',
    body: 'Upload PDFs and images. They are indexed for that directory only.',
  },
  {
    icon: MessageSquare,
    title: 'Chat or quiz yourself',
    body: 'Ask questions grounded in your own files, or generate a quiz from them.',
  },
]

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header
        action={
          <LinkButton to="/login" variant="tertiary">
            Log in
          </LinkButton>
        }
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-16 sm:px-10">
        <section className="max-w-[65ch]">
          <h1 className="text-3xl text-text">A study desk for your course material.</h1>
          <p className="mt-4 text-lg text-text-muted">
            Upload files into a topic directory, then ask questions or generate a quiz grounded
            only in what you uploaded.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/register" variant="primary">
              Create an account
            </LinkButton>
            <LinkButton to="/login" variant="secondary">
              Log in
            </LinkButton>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-card border border-border bg-surface p-6 transition-colors duration-150 ease-out hover:border-accent"
            >
              <Icon className="text-text" strokeWidth={1.75} size={22} aria-hidden="true" />
              <h2 className="mt-4 text-lg">{title}</h2>
              <p className="mt-2 text-sm text-text-muted">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-sm text-text-muted sm:px-10">
        Study Assistant
      </footer>
    </div>
  )
}
