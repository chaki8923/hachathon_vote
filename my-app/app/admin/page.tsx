import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import AdminTabs from '../components/admin/AdminTabs';

export const dynamic = 'force-dynamic';

async function getServerSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { votes: true },
      },
    },
  });
}

async function getVotingPeriod() {
  return await prisma.votingPeriod.findFirst({
    where: { isActive: true },
  });
}

export default async function AdminPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth');
  }
  
  const isAdmin = session.user.email?.includes('admin') || false;
  if (!isAdmin) {
    redirect('/');
  }
  
  const projects = await getProjects();
  const votingPeriod = await getVotingPeriod();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <AdminTabs 
        initialProjects={projects} 
        initialVotingPeriod={votingPeriod} 
      />
    </div>
  );
}
