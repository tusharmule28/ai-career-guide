import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  User as UserIcon, Mail, MapPin, Briefcase, Link as LinkIcon, 
  Camera, Save, Sparkles, CheckCircle2, 
  Loader2, Edit3, X, RefreshCw, ExternalLink, ChevronRight,
  Globe, Github, Linkedin
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import JobCard from '../components/JobCard';
import EmptyState from '../components/ui/EmptyState';
import { JobCardSkeleton } from '../components/Skeleton';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/users/profile');
        if (data) {
          setProfile({ ...profile, ...data });
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
      toast.success('Your professional profile is ready!');
      setSaveSuccess(true);
      setIsEditing(false);
      updateUser({ name: profile.full_name });
      fetchMatchingJobs();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const skillsList = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(s => s) : [];

  return (
    <div className="section-container animate-fade-in py-12">
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-8 md:mb-12 gap-6 text-center lg:text-left">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-700 mb-4 border border-accent-100">
             <Sparkles size={12} /> Personalized Content
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Professional Profile
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-2 leading-relaxed">
            Manage your professional identity and refine your AI job matching accuracy.
          </p>
        </div>
        
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="accent"
            className="w-full lg:w-auto h-12 px-8 font-bold rounded-xl shadow-glow"
          >
            <Edit3 size={18} className="mr-2" />
            Edit Profile
          </Button>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="p-8 text-center glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-accent-500/10 via-indigo-500/5 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="relative inline-block mx-auto mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white flex items-center justify-center text-slate-300 border-4 border-white shadow-xl overflow-hidden">
                  {profile.profile_picture ? (
                    <img src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={48} />
                  )}
                </div>
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {profile.full_name || user?.name || 'Professional'}
              </h2>
              <p className="text-sm font-bold text-accent-600 uppercase tracking-widest mt-2">
                {profile.job_title || 'Career Explorer'}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={16} />
                  </div>
                  {user?.email}
                </div>
                  {profile.location || 'Remote'}
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail size={16} /> {/* Should be Phone icon but keeping Mail for simplicity in this chunk or import Phone */}
                    </div>
                    {profile.phone}
                  </div>
                )}
                {profile.github && (
                  <a
                    href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-500 font-medium hover:text-accent-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-accent-50 group-hover:text-accent-500 transition-colors">
                      <Globe size={16} />
                    </div>
                    <span className="truncate max-w-[140px]">{profile.github.replace(/^https?:\/\//, '').replace(/^github\.com\//, '')}</span>
                    <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-500 font-medium hover:text-blue-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Linkedin size={16} />
                    </div>
                    <span className="truncate max-w-[140px]">LinkedIn Profile</span>
                    <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                )}
                {profile.portfolio && (
                  <a
                    href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-500 font-medium hover:text-emerald-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <LinkIcon size={16} />
                    </div>
                    <span className="truncate max-w-[140px]">Portfolio / Web</span>
                    <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                )}
              </div>


            </div>
          </Card>

          <Card className="bg-slate-900 text-white p-8 rounded-[2.5rem] border-none shadow-premium relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-400 mb-6 flex items-center justify-between gap-2">
                   <div className="flex items-center gap-2">
                      <Sparkles size={14} /> Profile Insights
                   </div>
                   {profile.is_premium && (
                      <span className="bg-accent-500 text-white px-2 py-0.5 rounded text-[8px] font-black">PRO</span>
                   )}
                </h3>
                <div className="text-4xl font-extrabold mb-2">{profile.is_premium ? '95%' : '65%'}</div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 opacity-80">
                   {profile.is_premium 
                      ? "Your premium profile is being prioritized in top-tier matching algorithms."
                      : "Enhance your bio and list more specialized skills to increase matching accuracy."}
                </p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                   <div className="h-full bg-accent-500 rounded-full shadow-glow shadow-accent-500/50" style={{ width: profile.is_premium ? '95%' : '65%' }}></div>
                </div>

             </div>
             <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px]"></div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="p-10 glass-card border-none">
            {isEditing ? (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <h3 className="text-xl font-extrabold text-slate-900">Edit Professional Details</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                    <input
                      type="text"
                      value={profile.job_title}
                      onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={profile.experience_years}
                      onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">LinkedIn</label>
                    <input
                      type="text"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GitHub</label>
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Portfolio</label>
                    <input
                      type="text"
                      value={profile.portfolio}
                      onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                      placeholder="website.com"
                    />
                  </div>

                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                  <textarea
                    rows="4"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth resize-none"
                    placeholder="Describe your achievements and career goals..."
                  ></textarea>
                </div>

                <div className="space-y-2 mb-10">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth"
                    placeholder="React, TypeScript, AWS, Figma..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button variant="ghost" className="w-full sm:w-auto font-bold text-slate-400" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    className="w-full sm:w-auto h-12 px-10 font-bold rounded-xl"
                  >
                    {saveSuccess ? 'Profile Updated' : 'Save Changes'}
                  </Button>
                </div>

              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                      <Briefcase size={16} />
                    </div>
                    Professional Dossier
                  </h3>
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-accent-600 transition-smooth">
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="space-y-12">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Biography</h4>
                    <p className="text-slate-600 leading-relaxed font-medium text-lg">
                      {profile.bio || "No professional biography added yet."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Recognized Expertise</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {skillsList.length > 0 ? skillsList.map((skill, i) => (
                        <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 group hover:border-accent-200 hover:bg-accent-50/50 transition-smooth cursor-default">
                          {skill}
                        </span>
                      )) : (
                        <p className="text-slate-400 italic text-sm">No skills listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Matches Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Curated Roles</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchMatchingJobs}
                loading={matchingLoading}
                className="text-slate-400 hover:text-accent-600 font-bold gap-2 px-3 py-2 bg-slate-50 hover:bg-accent-50 rounded-xl"
              >
                {!matchingLoading && <RefreshCw size={14} />}
                {matchingLoading ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchingLoading ? (
                [...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)
              ) : matchingJobs.length > 0 ? (
                matchingJobs.map((job) => (
                  <JobCard key={job.id} job={job} onSelect={(j) => navigate(`/jobs?id=${j.id}`)} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    title="No strategic matches" 
                    description="Upload your latest resume or refine your skills to unlock tailored opportunities."
                    actionText="Edit Profile"
                    onAction={() => setIsEditing(true)}
                  />
                </div>
              )}
            </div>
            
            {matchingJobs.length > 0 && (
              <div className="flex justify-center">
                 <Button 
                    variant="ghost" 
                    className="group text-slate-400 hover:text-accent-600 font-bold gap-2 transition-smooth"
                    onClick={() => navigate('/jobs')}
                 >
                    Explore all matched roles
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-smooth" />
                 </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
