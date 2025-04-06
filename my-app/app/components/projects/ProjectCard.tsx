'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import VoteButton from './VoteButton'

type ProjectProps = {
  id: string
  name: string
  teamName: string
  description: string
  appealPoint?: string | null
  demoUrl?: string | null
  imageUrl?: string | null
  voteCount: number
  hasVoted: boolean
  userId: string
}

export default function ProjectCard({
  id,
  name,
  teamName,
  description,
  appealPoint,
  demoUrl,
  imageUrl,
  voteCount,
  hasVoted,
  userId,
}: ProjectProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black border border-neon-blue rounded-xl overflow-hidden shadow-neon transition duration-500 hover:shadow-neon-intense transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-neon-blue tracking-wide">{name}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-neon-pink font-mono">{voteCount}</span>
            <span className="text-white">votes</span>
          </div>
        </div>
        
        <h3 className="text-neon-green text-lg mb-4">Team: {teamName}</h3>
        
        {imageUrl && (
          <div className="relative h-56 mb-4 overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 hover:scale-110"
            />
          </div>
        )}
        
        <p className="text-gray-300 mb-4">{description}</p>
        
        {isExpanded && appealPoint && (
          <div className="my-4">
            <h4 className="text-neon-purple font-semibold mb-2">Appeal Point</h4>
            <p className="text-gray-300">{appealPoint}</p>
          </div>
        )}
        
        <div className="flex flex-wrap justify-between items-center mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-neon-blue hover:text-blue-400 transition duration-300"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
          
          <div className="flex space-x-3">
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 text-neon-green py-2 px-4 rounded-lg transition duration-300"
              >
                Demo
              </a>
            )}
            
            <VoteButton 
              projectId={id} 
              userId={userId} 
              hasVoted={hasVoted} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
