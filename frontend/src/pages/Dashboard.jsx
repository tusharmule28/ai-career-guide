import React, { useEffect } from 'react';
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
  Layout
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matchedJobs, loading, fetchMatchedJobs, fetchSavedJobs } = useJobStore();

  useEffect(() => {
    fetchMatchedJobs();
    fetchSavedJobs();
  }, [fetchMatchedJobs, fetchSavedJobs]);

  const stats = [
    { label: 'Job Matches', value: matchedJobs.length, icon: Briefcase, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Skill Score', value: matchedJobs.length > 0 ? `${Math.round(matchedJobs[0].score)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Market Readiness', value: '92%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const freshMatches = matchedJobs.slice(0, 4);
  const recommendedJobs = matchedJobs.slice(4, 10);

  return (
    <div className="section-container animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 md:px-12 md:py-16 mb-12 shadow-premium">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-300 mb-6 border border-white/10">
               <Sparkles size={12} strokeWidth={2.5} /> AI Profile Synced
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Hi, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
              We've analyzed {matchedJobs.length} specialized roles matching your background. Your next career move is just a click away.
            </p>
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <Button size="lg" className="h-12 px-8 font-bold rounded-xl" onClick={() => navigate('/jobs')}>
                View All Matches
              </Button>
              <Button variant="ghost" size="lg" className="h-12 px-6 font-bold rounded-xl text-white hover:bg-white/10">
                Explore Trends <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-accent-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Layout size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Profile Status</p>
                  <p className="text-white font-bold">100% Complete</p>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-2 bg-white/10 rounded-full w-48 overflow-hidden">
                    <div className={`h-full bg-accent-400 rounded-full`} style={{ width: `${100 - (i * 20)}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card p-6 flex items-center gap-5 border-none">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
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
              <JobCard key={job.id} job={job} onSelect={(j) => navigate(`/jobs?id=${j.id}`)} />
            ))}
          </div>
        ) : (
          <Card className="py-12 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-transparent">
             <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Search size={32} />
             </div>
             <p className="font-bold text-slate-500 italic">No fresh matches today. Try syncing again.</p>
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
                <JobCard key={job.id} job={job} onSelect={(j) => navigate(`/jobs?id=${j.id}`)} />
              ))
            ) : (
              <p className="col-span-full text-center text-slate-400 font-medium py-10">Sync your profile to get more recommendations.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <Card className="glass-card border-none p-8 relative overflow-hidden group bg-accent-600 text-white">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                   <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-extrabold mb-4 leading-tight">Elevate Your Career with AI Strategy</h3>
                <p className="text-accent-100 text-sm font-medium mb-8 leading-relaxed">
                  Our AI has detected a skill gap in Cloud Architecture. Improving this could increase your match score by 25%.
                </p>
                <Button variant="ghost" className="w-full bg-white text-accent-600 hover:bg-accent-50 font-bold h-12 rounded-xl transition-smooth shadow-xl">
                  Analyze Skill Gap
                </Button>
              </div>
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
           </Card>

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
