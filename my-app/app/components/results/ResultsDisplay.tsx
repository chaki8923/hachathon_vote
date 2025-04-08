'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type ProjectResult = {
  id: string;
  name: string;
  teamName: string;
  imageUrl: string | null;
  voteCount: number;
  planningScore: number;
  technicalScore: number;
  uiUxScore: number;
  processScore: number;
  aiUtilizationScore: number;
  totalScore: number;
};

export default function ResultsDisplay({ initialResults }: { initialResults: ProjectResult[] }) {
  const [results, setResults] = useState<ProjectResult[]>(initialResults);
  const [totalVotes, setTotalVotes] = useState(0);
  const [maxVotesPerProject, setMaxVotesPerProject] = useState(0);

  useEffect(() => {
    const total = initialResults.reduce((sum, project) => sum + project.voteCount, 0);
    setTotalVotes(total);
    
    const maxVotes = Math.max(...initialResults.map(project => project.voteCount || 0), 0);
    setMaxVotesPerProject(maxVotes);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any;
    if (supabase) {
      try {
        channel = supabase
          .channel('votes-channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'Vote' },
            async () => {
              try {
                const response = await fetch('/api/results', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (response.ok) {
                  const updatedResults = await response.json();
                  setResults(updatedResults);
                  
                  const newTotal = updatedResults.reduce(
                    (sum: number, project: ProjectResult) => sum + project.voteCount, 
                    0
                  );
                  setTotalVotes(newTotal);
                  
                  const newMaxVotes = Math.max(...updatedResults.map((project: ProjectResult) => project.voteCount || 0), 0);
                  setMaxVotesPerProject(newMaxVotes);
                }
              } catch (error) {
                console.error('Error fetching updated results:', error);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up Supabase real-time subscription:', error);
      }
    }

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [initialResults]);

  const maxTotalScore = Math.max(...results.map(project => project.totalScore || 0), 1);

  const sortedResults = [...results].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  const renderScoreBar = (score: number, maxScore: number, label: string, color: string) => {
    const percentage = score > 0 ? (score / maxScore) * 100 : 0;
    
    return (
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>{score.toFixed(1)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">プロジェクト評価結果</h2>
        <p className="text-xl font-semibold">
          総投票数: {totalVotes}
        </p>
      </div>
      
      <div className="space-y-12">
        {sortedResults.map((project, index) => {
          const totalPercentage = project.totalScore > 0 
            ? (project.totalScore / maxTotalScore) * 100 
            : 0;
            
          const colors = [
            'bg-yellow-500', // 1st place
            'bg-gray-400',   // 2nd place
            'bg-amber-700',  // 3rd place
            'bg-blue-500',   // others
          ];
          
          const barColor = index < 3 ? colors[index] : colors[3];
          
          return (
            <div key={project.id} className="relative p-6 border rounded-lg shadow-sm">
              <div className="flex justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl font-bold mr-3">#{index + 1}</span>
                  <div>
                    <h3 className="text-2xl font-semibold">{project.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      チーム: {project.teamName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {project.totalScore?.toFixed(1) || 0}
                    <span className="text-lg text-gray-500">/{(maxVotesPerProject * 5 * 5).toFixed(0)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.voteCount} {project.voteCount === 1 ? '票' : '票'}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
                <div 
                  className={`${barColor} h-4 rounded-full transition-all duration-500 ease-in-out flex items-center px-3`}
                  style={{ width: `${totalPercentage}%`, minWidth: project.totalScore > 0 ? '40px' : '0' }}
                >
                  {project.totalScore > 0 && (
                    <span className="text-white font-medium text-xs">
                      {Math.round(totalPercentage)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {renderScoreBar(project.planningScore || 0, maxVotesPerProject * 5, '企画力', 'bg-blue-500')}
                  {renderScoreBar(project.technicalScore || 0, maxVotesPerProject * 5, '技術力', 'bg-green-500')}
                  {renderScoreBar(project.uiUxScore || 0, maxVotesPerProject * 5, 'UI/UX', 'bg-purple-500')}
                </div>
                <div>
                  {renderScoreBar(project.processScore || 0, maxVotesPerProject * 5, 'プロセス・取り組み姿勢', 'bg-orange-500')}
                  {renderScoreBar(project.aiUtilizationScore || 0, maxVotesPerProject * 5, 'AI活用', 'bg-pink-500')}
                </div>
              </div>
            </div>
          );
        })}
        
        {results.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 dark:text-gray-400">まだプロジェクトまたは投票がありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
