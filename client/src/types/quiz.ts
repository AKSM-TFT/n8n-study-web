export interface QuizQuestion {
  id: string
  question: string
  choices: string[]
  correct_answer: string
  explanation: string | null
  source_url: string | null
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}
