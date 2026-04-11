import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobStore } from '../store/jobStore';
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  Search,
  Zap,
  ChevronRight,
  ShieldCheck,
  Layout,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import { Link, useNavigate } from 'react-router-dom';
import GapAnalysisModal from '../components/GapAnalysisModal';
import { api } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matchedJobs, loading, fetchMatchedJobs, fetchSavedJobs } = useJobStore();
  const [isGapModalOpen, setIsGapModalOpen] = React.useState(false);
  const [summary, setSummary] = useState({ match_count: 0, skill_score: 0, application_count: 0, activities: [], recommendations: [] });

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    fetchMatchedJobs();
    fetchSavedJobs();
    
    // Load recently viewed from localStorage
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(recent);

    // Fetch real dashboard summary stats
    api.get('/dashboard/summary').then(data => {
      if (data) setSummary(data);
    }).catch(() => {});
  }, [fetchMatchedJobs, fetchSavedJobs]);

  const stats = [
    { label: 'Job Matches', value: summary.match_count || matchedJobs.length, icon: Briefcase, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Skill Score', value: summary.skill_score > 0 ? `${summary.skill_score}%` : matchedJobs.length > 0 ? `${Math.round(matchedJobs[0].score)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Applications', value: summary.application_count, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const freshMatches = matchedJobs.slice(0, 4);
  const recommendedJobs = matchedJobs.slice(4, 10);

  return (
    <div className="section-container animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 md:px-12 md:py-16 mb-12 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-300 mb-6 border border-white/10">
               <Sparkles size={12} strokeWidth={2.5} /> AI Profile Synced
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Hi, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed mb-8">
              We've found {matchedJobs.length} roles that match your background.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-bold rounded-xl shadow-lg shadow-accent-500/20" onClick={() => navigate('/jobs')}>
                View All Matches
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto h-12 px-6 font-bold rounded-xl text-white hover:bg-white/10"
                onClick={() => alert("Market Trends analysis coming soon! We are aggregating real-time data for you.")}
              >
                Explore Trends <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>

          
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-accent-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-xl text-center">
              <div className="mb-6 relative">
                 <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-black text-white">{user?.is_premium ? '95%' : '85%'}</span>
                 </div>
                 <div className="absolute -bottom-2 right-1/2 translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    {user?.is_premium ? 'Premium' : 'Strong'}
                 </div>
              </div>
              <h3 className="text-white font-black text-lg mb-2">Match Power</h3>
              <p className="text-slate-400 text-xs font-medium max-w-[180px] mx-auto">
                 {user?.is_premium ? "Strategic matching algorithms active." : "Your profile is highly optimized for AI roles."}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card p-5 md:p-6 flex items-center gap-4 md:gap-5 border-none">
            <div className={`${stat.bg} ${stat.color} p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0`}>
              <stat.icon size={22} md:size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>


      {/* Fresh Matches Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fresh Matches</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Found within the last 24 hours</p>
          </div>
          <Link to="/jobs" className="text-sm font-bold text-accent-600 hover:text-accent-700 transition-colors flex items-center gap-1">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : freshMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freshMatches.map((job) => (
              <JobCard key={job.id} job={job} onSelect={(j) => navigate(`/job/${j.id || j.job_id}`)} />
            ))}
          </div>
        ) : (
          <Card className="py-16 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50/30 rounded-2xl">
             <div className="w-16 h-16 bg-white shadow-sm text-slate-400 rounded-full flex items-center justify-center mb-6">
                <Search size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">No fresh matches found</h3>
             <p className="max-w-xs text-slate-500 font-medium">Try updating your profile or syncing again to see new matches.</p>
             <Button variant="secondary" size="sm" className="mt-8" onClick={() => fetchMatchedJobs()}>
                Sync Now
             </Button>
          </Card>
        )}
      </section>

      {/* Recommended Jobs & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recommended for You</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)
            ) : recommendedJobs.length > 0 ? (
              recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} onSelect={(j) => navigate(`/job/${j.id || j.job_id}`)} />
              ))
            ) : (
              <p className="col-span-full text-center text-slate-400 font-medium py-10">Sync your profile to get more recommendations.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
           {!user?.is_premium && (
             <Card className="p-8 border-none bg-gradient-to-br from-indigo-600 via-accent-700 to-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                         <Sparkles size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Go Professional</span>
                   </div>
                   <h3 className="text-2xl font-black mb-4 leading-tight">Unlock AI Strategy & Direct Referrals</h3>
                   <p className="text-indigo-100/80 text-sm font-medium mb-8 leading-relaxed">
                      Transform your search with unlimited AI cover letters, skill-gap learning plans, and priority matching.
                   </p>
                   <Button 
                     className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-black h-12 rounded-xl transition-all shadow-glow shadow-white/20"
                     onClick={() => navigate('/premium')}
                   >
                     Upgrade to PRO
                   </Button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
             </Card>
           )}

           <Card className="glass-card border-none p-8 relative overflow-hidden group bg-slate-50 border-slate-200 text-slate-900 shadow-sm">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center mb-6">
                   <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-extrabold mb-4 leading-tight">Elevate Your Career with AI Strategy</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  We noticed a potential skill priority in Cloud Architecture. Developing this could improve your matches.
                </p>
                <Button 
                  variant="ghost" 
                  className="w-full bg-accent-600 text-white hover:bg-accent-700 font-bold h-12 rounded-xl transition-smooth shadow-lg"
                  onClick={() => setIsGapModalOpen(true)}
                >
                  Analyze Skill Gap
                </Button>
              </div>
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
           </Card>


           <GapAnalysisModal 
             isOpen={isGapModalOpen} 
             onClose={() => setIsGapModalOpen(false)} 
           />

           {recentlyViewed.length > 0 && (
             <Card className="glass-card p-8 border-none bg-slate-50/50">
               <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                 <Clock size={20} className="text-slate-400" /> Recently Viewed
               </h3>
               <div className="space-y-6">
                 {recentlyViewed.map((job) => (
                   <div 
                    key={job.id} 
                    className="flex justify-between items-center group cursor-pointer"
                    onClick={() => navigate(`/job/${job.id}`)}
                   >
                     <div className="flex-1 min-w-0">
                       <p className="text-xs font-black text-slate-900 group-hover:text-accent-600 transition-colors truncate">{job.title}</p>
                       <p className="text-[10px] text-slate-400 font-bold mt-0.5">{job.company}</p>
                     </div>
                     <ChevronRight size={14} className="text-slate-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
                   </div>
                 ))}
               </div>
             </Card>
           )}

           {summary.activities?.length > 0 && (
             <Card className="glass-card p-8 border-none">
               <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                 <Clock size={20} className="text-slate-400" /> Recent Activity
               </h3>
               <div className="space-y-4">
                 {summary.activities.map((activity) => (
                   <div key={activity.id} className="flex items-start gap-3">
                     <div className="w-7 h-7 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                       <CheckCircle2 size={14} />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-700">{activity.title}</p>
                       <p className="text-[10px] text-slate-400 font-medium mt-0.5">{activity.time}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </Card>
           )}

           {summary.recommendations?.length > 0 && (
             <Card className="glass-card p-8 border-none">
               <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                 <Sparkles size={20} className="text-accent-500" /> AI Tips
               </h3>
               <div className="space-y-4">
                 {summary.recommendations.map((rec, i) => (
                   <div key={i} className="p-4 bg-accent-50/50 rounded-xl border border-accent-100">
                     <p className="text-[10px] font-bold text-accent-600 uppercase tracking-widest mb-1">{rec.category}</p>
                     <p className="text-xs text-slate-600 font-medium leading-relaxed">{rec.text}</p>
                   </div>
                 ))}
               </div>
             </Card>
           )}

           <Card className="glass-card p-8 border-none">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                 <ShieldCheck size={20} className="text-emerald-500" /> Platform Security
              </h3>
              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Your data is encrypted and never shared with recruiters without your consent.</p>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">AI analysis is unbiased and based solely on your professional merit.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
