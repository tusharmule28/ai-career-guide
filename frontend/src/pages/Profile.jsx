import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, MapPin, Briefcase, Link as LinkIcon, Camera, Save, Sparkles, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    // Fetch detailed profile info if needed
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      // API call to update profile
      await api.post('/users/profile/update', profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Profile Sidebar */}
        <div className="lg:w-1/3 flex flex-col gap-8">
          <Card className="text-center p-8 bg-white/50 backdrop-blur-xl border border-white shadow-premium">
            <div className="relative inline-block mx-auto mb-6 group">
              <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-xl overflow-hidden">
                {profile.profile_picture ? (
                   <img src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   <UserIcon size={48} />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-smooth opacity-0 group-hover:opacity-100">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-primary transition-colors">{user?.name || 'Your Profile'}</h2>
            <p className="text-sm font-semibold text-primary/70 uppercase tracking-widest mt-1">Career Explorer</p>
            
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                 <Mail size={16} className="text-gray-400" /> {user?.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                 <MapPin size={16} className="text-gray-400" /> {profile.location || 'India'}
              </div>
            </div>
          </Card>

          <Card className="bg-primary/5 border-none p-6 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                 <Sparkles size={18} className="text-primary" />
                 Profile Strength
               </h3>
               <div className="mt-4 flex items-center gap-4">
                 <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                   <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                 </div>
                 <span className="text-sm font-bold text-primary">65%</span>
               </div>
               <p className="text-xs text-gray-500 mt-4 font-medium leading-relaxed italic opacity-80">
                 Adding your social links will help our AI map your network and improve matching.
               </p>
             </div>
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="lg:w-2/3 space-y-8">
          <Card className="p-8 glass-card border-none">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Briefcase size={20} className="text-primary" /> Professional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                  placeholder="e.g. Tushar Mule"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Job Title</label>
                <input 
                  type="text" 
                  value={profile.job_title}
                  onChange={(e) => setProfile({...profile, job_title: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                <input 
                  type="text" 
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                  placeholder="e.g. Bangalore, India"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">LinkedIn Profile</label>
                <input 
                  type="text" 
                  value={profile.linkedin}
                  onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Professional Bio</label>
              <textarea 
                rows="4"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth"
                placeholder="Briefly describe your career journey and goals..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
               <Button variant="ghost" className="text-gray-400">Discard Changes</Button>
               <Button 
                onClick={handleSave} 
                loading={loading}
                icon={saveSuccess ? CheckCircle2 : Save}
                className={saveSuccess ? 'bg-green-600 border-green-600' : ''}
              >
                {loading ? 'Saving...' : saveSuccess ? 'Profile Updated' : 'Save Profile'}
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-none bg-accent/5">
             <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={20} className="text-accent" />
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Market Readiness</h3>
             </div>
             <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
               Our AI analysis of your skills vs. live market trends in <span className="font-bold text-accent">Software Engineering</span>.
             </p>
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">
                      <span>React & Frontend</span>
                      <span className="text-accent">High Demand</span>
                   </div>
                   <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-1000 delay-300" style={{ width: '85%' }}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">
                      <span>Cloud Architecture</span>
                      <span className="text-accent">Growing</span>
                   </div>
                   <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-1000 delay-500" style={{ width: '62%' }}></div>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
