'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

interface Question {
  id: string
  text: string
  domain: string
  techStack: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  idealAnswer: string
  tags: string[]
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({
    text: '',
    domain: '',
    techStack: '',
    difficulty: 'Medium',
    idealAnswer: '',
    tags: []
  })
  const [tag, setTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/questions')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: 'Error',
        description: `Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addQuestion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(`HTTP error! status: ${response.status}${errorData ? `, message: ${errorData.message}` : ''}`)
      }
      const data = await response.json()
      setQuestions([...questions, data])
      setNewQuestion({ text: '', domain: '', techStack: '', difficulty: 'Medium', idealAnswer: '', tags: [] })
      toast({
        title: 'Success',
        description: 'Question added successfully.',
      })
    } catch (error) {
      console.error('Error adding question:', error)
      toast({
        title: 'Error',
        description: `Failed to add question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tag && !newQuestion.tags.includes(tag)) {
      setNewQuestion({ ...newQuestion, tags: [...newQuestion.tags, tag] })
      setTag('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Question Bank</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <Label htmlFor="question-text">Question</Label>
          <Textarea
            id="question-text"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            placeholder="Enter the question text"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={newQuestion.domain}
              onChange={(e) => setNewQuestion({ ...newQuestion, domain: e.target.value })}
              placeholder="e.g., Web Development"
            />
          </div>
          
          <div>
            <Label htmlFor="tech-stack">Tech Stack</Label>
            <Input
              id="tech-stack"
              value={newQuestion.techStack}
              onChange={(e) => setNewQuestion({ ...newQuestion, techStack: e.target.value })}
              placeholder="e.g., React"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={newQuestion.difficulty}
            onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value as 'Easy' | 'Medium' | 'Hard' })}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ideal-answer">Ideal Answer</Label>
          <Textarea
            id="ideal-answer"
            value={newQuestion.idealAnswer}
            onChange={(e) => setNewQuestion({ ...newQuestion, idealAnswer: e.target.value })}
            placeholder="Enter the ideal answer"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="flex space-x-2">
            <Input
              id="tags"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter a tag"
            />
            <Button onClick={addTag}>Add Tag</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {newQuestion.tags.map((t, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
        
        <Button onClick={addQuestion} disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Question'}
        </Button>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Questions</h2>
        {isLoading ? (
          <p>Loading questions...</p>
        ) : questions.length > 0 ? (
          questions.map((q) => (
            <div key={q.id} className="border p-4 mb-4 rounded-md">
              <p className="font-medium">{q.text}</p>
              <p className="text-sm text-gray-600">
                Domain: {q.domain} | Tech Stack: {q.techStack} | Difficulty: {q.difficulty}
              </p>
              <p className="text-sm text-gray-600 mt-2">Tags: {q.tags.join(', ')}</p>
            </div>
          ))
        ) : (
          <p>No questions available.</p>
        )}
      </div>
    </div>
  )
}

