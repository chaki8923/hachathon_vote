'use client';

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function VoteButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        const { data: voteData, error } = await supabase
          .from('Vote')
          .select('*')
          .eq('userId', data.session.user.id)
          .eq('projectId', projectId);
          
        if (!error && voteData && voteData.length > 0) {
          setHasVoted(true);
        }
      }
    };
    
    checkAuth();
  }, [projectId]);

  const handleVote = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to vote');
      }
      
      setHasVoted(true);
      router.refresh(); // Refresh the page to update UI
    } catch (error: unknown) {
      console.error('Error voting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(errorMessage || 'An error occurred while voting');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/votes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove vote');
      }
      
      setHasVoted(false);
      router.refresh(); // Refresh the page to update UI
    } catch (error: unknown) {
      console.error('Error removing vote:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(errorMessage || 'An error occurred while removing your vote');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => router.push('/auth')}
        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-cyan-400/40"
      >
        サインインして投票する
      </button>
    );
  }

  return hasVoted ? (
    <button
      onClick={handleRemoveVote}
      disabled={loading}
      className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-red-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '処理中...' : '投票を取り消す'}
    </button>
  ) : (
    <button
      onClick={handleVote}
      disabled={loading}
      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-green-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '処理中...' : 'このプロジェクトに投票する'}
    </button>
  );
}
