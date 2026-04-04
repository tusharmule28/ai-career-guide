import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { matchedJobs, savedJobs, loading, fetchMatchedJobs, fetchSavedJobs } = useJobStore();

  useEffect(() => {
    fetchMatchedJobs();
    fetchSavedJobs();
  }, []);

  const stats = {
    matches: matchedJobs.length,
    applications: 0, // Placeholder
    savedCount: savedJobs.length,
    skillMatches: matchedJobs.length > 0 ? Math.round(matchedJobs[0].score) : 0
  };

  const activities = savedJobs.slice(0, 3).map(job => ({
    id: job.id,
    title: `Saved: ${job.title}`,
    status: 'completed',
    time: 'Recently'
  }));

  const recommendations = matchedJobs.slice(0, 2).map(job => ({
    category: 'Top Match',
    text: `You are a ${Math.round(job.score)}% match for ${job.title} at ${job.company}.`
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your career journey today.
          </p>
        </div>
        <Link to="/jobs">
          <Button icon={Search}>Find New Jobs</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/jobs" className="block transition-transform hover:scale-[1.02]">
          <Card className="flex items-center gap-5 h-full">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary">
              <Briefcase size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Job Matches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.matches}</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/jobs" className="block transition-transform hover:scale-[1.02]">
          <Card className="flex items-center gap-5 h-full">
            <div className="bg-accent/10 p-4 rounded-2xl text-accent">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Skill Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.skillMatches}%</p>
            </div>
          </Card>
        </Link>

        <Link to="/jobs" className="block transition-transform hover:scale-[1.02]">
          <Card className="flex items-center gap-5 h-full">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Saved Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.savedCount}</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-8">
          <Card padding={false} className="overflow-hidden">
            <div className="p-8 bg-primary/90 text-white relative">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Enhance Your Profile</h2>
                <p className="text-primary-100 mb-6 max-w-md">
                  Upload your latest resume to get AI-powered insights and match with high-performing roles.
                </p>
                <Link to="/resume-upload">
                  <Button variant="secondary" icon={ArrowRight}>
                    Analyze Resume
                  </Button>
                </Link>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
                <FileText className="w-full h-full p-4" />
              </div>
            </div>
          </Card>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="flex items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${activity.status === 'completed' ? 'bg-green-50 text-green-600' :
                      activity.status === 'new' ? 'bg-primary/5 text-primary' : 'bg-gray-50 text-gray-500'
                      }`}>
                      {activity.status === 'completed' ? <CheckCircle2 size={18} /> :
                        activity.status === 'new' ? <AlertCircle size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Tips */}
        <Card className="h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            AI Recommendations
          </h3>
          <div className="space-y-5">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className={`group cursor-pointer ${index > 0 ? 'border-t border-gray-100 pt-4' : ''}`}>
                  <p className="text-sm font-semibold text-primary mb-1">{rec.category}</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-900">
                    {rec.text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No recommendations yet. Upload a resume to get started!</p>
            )}
          </div>
          <Button variant="outline" className="w-full mt-8 border-primary/20 text-primary hover:bg-primary/5">
            View All Insights
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
