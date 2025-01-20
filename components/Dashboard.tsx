'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface InterviewStats {
  totalInterviews: number
  averageScore: number
  topQuestions: { question: string; count: number }[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<InterviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/interview-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch interview stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching interview stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch interview statistics. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!stats) {
    return <div>No statistics available.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Interview Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalInterviews}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.averageScore.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Most Used Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {stats.topQuestions.map((q, index) => (
              <li key={index} className="mb-2">
                <span className="font-medium">{q.question}</span> - Used {q.count} times
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

