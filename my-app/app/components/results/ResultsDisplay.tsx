'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type ProjectResult = {
  id: string;
  name: string;
  teamName: string;
  imageUrl: string | null;
  voteCount: number;
};

export default function ResultsDisplay({ initialResults }: { initialResults: ProjectResult[] }) {
  const [results, setResults] = useState<ProjectResult[]>(initialResults);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const total = initialResults.reduce((sum, project) => sum + project.voteCount, 0);
    setTotalVotes(total);

    const channel = supabase
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
            }
          } catch (error) {
            console.error('Error fetching updated results:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialResults]);

  const maxVotes = Math.max(...results.map(project => project.voteCount), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6 text-center">
        <p className="text-xl font-semibold">
          Total Votes: {totalVotes}
        </p>
      </div>
      
      <div className="space-y-8">
        {results.map((project, index) => {
          const percentage = project.voteCount > 0 
            ? (project.voteCount / maxVotes) * 100 
            : 0;
            
          const colors = [
            'bg-yellow-500', // 1st place
            'bg-gray-400',   // 2nd place
            'bg-amber-700',  // 3rd place
            'bg-blue-500',   // others
          ];
          
          const barColor = index < 3 ? colors[index] : colors[3];
          
          return (
            <div key={project.id} className="relative">
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2">#{index + 1}</span>
                  <span className="text-xl font-semibold">{project.name}</span>
                </div>
                <span className="text-xl font-bold">
                  {project.voteCount} {project.voteCount === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 mb-1">
                <div 
                  className={`${barColor} h-8 rounded-full transition-all duration-500 ease-in-out flex items-center px-3`}
                  style={{ width: `${percentage}%`, minWidth: project.voteCount > 0 ? '40px' : '0' }}
                >
                  {project.voteCount > 0 && (
                    <span className="text-white font-medium">
                      {Math.round((project.voteCount / totalVotes) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
                Team: {project.teamName}
              </p>
            </div>
          );
        })}
        
        {results.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 dark:text-gray-400">No projects or votes available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
