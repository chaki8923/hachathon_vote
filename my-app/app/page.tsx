'use client'

import React, { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import ProjectCard from './components/projects/ProjectCard'

type Project = {
  id: string
  name: string
  teamName: string
  description: string
  appealPoint: string | null
  demoUrl: string | null
  imageUrl: string | null
  _count: {
    votes: number
  }
}

type VotingPeriod = {
  id: string
  startTime: string
  endTime: string
  isActive: boolean
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [votingPeriod, setVotingPeriod] = useState<VotingPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  
  const userId = '1'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await fetch('/api/projects')
        if (!projectsRes.ok) throw new Error('プロジェクトの取得に失敗しました')
        const projectsData = await projectsRes.json()
        setProjects(projectsData)

        const periodsRes = await fetch('/api/voting-periods')
        if (!periodsRes.ok) throw new Error('投票期間の取得に失敗しました')
        const periodsData = await periodsRes.json()
        const activePeriod = periodsData.find((p: VotingPeriod) => p.isActive)
        setVotingPeriod(activePeriod || null)

        if (projectsData.length > 0) {
          setUserVotes(new Set([projectsData[0].id]))
        }

        setLoading(false)
      } catch (error) {
        console.error('データ取得エラー:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isVotingActive = () => {
    if (!votingPeriod) return false
    
    const now = new Date()
    const start = new Date(votingPeriod.startTime)
    const end = new Date(votingPeriod.endTime)
    
    return votingPeriod.isActive && now >= start && now <= end
  }

  const formatPeriod = () => {
    if (!votingPeriod) return '投票期間は設定されていません'
    
    const start = new Date(votingPeriod.startTime)
    const end = new Date(votingPeriod.endTime)
    
    return `${start.toLocaleDateString('ja-JP')} 〜 ${end.toLocaleDateString('ja-JP')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-neon-blue">HACKATHON</span>
            <span className="text-neon-pink">VOTE</span>
          </h1>
          
          <p className="text-gray-300 text-xl mb-6">
            あなたのお気に入りのプロジェクトに投票しよう！
          </p>
          
          <div className="inline-block bg-black bg-opacity-50 p-4 rounded-lg border border-neon-purple mb-6">
            <p className="text-neon-green font-mono">
              投票期間: {formatPeriod()}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {isVotingActive() 
                ? '現在投票を受け付けています' 
                : '現在は投票期間外です'}
            </p>
          </div>
          
          <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-neon-blue inline-block">
            <h2 className="text-neon-pink text-xl mb-2">投票方法</h2>
            <ol className="text-left text-gray-300 list-decimal list-inside">
              <li className="mb-2">各プロジェクトカードを確認</li>
              <li className="mb-2">「投票する」ボタンをクリックして投票</li>
              <li>投票後は「投票取消」ボタンで取り消し可能</li>
            </ol>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-neon-blue text-2xl animate-pulse">Loading...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">プロジェクトがまだ登録されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                teamName={project.teamName}
                description={project.description}
                appealPoint={project.appealPoint}
                demoUrl={project.demoUrl}
                imageUrl={project.imageUrl}
                voteCount={project._count.votes}
                hasVoted={userVotes.has(project.id)}
                userId={userId}
              />
            ))}
          </div>
        )}
      </main>
      
      <footer className="bg-black bg-opacity-70 text-gray-400 py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 ハッカソン投票アプリ</p>
        </div>
      </footer>
    </div>
  )
}
