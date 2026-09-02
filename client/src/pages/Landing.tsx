import { FolderPlus, MessageSquare, Upload } from 'lucide-react'
import { Header } from '../components/Header'
import { LinkButton } from '../components/Button'

const steps = [
  {
    icon: FolderPlus,
    title: 'Create a directory',
    body: 'Name it by topic or course. Organize your desk just the way you like it.',
  },
  {
    icon: Upload,
    title: 'Add your material',
    body: 'Upload PDFs and images. Indexed for that directory only.',
  },
  {
    icon: MessageSquare,
    title: 'Chat or quiz yourself',
    body: 'Answers come only from your files, so you learn what matters.',
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
        <section className="mx-auto max-w-[50ch] text-center">
          <h1 className="text-3xl text-text">Your study desk, digitized.</h1>
          <p className="mt-4 text-lg text-text-muted">
            A focused space for your course material. Chat with your documents or generate quizzes,
            grounded strictly in the material you provide.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton to="/register" variant="primary">
              Create an account
            </LinkButton>
            <LinkButton to="/login" variant="secondary">
              Log in
            </LinkButton>
          </div>
        </section>

        <section>
          <h2 className="text-center text-xl text-text">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="rounded-card border border-border bg-surface p-6 transition-colors duration-150 ease-out hover:border-accent"
              >
                <Icon className="text-text" strokeWidth={1.75} size={22} aria-hidden="true" />
                <h3 className="mt-4 text-lg">
                  {i + 1}. {title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-sm text-text-muted sm:px-10">
        Study Assistant
      </footer>
    </div>
  )
}
