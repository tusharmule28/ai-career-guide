'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  User as UserIcon, Mail, MapPin, Briefcase, Link as LinkIcon,
  Sparkles, CheckCircle2,
  Globe, RefreshCw, ExternalLink, ChevronRight, Phone,
  X, Edit3, Loader2, Save, Code2, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button, { cn } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import JobCard from '@/components/JobCard';
import EmptyState from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>({
    full_name: '',
    email: '',
    job_title: '',
    location: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    portfolio: '',
    phone: '',
    experience_years: 0,
    is_premium: false
  });
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [matchingJobs, setMatchingJobs] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/users/profile');
        if (data) {
          setProfile(data);
          fetchMatchingJobs();
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const fetchMatchingJobs = async () => {
    setMatchingLoading(true);
    try {
      const results = await api.post('/matching/match', { top_n: 3, sort_newest: true });
      setMatchingJobs(results);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/users/profile/update', profile);
      toast.success('Professional identity synchronized.');
      setIsEditing(false);
      updateUser({ ...profile, name: profile.full_name });
      fetchMatchingJobs();
    } catch (err: any) {
      toast.error(err.message || 'Synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  const skillsList = profile.skills 
    ? (typeof profile.skills === 'string' ? profile.skills.split(',') : profile.skills)
        .map((s: string) => s.trim())
        .filter((s: string) => s) 
    : [];

  return (
    <div className="section-container pb-24">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-12 gap-8 text-center lg:text-left">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-6 border border-primary-500/20 shadow-sm"
          >
            <Sparkles size={12} className="animate-pulse" /> Identity Management
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
            Professional <span className="premium-gradient bg-clip-text text-transparent">Dossier</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
            Fine-tune your professional narrative and refine the neural matching accuracy of your trajectory.
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="accent"
            className="w-full lg:w-auto h-16 px-10 font-black rounded-2xl shadow-glow active:scale-95 transition-all"
          >
            <Edit3 size={18} className="mr-2" />
            Modify Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar: Profile Summary */}
        <div className="space-y-8">
          <Card className="p-10 text-center bg-surface/30 border-white/5 relative overflow-hidden group isolate">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-primary-500/20 via-primary-500/5 to-transparent -z-10" />

            <div className="relative z-10">
              <div className="relative inline-block mx-auto mb-8">
                <div className="w-40 h-40 rounded-[3rem] bg-background flex items-center justify-center text-text-muted border-4 border-white/5 shadow-2xl overflow-hidden group-hover:rotate-3 transition-transform duration-500">
                  {profile.profile_picture ? (
                    <img src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : <UserIcon size={64} className="opacity-20" />}
                </div>
                {profile.is_premium && (
                    <div className="absolute -bottom-2 right-2 bg-primary-500 text-white p-2 rounded-xl shadow-glow">
                        <Sparkles size={16} />
                    </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">
                {profile.full_name || user?.name || 'Pioneer'}
              </h2>
              <div className="inline-flex mt-4 px-4 py-1.5 bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary-500/20 shadow-sm">
                {profile.job_title || 'Career Explorer'}
              </div>

              <div className="mt-10 pt-10 border-t border-white/10 space-y-5">
                <div className="flex items-center gap-4 text-sm text-text-secondary font-bold group/link">
                  <div className="w-10 h-10 rounded-xl bg-background border border-white/5 flex items-center justify-center text-text-muted group-hover/link:text-primary-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary font-bold group/link">
                  <div className="w-10 h-10 rounded-xl bg-background border border-white/5 flex items-center justify-center text-text-muted group-hover/link:text-primary-400 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <span>{profile.location || 'Remote Sector'}</span>
                </div>
                
                {/* Links */}
                <div className="grid grid-cols-4 gap-3 pt-4">
                    {profile.github && (
                        <a href={`https://github.com/${profile.github}`} target="_blank" className="w-full aspect-square rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:border-primary-500 transition-all shadow-sm">
                           <Code2 size={20} />
                        </a>
                    )}
                    {profile.linkedin && (
                        <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" className="w-full aspect-square rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:border-blue-500 transition-all shadow-sm">
                           <Globe size={20} />
                        </a>
                    )}
                    {profile.portfolio && (
                        <a href={profile.portfolio} target="_blank" className="w-full aspect-square rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:border-emerald-500 transition-all shadow-sm">
                           <Globe size={20} />
                        </a>
                    )}
                    {profile.phone && (
                        <div className="w-full aspect-square rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-text-muted">
                           <Smartphone size={20} />
                        </div>
                    )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-950 p-10 rounded-[3rem] border border-white/10 shadow-glow relative overflow-hidden group isolate">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-8 flex items-center gap-3">
                  <Sparkles size={16} /> Potency Index
              </h3>
              <div className="text-6xl font-black mb-4 text-white tracking-tighter leading-none">{profile.is_premium ? '98' : '65'}<span className="text-2xl text-primary-500">%</span></div>
              <p className="text-sm text-text-muted font-bold leading-relaxed mb-10 italic">
                {profile.is_premium
                  ? "Neural synchronization active. You are competing at peak market effectiveness."
                  : "Initialize premium protocols to unlock elite sector matching and priority AI analysis."}
              </p>
              <div className="h-2.5 bg-background rounded-full overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: profile.is_premium ? '98%' : '65%' }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full premium-gradient shadow-glow" 
                />
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -z-10" />
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          <Card className="p-10 md:p-14 bg-surface/30 border-white/10 rounded-[3.5rem] shadow-premium">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                    key="edit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                >
                  <div className="flex items-center justify-between pb-8 border-b border-white/10">
                    <h3 className="text-2xl font-black text-white tracking-tight">Modify Identity</h3>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-surface rounded-xl text-text-muted transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Input
                      label="Full Identity"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="e.g. Alex Pioneer"
                    />
                    <Input
                      label="Professional Title"
                      value={profile.job_title}
                      onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                      placeholder="e.g. Lead Architect"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input
                      label="Experience (Years)"
                      type="number"
                      value={profile.experience_years}
                      onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      label="Location Sector"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                    <Input
                      label="Contact Frequency"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (xxx) xxx-xxxx"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input
                      label="LinkedIn Alias"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      icon={Globe}
                    />
                    <Input
                      label="GitHub Handle"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      icon={Code2}
                    />
                    <Input
                      label="Portfolio Hub"
                      value={profile.portfolio}
                      onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                      icon={Globe}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Professional Brief</label>
                    <textarea
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-[2rem] px-8 py-6 text-sm font-bold text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none shadow-inner"
                      placeholder="Explain your mission and technical achievements..."
                    />
                  </div>

                  <Input
                    label="Skill Signatures (Comma Separated)"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    placeholder="React, Next.js, AI, Distributed Systems..."
                    icon={Sparkles}
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-white/10">
                    <Button variant="ghost" className="h-14 font-black text-text-muted hover:text-white" onClick={() => setIsEditing(false)}>Dismiss</Button>
                    <Button
                      onClick={handleSave}
                      loading={loading}
                      size="lg"
                      className="h-16 px-12 font-black rounded-2xl shadow-glow"
                    >
                      <Save size={20} className="mr-2" />
                      Commit Changes
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                    key="view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-16"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center border border-primary-500/20 shadow-sm">
                        <Briefcase size={24} />
                      </div>
                      Professional Dossier
                    </h3>
                    <button onClick={() => setIsEditing(true)} className="w-14 h-14 bg-surface border border-white/5 rounded-2xl flex items-center justify-center text-text-muted hover:text-primary-400 hover:border-primary-400 transition-all duration-300 transform active:scale-90">
                      <Edit3 size={24} />
                    </button>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6">Briefing Narrative</h4>
                      <p className="text-text-secondary leading-relaxed font-bold text-xl italic opacity-90">
                        "{profile.bio || "Neural brief signature not found. Initialize profile description to enable AI semantic matching."}"
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8">Expertise Signatures</h4>
                      <div className="flex flex-wrap gap-3">
                        {skillsList.length > 0 ? skillsList.map((skill: string, i: number) => (
                          <span key={skill+i} className="px-6 py-3 bg-background border border-white/5 text-text-secondary rounded-2xl text-xs font-black uppercase tracking-widest hover:border-primary-500 hover:text-white transition-all transform-gpu hover:scale-105 cursor-default">
                            {skill}
                          </span>
                        )) : (
                          <p className="text-text-muted italic text-sm font-bold">No expertise signatures detected.</p>
                        )}
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* AI Insights / Recommended Jobs */}
          <section className="space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-3xl font-black text-white tracking-tight">Target Trajectories</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchMatchingJobs}
                loading={matchingLoading}
                className="text-[10px] font-black text-text-muted hover:text-primary-400 uppercase tracking-widest gap-2"
              >
                {!matchingLoading && <RefreshCw size={14} className="group-hover:rotate-180 transition-transform" />}
                Sync Field
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {matchingLoading ? (
                [...Array(2)].map((_, i) => <JobCardSkeleton key={i} />)
              ) : matchingJobs.length > 0 ? (
                matchingJobs.map((item) => (
                  <JobCard key={item.job?.id || item.id} job={item} onSelect={(j) => router.push(`/jobs/${j.id}`)} highlight />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    title="No strategic paths identified" 
                    description="Upload your latest professional footprint to unlock premium AI matching protocols."
                    actionText="Modify Identity"
                    onAction={() => setIsEditing(true)}
                  />
                </div>
              )}
            </div>

            {matchingJobs.length > 0 && (
              <div className="flex justify-center pt-8">
                <Link href="/jobs" className="group text-[10px] font-black text-text-muted hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 transition-all">
                  Explore full market field
                  <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Helper Link
const Link = ({ href, children, className }: any) => <a href={href} className={className}>{children}</a>;
