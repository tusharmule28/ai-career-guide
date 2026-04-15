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
    }).catch(() => { });
  }, [fetchMatchedJobs, fetchSavedJobs]);

  const stats = [
    { label: 'Job Matches', value: summary.match_count || matchedJobs.length, icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Skill Score', value: summary.skill_score > 0 ? `${summary.skill_score}%` : matchedJobs.length > 0 ? `${Math.round(matchedJobs[0].score)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Applications', value: summary.application_count, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const freshMatches = matchedJobs.slice(0, 4);
  const recommendedJobs = matchedJobs.slice(4, 10);

  return (
    <div className="section-container animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-12 md:px-14 md:py-20 mb-12 shadow-2xl border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-widest text-primary-200 mb-8 border border-white/10 shadow-soft">
              <Sparkles size={14} strokeWidth={2.5} /> AI Profile Connected
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-6">
              Hi, {user?.name || 'User'}!
            </h1>
            <p className="text-primary-100/70 text-lg md:text-xl font-medium leading-relaxed mb-10">
              We've identified <span className="text-white font-black underline decoration-primary-500 underline-offset-4">{matchedJobs.length} specialized roles</span> that align with your career trajectory.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 font-black rounded-2xl shadow-xl shadow-primary-500/20" onClick={() => navigate('/jobs')}>
                Explore Matches
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 font-black rounded-2xl text-white hover:bg-white/10 transition-all border border-white/10"
                onClick={() => navigate('/profile')}
              >
                Refine Profile <ChevronRight size={20} className="ml-1" />
              </Button>
            </div>
          </div>


          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-primary-500/30 blur-[100px] rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl text-center">
              <div className="mb-8 relative">
                <div className="w-28 h-28 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto shadow-inner">
                  <span className="text-4xl font-black text-white">{user?.is_premium ? '95%' : '85%'}</span>
                </div>
                <div className="absolute -bottom-3 right-1/2 translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl ring-4 ring-primary-950">
                  {user?.is_premium ? 'Premium' : 'Strong'}
                </div>
              </div>
              <h3 className="text-white font-black text-2xl mb-3 tracking-tight">Match Power</h3>
              <p className="text-primary-100/60 text-sm font-medium max-w-[200px] mx-auto leading-relaxed">
                {user?.is_premium ? "Strategic matching algorithms active." : "Your profile is highly optimized for performance roles."}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 md:p-8 flex items-center gap-6 border border-border/50 bg-surface/50 shadow-soft">
            <div className={`${stat.bg} ${stat.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-current opacity-20`}></div>
            <div className="absolute flex items-center gap-6">
                 <div className={`${stat.bg} ${stat.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0`}>
                     <stat.icon size={26} strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-[10px] md:text-[11px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl md:text-3xl font-black text-text tracking-tight">{stat.value}</p>
                 </div>
            </div>
          </Card>
        ))}
      </div>


      {/* Fresh Matches Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-text tracking-tight">Fresh Matches</h2>
            <p className="text-sm text-text-secondary font-medium mt-1">Found within the last 24 hours</p>
          </div>
          <Link to="/jobs" className="text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
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
          <Card className="py-16 border border-dashed border-border flex flex-col items-center justify-center text-center bg-surface/30 rounded-2xl">
            <div className="w-16 h-16 bg-surface shadow-sm text-text-muted rounded-full flex items-center justify-center mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">No fresh matches found</h3>
            <p className="max-w-xs text-text-secondary font-medium">Try updating your profile or syncing again to see new matches.</p>
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
            <h2 className="text-2xl font-extrabold text-text tracking-tight">Recommended for You</h2>
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
            <Card className="p-10 border-none bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                    <Sparkles size={20} className="text-primary-100" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-200">Elite Access</span>
                </div>
                <h3 className="text-3xl font-black mb-6 leading-[1.2]">Unlock AI Strategy & Referrals</h3>
                <p className="text-primary-100/70 text-base font-medium mb-10 leading-relaxed">
                  Transform your search with unlimited cover letters and priority matching.
                </p>
                <Button
                  className="w-full bg-white text-primary-700 hover:bg-primary-50 font-black h-14 rounded-2xl transition-all shadow-2xl"
                  onClick={() => navigate('/premium')}
                >
                  Upgrade to PRO
                </Button>
              </div>
            </Card>
          )}

          <Card className="glass-card border-none p-8 relative overflow-hidden group bg-surface border-border text-text shadow-sm">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-400 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-extrabold mb-4 leading-tight">Elevate Your Career with AI Strategy</h3>
              <p className="text-text-secondary text-sm font-medium mb-8 leading-relaxed">
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
            <Card className="glass-card p-8 border-none bg-surface/50">
              <h3 className="text-lg font-extrabold text-text mb-6 flex items-center gap-2">
                <Clock size={20} className="text-text-muted" /> Recently Viewed
              </h3>
              <div className="space-y-6">
                {recentlyViewed.map((job) => (
                  <div
                    key={job.id}
                    className="flex justify-between items-center group cursor-pointer"
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-text group-hover:text-primary-400 transition-colors truncate">{job.title}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-0.5">{job.company}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {summary.activities?.length > 0 && (
            <Card className="glass-card p-8 border-none bg-surface/30">
              <h3 className="text-lg font-extrabold text-text mb-6 flex items-center gap-2">
                <Clock size={20} className="text-text-muted" /> Recent Activity
              </h3>
              <div className="space-y-4">
                {summary.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-secondary">{activity.title}</p>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {summary.recommendations?.length > 0 && (
            <Card className="glass-card p-8 border-none bg-surface/30">
              <h3 className="text-lg font-extrabold text-text mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-primary-400" /> AI Tips
              </h3>
              <div className="space-y-4">
                {summary.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-primary-500/5 rounded-xl border border-primary-500/10">
                    <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">{rec.category}</p>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed">{rec.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="glass-card p-8 border-none bg-surface/30">
            <h3 className="text-lg font-extrabold text-text mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" /> Platform Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2"></div>
                <p className="text-xs text-text-secondary font-medium leading-relaxed">Your data is encrypted and never shared with recruiters without your consent.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2"></div>
                <p className="text-xs text-text-secondary font-medium leading-relaxed">AI analysis is unbiased and based solely on your professional merit.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
