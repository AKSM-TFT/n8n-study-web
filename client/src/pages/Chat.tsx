import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Info, Send, Sparkles } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { sendChatMessage } from '../lib/api'
import { useDirectoryContext } from '../lib/DirectoryContext'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const { directoryId } = useParams<{ directoryId: string }>()
  const { directories, loaded, setCurrentDirectoryId } = useDirectoryContext()
  const loadingDirectory = !loaded
  const directory = directories.find((d) => d.id === directoryId) ?? null
  const [conversation, setConversation] = useState<ChatMessage[]>([])
  const [conversationOwnerId, setConversationOwnerId] = useState(directoryId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  if (directoryId !== conversationOwnerId) {
    setConversationOwnerId(directoryId)
    setConversation([])
  }

  const messages: ChatMessage[] = directory
    ? [
        {
          id: 'greeting',
          role: 'assistant',
          content: `I can answer questions using only the material in "${directory.name}". What would you like to review?`,
        },
        ...conversation,
      ]
    : conversation

  useEffect(() => {
    if (directory) setCurrentDirectoryId(directory.id)
  }, [directory, setCurrentDirectoryId])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || !directoryId || sending) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setConversation((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content }])
    setError(null)
    setSending(true)
    try {
      const { reply } = await sendChatMessage(directoryId, content)
      setConversation((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get a response.')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  if (!directoryId) return null

  return (
    <AppShell active="chat">
      {loadingDirectory ? (
        <p className="p-8 text-sm text-text-muted">Loading…</p>
      ) : !directory ? (
        <div className="flex flex-col items-start gap-3 p-8">
          <p className="text-sm text-text-muted">Directory not found.</p>
          <Link to="/directories" className="text-sm text-accent hover:underline">
            Back to directories
          </Link>
        </div>
      ) : (
        <div className="mx-auto flex h-full max-w-[45rem] flex-col">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-6 py-3 text-sm text-text-muted">
            <Info size={16} strokeWidth={1.75} aria-hidden="true" />
            Answering from {directory.name} material only.
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-8">
            {messages.map((message) =>
              message.role === 'assistant' ? (
                <div key={message.id} className="flex max-w-[85%] flex-col gap-2 self-start">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-btn bg-border/40 text-text">
                      <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wide text-text-muted">Assistant</span>
                  </div>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-text">{message.content}</p>
                </div>
              ) : (
                <div key={message.id} className="flex max-w-[75%] flex-col gap-2 self-end">
                  <span className="self-end font-mono text-xs uppercase tracking-wide text-text-muted">You</span>
                  <p className="rounded-card border border-border bg-surface p-4 text-text">{message.content}</p>
                </div>
              ),
            )}
            {sending && <p className="text-sm text-text-muted">Thinking…</p>}
            {error && (
              <p role="alert" className="rounded-btn border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="shrink-0 border-t border-border p-6">
            <div className="flex items-end gap-2 rounded-card border border-border bg-surface p-2 focus-within:border-accent">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question…"
                rows={1}
                className="max-h-32 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2.5 text-text placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-accent text-accent-contrast transition-opacity duration-150 ease-out hover:opacity-90 disabled:opacity-50"
              >
                <Send size={18} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-text-muted">Press Enter to send, Shift+Enter for new line</p>
          </form>
        </div>
      )}
    </AppShell>
  )
}
