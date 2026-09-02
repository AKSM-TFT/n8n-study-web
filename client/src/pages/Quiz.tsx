import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, FileQuestion, X } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'
import { generateQuiz } from '../lib/api'
import { useDirectoryContext } from '../lib/DirectoryContext'
import type { Quiz as QuizType } from '../types/quiz'

export default function Quiz() {
  const { directoryId } = useParams<{ directoryId: string }>()
  const { directories, loaded, setCurrentDirectoryId } = useDirectoryContext()
  const loadingDirectory = !loaded
  const directory = directories.find((d) => d.id === directoryId) ?? null
  const [quiz, setQuiz] = useState<QuizType | null>(null)
  const [quizOwnerId, setQuizOwnerId] = useState(directoryId)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  if (directoryId !== quizOwnerId) {
    setQuizOwnerId(directoryId)
    setQuiz(null)
    setCurrentIndex(0)
    setAnswers({})
    setShowResults(false)
  }

  useEffect(() => {
    if (directory) setCurrentDirectoryId(directory.id)
  }, [directory, setCurrentDirectoryId])

  async function handleGenerate() {
    if (!directoryId) return
    setGenerating(true)
    setError(null)
    try {
      const generated = await generateQuiz(directoryId)
      setQuiz(generated)
      setCurrentIndex(0)
      setAnswers({})
      setShowResults(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate a quiz.')
    } finally {
      setGenerating(false)
    }
  }

  if (!directoryId) return null

  const question = quiz?.questions[currentIndex] ?? null
  const selected = question ? answers[question.id] : undefined
  const isAnswered = selected !== undefined
  const score = quiz
    ? quiz.questions.filter((q) => answers[q.id] === q.correct_answer).length
    : 0
  const isLast = quiz ? currentIndex === quiz.questions.length - 1 : false
  const finished = showResults

  return (
    <AppShell active="quiz">
      {loadingDirectory ? (
        <p className="p-8 text-sm text-text-muted">Loading…</p>
      ) : !directory ? (
        <div className="flex flex-col items-start gap-3 p-8">
          <p className="text-sm text-text-muted">Directory not found.</p>
          <Link to="/directories" className="text-sm text-accent hover:underline">
            Back to directories
          </Link>
        </div>
      ) : !quiz ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <FileQuestion size={32} strokeWidth={1.5} className="text-text-muted" aria-hidden="true" />
          <h1 className="font-serif text-xl text-text">Quiz yourself on {directory.name}</h1>
          <p className="max-w-sm text-sm text-text-muted">
            Generate a quiz drawn from this directory&apos;s material.
          </p>
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate quiz'}
          </Button>
          {error && (
            <p role="alert" className="rounded-btn border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto flex h-full max-w-3xl flex-col p-6 sm:p-10">
          <div className="mb-8 flex shrink-0 items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="font-serif text-2xl text-text">{quiz.title}</h1>
              <p className="mt-1 text-sm text-text-muted">
                {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} from {directory.name}.
              </p>
            </div>
            <span className="shrink-0 rounded-btn bg-border/40 px-3 py-1 text-sm text-text-muted">
              Score: {score}/{quiz.questions.length}
            </span>
          </div>

          {finished ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="font-serif text-2xl text-text">
                You scored {score} out of {quiz.questions.length}
              </p>
              <Button variant="primary" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating…' : 'Generate another quiz'}
              </Button>
            </div>
          ) : (
            question && (
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="w-full rounded-card border border-border bg-surface p-8">
                  <span className="mb-4 inline-block rounded-btn border border-accent/20 bg-accent/10 px-2 py-1 text-sm text-accent">
                    Question {currentIndex + 1}
                  </span>
                  <h2 className="mb-6 font-serif text-xl text-text">{question.question}</h2>

                  <div className="flex flex-col gap-4">
                    {question.choices.map((choice) => {
                      const isCorrectChoice = choice === question.correct_answer
                      const isSelectedChoice = choice === selected

                      let stateClasses = 'border-border bg-surface hover:border-accent'
                      if (isAnswered) {
                        if (isCorrectChoice) {
                          stateClasses = 'border-2 border-success bg-success/15'
                        } else if (isSelectedChoice) {
                          stateClasses = 'border-2 border-danger bg-danger/15'
                        } else {
                          stateClasses = 'border-border bg-surface opacity-50'
                        }
                      }

                      return (
                        <button
                          key={choice}
                          type="button"
                          disabled={isAnswered}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: choice }))
                          }
                          className={`flex w-full items-start gap-3 rounded-card border p-4 text-left transition-colors duration-150 ease-out disabled:cursor-default ${stateClasses}`}
                        >
                          {isAnswered && (isCorrectChoice || isSelectedChoice) && (
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-accent-contrast ${
                                isCorrectChoice ? 'bg-success' : 'bg-danger'
                              }`}
                            >
                              {isCorrectChoice ? (
                                <Check size={14} strokeWidth={2} aria-hidden="true" />
                              ) : (
                                <X size={14} strokeWidth={2} aria-hidden="true" />
                              )}
                            </span>
                          )}
                          <div className="flex-1">
                            <span className="text-text">{choice}</span>
                            {isAnswered && isCorrectChoice && question.explanation && (
                              <p className="mt-2 text-sm text-success">{question.explanation}</p>
                            )}
                            {isAnswered && isSelectedChoice && !isCorrectChoice && (
                              <p className="mt-2 text-sm text-danger">Incorrect.</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          )}

          {!finished && (
            <div className="mt-8 flex shrink-0 items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-text-muted">
                Question {currentIndex + 1} of {quiz.questions.length}
              </p>
              <Button
                variant="primary"
                disabled={!isAnswered}
                onClick={() =>
                  isLast ? setShowResults(true) : setCurrentIndex((i) => i + 1)
                }
              >
                {isLast ? 'See results' : 'Next question'}
                <ArrowRight size={16} strokeWidth={1.75} className="ml-1.5 inline" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
