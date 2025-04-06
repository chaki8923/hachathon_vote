'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type User = {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const dummyUser = {
      id: '1',
      email: 'user1@example.com',
      name: 'ユーザー1',
      isAdmin: false,
    }
    setUser(dummyUser)
  }, [])

  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          <span className="text-neon-blue">HACKATHON</span>
          <span className="text-neon-pink ml-2">VOTE</span>
        </Link>
        
        <div className="flex space-x-4 items-center">
          {user ? (
            <>
              <span className="text-neon-green">{user.name || user.email}</span>
              <button className="bg-neon-purple hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
                ログアウト
              </button>
            </>
          ) : (
            <button className="bg-neon-blue hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
              ログイン
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
