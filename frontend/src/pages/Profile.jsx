import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User as UserIcon, Mail, MapPin, Briefcase, Link as LinkIcon, 
  Camera, Save, Sparkles, TrendingUp, CheckCircle2, AlertCircle, 
  Loader2, Edit3, X, RefreshCw, ExternalLink, ChevronRight, Bookmark,
  Calendar, Building2, Globe
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import JobCard from '../components/JobCard';

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
    linkedin: ''
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  
  // Matching Jobs State
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    // Fetch detailed profile info
    const fetchProfile = async () => {
      try {
        const data = await api.get('/users/profile');
        if (data) {
          // Merge with initial state to ensure all fields are present
          const mergedProfile = { ...profile, ...data };
          setProfile(mergedProfile);
          
          // If we got a name back, it's not a brand new profile
          if (data.full_name || data.bio || data.job_title) {
            setIsNewUser(false);
          }
          
          // Fetch initial matches
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
      const data = await api.post('/users/profile/update', profile);
      toast.success(isNewUser ? 'Profile created successfully!' : 'Profile updated successfully!');
      setIsNewUser(false);
      setSaveSuccess(true);
      setIsEditing(false); // Close edit mode on success
      
      // Update AuthContext so Navbar updates
      updateUser({ name: profile.full_name });
      
      // Trigger new match automatically
      fetchMatchingJobs();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // If cancelling, maybe re-fetch or just revert state? 
      // For simplicity, we'll just toggle. In a real app, you'd want to reset to original data.
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section with Welcome message */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Your Profile
            <span className="text-xs font-bold uppercase tracking-[0.2em] bg-accent-50 text-accent-600 px-3 py-1 rounded-full border border-accent-100/50">
              {isNewUser ? 'New Account' : 'Verified Professional'}
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage your professional identity and get AI-powered career matches.</p>
        </div>
        
        {!isEditing && (
          <Button 
            onClick={toggleEdit}
            variant="accent"
            icon={Edit3}
            className="shadow-glow"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Profile Sidebar */}
        <div className="lg:w-1/3 flex flex-col gap-8">
          <Card className="text-center p-8 bg-white/50 backdrop-blur-xl border border-white shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="relative inline-block mx-auto mb-6">
                <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-smooth">
                  {profile.profile_picture ? (
                    <img src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={48} />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-smooth">
                    <Camera size={18} />
                  </button>
                )}
              </div>
              
              <h2 className="text-2xl font-extrabold text-gray-900">{profile.full_name || user?.name || 'Your Profile'}</h2>
              <p className="text-sm font-bold text-primary/70 uppercase tracking-widest mt-1">{profile.job_title || 'Career Explorer'}</p>

              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <Mail size={16} className="text-primary/60" /> {user?.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <MapPin size={16} className="text-primary/60" /> {profile.location || 'India'}
                </div>
                {profile.linkedin && (
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium overflow-hidden">
                    <Globe size={16} className="text-primary/60" /> 
                    <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="truncate hover:text-primary transition-colors">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {profile.github && (
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium overflow-hidden">
                     <LinkIcon size={16} className="text-primary/60" /> 
                     <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="truncate hover:text-primary transition-colors">
                      GitHub Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-primary/5 border-none p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-primary group-hover:animate-pulse" />
                Profile Strength
              </h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-bold text-primary">65%</span>
              </div>
              <p className="text-xs text-gray-500 mt-4 font-medium leading-relaxed italic opacity-80">
                A stronger profile ensures higher match accuracy for the latest jobs.
              </p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="lg:w-2/3 space-y-8">
          
          <Card className="p-8 glass-card border-none relative">
            {isEditing ? (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Edit3 size={20} className="text-primary" /> Edit Professional Details
                  </div>
                  <Button variant="ghost" size="sm" onClick={toggleEdit} className="text-slate-400 p-0 hover:bg-transparent">
                    <X size={20} />
                  </Button>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Job Title</label>
                    <input
                      type="text"
                      value={profile.job_title}
                      onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                      placeholder="Your professional job title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                      placeholder="URL to your LinkedIn profile"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Professional Bio</label>
                  <textarea
                    rows="4"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                    placeholder="Briefly describe your career journey and goals..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                  <Button variant="ghost" className="text-gray-400" onClick={toggleEdit}>Cancel</Button>
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    icon={saveSuccess ? CheckCircle2 : Save}
                    className={saveSuccess ? 'bg-green-600 border-green-600' : ''}
                  >
                    {loading ? 'Processing...' : saveSuccess ? 'Profile Updated' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase size={20} className="text-primary" /> Professional Identity
                  </h3>
                  <button onClick={toggleEdit} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-smooth">
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="space-y-10">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4">About You</label>
                    <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-line">
                      {profile.bio || "No professional bio added yet. Tell us about your journey to improve job matching."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4 font-black">Role & Industry</label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                             <Briefcase size={16} />
                          </div>
                          <span className="font-bold text-slate-800">{profile.job_title || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                             <MapPin size={16} />
                          </div>
                          <span className="font-bold text-slate-800">{profile.location || 'India'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4">Network & Socials</label>
                      <div className="space-y-3">
                        {profile.linkedin ? (
                          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-smooth">
                               <Globe size={16} />
                            </div>
                            <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">LinkedIn Profile</span>
                            <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-smooth" />
                          </a>
                        ) : <span className="text-slate-400 text-sm italic">No LinkedIn linked</span>}
                        {profile.github ? (
                           <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-smooth">
                                 <LinkIcon size={16} />
                              </div>
                              <span className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors">GitHub Profile</span>
                              <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-smooth" />
                           </a>
                        ) : <span className="text-slate-400 text-sm italic">No GitHub linked</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Fresh Matching Jobs Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center shadow-sm">
                  <Sparkles size={20} className={matchingLoading ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Fresh Matches for You</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Based on your Profile + Context</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchMatchingJobs}
                loading={matchingLoading}
                className="text-slate-500 hover:text-accent-600 gap-2 font-bold px-3 py-2 bg-slate-50 hover:bg-accent-50 rounded-xl"
              >
                {!matchingLoading && <RefreshCw size={14} />}
                {matchingLoading ? 'Syncing...' : 'Refresh Matches'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchingLoading && Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-[280px] rounded-3xl bg-slate-100/50 animate-pulse border-2 border-slate-50 border-dashed"></div>
              ))}
              
              {!matchingLoading && matchingJobs.length > 0 ? (
                matchingJobs.map((job) => (
                  <JobCard key={job.job_id} job={job} onSelect={() => window.open(job.apply_url, '_blank')} />
                ))
              ) : !matchingLoading && (
                <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-slate-100 border-dashed flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <Briefcase size={32} />
                   </div>
                   <div className="max-w-xs">
                    <p className="text-slate-900 font-black text-lg">No matches yet</p>
                    <p className="text-slate-500 font-medium text-sm mt-1">Complete your profile or upload a resume to unlock fresh AI matches.</p>
                   </div>
                   <Button variant="accent" size="sm" onClick={() => setIsEditing(true)}>Get Started</Button>
                </div>
              )}
            </div>
            
            {matchingJobs.length > 0 && (
              <div className="flex justify-center pt-2">
                 <Button variant="ghost" className="group text-slate-400 font-bold gap-2">
                    View All Suggested Matches
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
