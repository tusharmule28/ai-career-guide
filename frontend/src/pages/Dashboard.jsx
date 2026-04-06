import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobStore } from '../store/jobStore';
import {
  Sparkles,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
  Target,
  ShieldCheck,
  User as UserIcon
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
  }, [fetchMatchedJobs, fetchSavedJobs]);

  const stats = {
    matches: matchedJobs.length,
    applications: 0, 
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header with Glass Gradient */}
      <div className="relative mb-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/95 to-indigo-600 text-white overflow-hidden shadow-premium">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
               <Zap size={14} className="text-yellow-300" /> System Live
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-primary-100 mt-2 text-lg opacity-80 font-medium">
              Your career guide is synced and found {stats.matches} new opportunities for you.
            </p>
          </div>
          <Link to="/jobs">
            <Button size="lg" variant="accent" className="shadow-xl shadow-accent-500/20 h-14 px-8 font-bold text-lg rounded-2xl group transition-smooth">
              Find New Jobs <Search className="ml-2 group-hover:scale-110 transition-transform" size={20} />
            </Button>
          </Link>
        </div>
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>
      </div>

      {/* Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to="/jobs" className="block transition-transform hover:scale-[1.03] duration-300">
          <Card className="glass-card flex items-center gap-6 p-8 h-full border-none">
            <div className="bg-primary/10 p-5 rounded-3xl text-primary animate-float">
              <Briefcase size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Job Matches</p>
              <p className="text-3xl font-extrabold text-gray-900">{stats.matches}</p>
            </div>
          </Card>
        </Link>
        
        <Link to="/jobs" className="block transition-transform hover:scale-[1.03] duration-300">
          <Card className="glass-card flex items-center gap-6 p-8 h-full border-none">
            <div className="bg-accent/10 p-5 rounded-3xl text-accent animate-float [animation-delay:1s]">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Skill Score</p>
              <p className="text-3xl font-extrabold text-gray-900">{stats.skillMatches}%</p>
            </div>
          </Card>
        </Link>

        <Link to="/applications" className="block transition-transform hover:scale-[1.03] duration-300">
          <Card className="glass-card flex items-center gap-6 p-8 h-full border-none">
            <div className="bg-green-100 p-5 rounded-3xl text-green-600 animate-float [animation-delay:2s]">
              <Target size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tracked Apps</p>
              <p className="text-3xl font-extrabold text-gray-900">{stats.savedCount}</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Actions Area */}
        <div className="lg:col-span-2 space-y-10">
          <Card padding={false} className="overflow-hidden border-none shadow-premium rounded-[2rem] group">
            <div className="p-10 bg-white relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4">
                   <Sparkles size={18} /> Smart Recommendations
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">Elevate Your Profile to the <br />Next Level with AI Analysis</h2>
                <p className="text-gray-500 mb-8 max-w-lg text-lg leading-relaxed font-medium">
                  Upload your latest resume to regenerate matches and unlock hidden opportunities based on current market trends.
                </p>
                <Link to="/resume-upload">
                  <Button size="lg" icon={ArrowRight} className="rounded-2xl h-14 px-8 font-bold group">
                    Start AI Analysis
                  </Button>
                </Link>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700">
                <FileText className="w-full h-full p-8" />
              </div>
            </div>
          </Card>

          <div>
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                  <TrendingUp size={24} className="text-primary" />
                  Recent Activity
                </h3>
                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-primary">View All History</Button>
             </div>
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity) => (
                <Card key={activity.id} className="glass-card flex items-center justify-between py-6 px-8 border-none group hover:translate-x-2 transition-smooth">
                  <div className="flex items-center gap-6">
                    <div className={`p-3 rounded-2xl ${activity.status === 'completed' ? 'bg-green-50 text-green-600' :
                      activity.status === 'new' ? 'bg-primary/5 text-primary' : 'bg-gray-50 text-gray-500'
                      }`}>
                      {activity.status === 'completed' ? <CheckCircle2 size={24} /> :
                        activity.status === 'new' ? <AlertCircle size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">{activity.title}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold bg-gray-50 group-hover:bg-primary group-hover:text-white transition-smooth">Details</Button>
                </Card>
              )) : (
                <div className="py-10 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                   <p className="font-bold text-gray-400 italic leading-tight">No recent activity detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations Sidebar */}
        <div className="space-y-8">
          <Card className="glass-card h-fit border-none p-8 rounded-[2rem] shadow-premium relative overflow-hidden group">
            {/* Privacy Badge */}
            <div className="absolute top-4 right-4 text-green-500 opacity-20 group-hover:opacity-100 transition-opacity">
               <ShieldCheck size={24} />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-primary text-white rounded-xl">
                 <Sparkles size={20} />
               </div>
               <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                AI Career Strategy
              </h3>
            </div>
            <div className="space-y-8">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div key={index} className={`group cursor-pointer ${index > 0 ? 'border-t border-gray-100 pt-8' : ''}`}>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Zap size={14} /> {rec.category}
                    </p>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                      {rec.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 italic font-medium leading-relaxed">No strategic insights yet. <br />Upload a resume to analyze your profile.</p>
                </div>
              )}
            </div>
            <Link to="/jobs" className="block mt-10">
              <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary font-bold h-12 rounded-xl transition-smooth">
                Optimize My Path
              </Button>
            </Link>
          </Card>

          {/* Quick Stats Widget */}
          <Card className="bg-indigo-600 text-white p-8 rounded-[2rem] border-none shadow-premium relative overflow-hidden group">
             <div className="relative z-10">
               <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-6 flex items-center gap-2">
                 <Zap size={14} /> Market Readiness
               </h4>
               <div className="text-4xl font-extrabold mb-2">92%</div>
               <p className="text-xs text-indigo-100 font-medium opacity-80 leading-relaxed mb-6">
                 Your skills are high in demand in current software trends.
               </p>
               <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white rounded-full w-[92%]"></div>
               </div>
             </div>
             <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </Card>
        </div>
      </div>
      
      {/* Platform Security Assurance */}
      <div className="mt-20 border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 opacity-70">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <ShieldCheck size={16} className="text-green-500" />
           Verified Secure & Encrypted Analysis
        </div>
        <p className="text-[10px] text-gray-400 max-w-md text-center md:text-right leading-relaxed font-medium">
          CareerGuide AI respects your Privacy. Your resume data is exclusively used for AI matching and is never shared with third-party trackers or advertisers.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
