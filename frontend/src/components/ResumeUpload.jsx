import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.upload('/resumes/upload', formData);
      setSuccess(true);
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF file.');
    }
  }, []);

  return (
    <div className="section-container animate-fade-in py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-700 mb-6 border border-accent-100">
           <Sparkles size={12} /> AI Knowledge Extraction
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Neural Resume Analysis
        </h1>
        <p className="text-slate-500 font-medium mt-3 max-w-xl mx-auto leading-relaxed">
          Our advanced NLP engine will map your professional experience against thousands of live roles to find your perfect strategic alignment.
        </p>
        
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100/50">
           <ShieldCheck size={14} />
           Your data is 100% private & encrypted
        </div>
      </div>

      <Card className="max-w-3xl mx-auto p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-xl relative overflow-hidden group hover:border-accent-500/50 transition-smooth">
        <div 
          onClick={!file && !success ? () => fileInputRef.current?.click() : undefined}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center py-10 ${!file && !success ? 'cursor-pointer' : ''}`}
        >
          {!file && !success && (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-smooth">
                <Upload size={32} strokeWidth={2.5} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-2">Drop your resume here</p>
              <p className="text-slate-400 font-bold text-sm mb-10 tracking-wide uppercase">PDF Format • Max 10MB</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
              <Button variant="secondary" className="px-10 h-12 font-black rounded-xl border-slate-200">
                Browse Filesystem
              </Button>
            </div>
          )}

          {file && !success && (
            <div className="w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-premium mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-50 rounded-xl text-accent-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-500 transition-smooth"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleUpload} 
                  loading={loading}
                  variant="accent"
                  className="w-full h-14 text-base font-black rounded-xl shadow-glow"
                  icon={Sparkles}
                >
                  {loading ? 'Initializing Analysis...' : 'Begin AI Extraction'}
                </Button>
                {!loading && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setFile(null)}
                    className="font-bold text-slate-400"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mb-8 mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Alignment Successful</h2>
              <p className="text-slate-500 font-medium">Your professional profile is being optimized for current openings.</p>
              <div className="mt-8 flex items-center justify-center gap-3 text-accent-600 font-bold">
                 <Loader2 size={18} className="animate-spin" />
                 <span className="text-sm tracking-wide uppercase">Mapping matches...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold uppercase tracking-widest rounded-xl animate-shake">
              <X size={16} />
              {error}
            </div>
          )}
        </div>
      </Card>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {[
          { title: "Deep Extraction", desc: "Recognizes non-standard achievements and complex project trajectories." },
          { title: "Skill-Gap Audit", desc: "Identifies specific certifications or technologies to boost your salary." },
          { title: "Priority Queue", desc: "Analyzed profiles get fast-tracked to recruiter-priority job matches." }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center px-4">
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-accent-600 mb-6">
                <Sparkles size={20} />
             </div>
             <h4 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">{item.title}</h4>
             <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeUpload;
