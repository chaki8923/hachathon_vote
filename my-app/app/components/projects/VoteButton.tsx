'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type VoteData = {
  planningScore: number;
  technicalScore: number;
  uiUxScore: number;
  processScore: number;
  aiUtilizationScore: number;
  voterName: string;
};

export default function VoteButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [voteData, setVoteData] = useState<VoteData>({
    planningScore: 0,
    technicalScore: 0,
    uiUxScore: 0,
    processScore: 0,
    aiUtilizationScore: 0,
    voterName: '',
  });
  const router = useRouter();

  useEffect(() => {
    const checkIfVoted = () => {
      try {
        const votedProjects = JSON.parse(localStorage.getItem('votedProjects') || '[]');
        if (votedProjects.includes(projectId)) {
          setHasVoted(true);
        }
      } catch (error) {
        console.error('Error checking vote status:', error);
      }
    };
    
    checkIfVoted();
  }, [projectId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVoteData({
      ...voteData,
      [name]: name === 'voterName' ? value : Math.min(5, Math.max(0, parseInt(value) || 0)),
    });
  };

  const handleScoreChange = (field: keyof VoteData, value: number) => {
    if (field !== 'voterName') {
      setVoteData({
        ...voteData,
        [field]: Math.min(5, Math.max(0, value)),
      });
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          ...voteData,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '投票に失敗しました');
      }
      
      const votedProjects = JSON.parse(localStorage.getItem('votedProjects') || '[]');
      if (!votedProjects.includes(projectId)) {
        votedProjects.push(projectId);
        localStorage.setItem('votedProjects', JSON.stringify(votedProjects));
      }
      
      setHasVoted(true);
      setShowVoteForm(false);
      router.refresh(); // Refresh the page to update UI
    } catch (error: unknown) {
      console.error('Error voting:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      alert(errorMessage || '投票中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVote = async () => {
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
        throw new Error(error.message || '投票の取り消しに失敗しました');
      }
      
      const votedProjects = JSON.parse(localStorage.getItem('votedProjects') || '[]');
      const updatedVotedProjects = votedProjects.filter((id: string) => id !== projectId);
      localStorage.setItem('votedProjects', JSON.stringify(updatedVotedProjects));
      
      setHasVoted(false);
      router.refresh(); // Refresh the page to update UI
    } catch (error: unknown) {
      console.error('Error removing vote:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      alert(errorMessage || '投票の取り消し中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (field: keyof VoteData, label: string) => {
    if (field === 'voterName') return null;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} (0-5)
        </label>
        <div className="flex items-center">
          {[0, 1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => handleScoreChange(field, score)}
              className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center ${
                voteData[field] >= score 
                  ? 'bg-yellow-400 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (hasVoted) {
    return (
      <button
        onClick={handleRemoveVote}
        disabled={loading}
        className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-red-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '処理中...' : '投票を取り消す'}
      </button>
    );
  }

  if (showVoteForm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-4">
        <h3 className="text-xl font-bold mb-4">このプロジェクトを評価する</h3>
        <form onSubmit={handleVote}>
          <div className="mb-4">
            <label htmlFor="voterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              お名前（任意）
            </label>
            <input
              type="text"
              id="voterName"
              name="voterName"
              value={voteData.voterName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          
          {renderStarRating('planningScore', '企画力')}
          {renderStarRating('technicalScore', '技術力')}
          {renderStarRating('uiUxScore', 'UI/UX')}
          {renderStarRating('processScore', 'プロセス・取り組み姿勢')}
          {renderStarRating('aiUtilizationScore', 'AI活用')}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => setShowVoteForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
            >
              {loading ? '処理中...' : '投票する'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowVoteForm(true)}
      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg hover:shadow-green-400/40"
    >
      このプロジェクトに投票する
    </button>
  );
}
