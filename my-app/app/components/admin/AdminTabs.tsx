'use client';

import React, { useState } from 'react';
import ProjectsTab from './ProjectsTab';
import VotingPeriodTab from './VotingPeriodTab';

type Project = {
  id: string;
  name: string;
  teamName: string;
  description: string;
  appealPoint?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
  _count: {
    votes: number;
  };
};

type VotingPeriod = {
  id: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
};

type AdminTabsProps = {
  initialProjects: Project[];
  initialVotingPeriod: VotingPeriod | null;
};

export default function AdminTabs({ initialProjects, initialVotingPeriod }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState('projects');
  
  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'projects'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Projects
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('voting')}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'voting'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
            >
              Voting Period
            </button>
          </li>
        </ul>
      </div>
      
      <div className="tab-content">
        {activeTab === 'projects' && (
          <ProjectsTab initialProjects={initialProjects} />
        )}
        
        {activeTab === 'voting' && (
          <VotingPeriodTab initialVotingPeriod={initialVotingPeriod} />
        )}
      </div>
    </div>
  );
}
