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
}

interface Interview {
  id: string
  candidateName: string
  questions: Question[]
  currentQuestionIndex: number
  responses: { [key: string]: string }
}

export default function InterviewEngine() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    domain: '',
    techStack: '',
    difficulty: 'Medium',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/interviews')
      if (!response.ok) {
        throw new Error('Failed to fetch interviews')
      }
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error('Error fetching interviews:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch interviews. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startInterview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInterview),
      })
      if (!response.ok) {
        throw new Error('Failed to start interview')
      }
      const data = await response.json()
      setInterviews([...interviews, data])
      setNewInterview({ candidateName: '', domain: '', techStack: '', difficulty: 'Medium' })
      toast({
        title: 'Success',
        description: 'Interview started successfully.',
      })
    } catch (error) {
      console.error('Error starting interview:', error)
      toast({
        title: 'Error',
        description: 'Failed to start interview. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async (interviewId: string, questionId: string, answer: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/interviews/${interviewId}/questions/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      })
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      const data = await response.json()
      const updatedInterviews = interviews.map(interview => 
        interview.id === interviewId ? data : interview
      )
      setInterviews(updatedInterviews)
      toast({
        title: 'Success',
        description: 'Answer submitted successfully.',
      })
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit answer. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Interview Engine</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <Label htmlFor="candidate-name">Candidate Name</Label>
          <Input
            id="candidate-name"
            value={newInterview.candidateName}
            onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
            placeholder="Enter candidate name"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={newInterview.domain}
              onChange={(e) => setNewInterview({ ...newInterview, domain: e.target.value })}
              placeholder="e.g., Web Development"
            />
          </div>
          
          <div>
            <Label htmlFor="tech-stack">Tech Stack</Label>
            <Input
              id="tech-stack"
              value={newInterview.techStack}
              onChange={(e) => setNewInterview({ ...newInterview, techStack: e.target.value })}
              placeholder="e.g., React"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={newInterview.difficulty}
            onValueChange={(value) => setNewInterview({ ...newInterview, difficulty: value as 'Easy' | 'Medium' | 'Hard' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={startInterview} disabled={isLoading}>
          {isLoading ? 'Starting...' : 'Start Interview'}
        </Button>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Ongoing Interviews</h2>
        {isLoading ? (
          <p>Loading interviews...</p>
        ) : interviews.length > 0 ? (
          interviews.map((interview) => (
            <div key={interview.id} className="border p-4 mb-4 rounded-md">
              <h3 className="font-medium">{interview.candidateName}</h3>
              <p className="text-sm text-gray-600">
                Domain: {interview.questions[0].domain} | Tech Stack: {interview.questions[0].techStack} | 
                Difficulty: {interview.questions[0].difficulty}
              </p>
              <div className="mt-4">
                <p className="font-medium">Current Question:</p>
                <p>{interview.questions[interview.currentQuestionIndex].text}</p>
                <Textarea
                  className="mt-2"
                  placeholder="Enter candidate's answer"
                  value={interview.responses[interview.questions[interview.currentQuestionIndex].id] || ''}
                  onChange={(e) => submitAnswer(interview.id, interview.questions[interview.currentQuestionIndex].id, e.target.value)}
                />
              </div>
            </div>
          ))
        ) : (
          <p>No ongoing interviews.</p>
        )}
      </div>
    </div>
  )
}

