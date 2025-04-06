'use client'

import React, { useState } from 'react'

type VoteButtonProps = {
  projectId: string
  userId: string
  hasVoted: boolean
}

export default function VoteButton({
  projectId,
  userId,
  hasVoted: initialHasVoted,
}: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVote = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          projectId,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '投票に失敗しました')
      }
      
      setHasVoted(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('エラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveVote = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/votes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          projectId,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '投票の取り消しに失敗しました')
      }
      
      setHasVoted(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('エラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {hasVoted ? (
        <button
          onClick={handleRemoveVote}
          disabled={isLoading}
          className="bg-neon-pink hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>投票取消</span>
          {isLoading && <span className="animate-spin">⟳</span>}
        </button>
      ) : (
        <button
          onClick={handleVote}
          disabled={isLoading}
          className="bg-neon-green hover:bg-green-700 text-black font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>投票する</span>
          {isLoading && <span className="animate-spin">⟳</span>}
        </button>
      )}
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
