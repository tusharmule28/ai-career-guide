import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  Loader2, 
  Sparkles,
  Trash2,
  ChevronDown,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../utils/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    "Pending", "Applied", "Screened", "Interviewing", "Offered", "Rejected"
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}?status=${newStatus}`);
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Remove this application from your tracking?")) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (err) {
      alert('Failed to delete application: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'interviewing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'offered': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'screened': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredApps = applications.filter(app => 
    app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
            <Briefcase className="text-primary" size={40} />
            Application Hub
          </h1>
          <p className="text-gray-500 mt-3 md:text-lg max-w-xl">
            Track your applications and recruitment status.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 skeleton-pulse rounded-xl"></div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center glass-card border-dashed border-2">
          <div className="bg-gray-100 p-6 rounded-full text-gray-300 mb-6">
            <Clock size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
          <p className="text-gray-500 max-w-sm mb-8">
            {searchTerm ? "Try a different search term or clear filters." : "Start applying to roles that match your profile."}
          </p>
          <Button onClick={() => window.location.href = '/jobs'}>Explore Jobs</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card key={app.id} className="glass-card hover:translate-y-[-4px] group overflow-visible relative">
              <div className="flex justify-between items-start mb-4">
                <div className="relative group/select">
                  <select 
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`appearance-none cursor-pointer px-3 py-1 pr-8 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-smooth outline-none focus:ring-2 focus:ring-primary/20 ${getStatusColor(app.status)}`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-gray-400 font-medium">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => handleDelete(app.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-smooth"
                    title="Delete Entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                {app.job_title}
              </h3>
              <p className="text-primary font-bold text-sm mb-6 opacity-80 uppercase tracking-widest">{app.company}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <a 
                  href={app.apply_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-xs font-bold text-slate-500 hover:text-primary gap-1.5 transition-smooth bg-slate-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200"
                >
                  Verify Application <ExternalLink size={14} />
                </a>
                
                {app.status === 'Pending' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 animate-pulse">
                    <AlertCircle size={12} />
                    Needs Update
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Productivity Insight Section */}
      <div className="mt-16 bg-primary/90 rounded-2xl p-10 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} />
              AI Insight
            </div>
            <h2 className="text-3xl font-bold mb-4">You're a strong match for {applications[0]?.job_title || 'Software Engineering'} roles.</h2>
            <p className="text-primary-100 text-lg mb-8 opacity-90 leading-relaxed">
              Based on your recent applications, your profile aligns well with these positions.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-48 h-48 rounded-full border-8 border-white/20 flex items-center justify-center relative">
              <div className="text-center">
                <span className="text-5xl font-extrabold block">92</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Score</span>
              </div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-t-8 border-white rounded-full animate-spin duration-[3000ms]"></div>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>
      </div>
    </div>
  );
};

export default Applications;
