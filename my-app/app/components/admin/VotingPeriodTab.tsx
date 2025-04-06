'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type VotingPeriod = {
  id: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
};

export default function VotingPeriodTab({ initialVotingPeriod }: { initialVotingPeriod: VotingPeriod | null }) {
  const [startTime, setStartTime] = useState(
    initialVotingPeriod 
      ? new Date(initialVotingPeriod.startTime).toISOString().slice(0, 16) 
      : ''
  );
  const [endTime, setEndTime] = useState(
    initialVotingPeriod 
      ? new Date(initialVotingPeriod.endTime).toISOString().slice(0, 16) 
      : ''
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime) {
      alert('Please set both start and end times');
      return;
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      alert('End time must be after start time');
      return;
    }
    
    setLoading(true);
    
    try {
      const method = initialVotingPeriod ? 'PUT' : 'POST';
      const url = initialVotingPeriod 
        ? `/api/voting-periods/${initialVotingPeriod.id}` 
        : '/api/voting-periods';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          isActive: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save voting period');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error saving voting period:', error);
      alert('Failed to save voting period. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialVotingPeriod) return;
    
    if (!confirm('Are you sure you want to delete the current voting period? This will disable voting.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/voting-periods/${initialVotingPeriod.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete voting period');
      }
      
      setStartTime('');
      setEndTime('');
      router.refresh();
    } catch (error) {
      console.error('Error deleting voting period:', error);
      alert('Failed to delete voting period. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Voting Period Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={!initialVotingPeriod || loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Delete Voting Period'}
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialVotingPeriod ? 'Update Voting Period' : 'Create Voting Period'}
          </button>
        </div>
      </form>
      
      {initialVotingPeriod && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <h3 className="text-lg font-medium mb-2">Current Voting Period</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Start: {new Date(initialVotingPeriod.startTime).toLocaleString()}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            End: {new Date(initialVotingPeriod.endTime).toLocaleString()}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Status: {
              initialVotingPeriod.isActive 
                ? new Date() < new Date(initialVotingPeriod.startTime)
                  ? 'Scheduled'
                  : new Date() > new Date(initialVotingPeriod.endTime)
                    ? 'Ended'
                    : 'Active'
                : 'Inactive'
            }
          </p>
        </div>
      )}
    </div>
  );
}
