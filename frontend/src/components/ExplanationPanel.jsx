import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import Card from './ui/Card';
import { Sparkles, MessageSquare, Loader2, AlertCircle, Quote } from 'lucide-react';

const ExplanationPanel = ({ jobId, jobTitle }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchExplanation();
    }
  }, [jobId]);

  const fetchExplanation = async () => {
    setLoading(true);
    setExplanation(null);
    try {
      const data = await api.get(`/explanations/${jobId}`);
      setExplanation(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch explanation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Card className="p-8 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
      </div>
    </Card>
  );

  if (error) return (
    <Card className="p-8 border-dashed border-2 border-red-100 bg-red-50/30 text-center">
      <AlertCircle size={32} className="mx-auto text-red-400 mb-2 truncate" />
      <p className="text-xs font-bold text-red-800 mb-4">{error}</p>
      <button 
        onClick={fetchExplanation} 
        className="text-[10px] font-bold uppercase tracking-widest text-primary px-4 py-2 bg-white rounded-lg border border-primary/10 hover:bg-primary hover:text-white transition-smooth"
      >
        Retry Analysis
      </button>
    </Card>
  );

  if (!explanation && !loading) return null;

  return (
    <Card className="border-none shadow-none bg-primary/[0.03] rounded-3xl p-8 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 tracking-tight leading-tight">AI Insights</h3>
          <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mt-0.5">Why this matches you</p>
        </div>
      </div>

      <div className="relative">
        <Quote className="absolute -left-2 -top-2 text-primary/10" size={48} />
        <p className="text-sm leading-relaxed text-gray-700 italic font-medium relative z-10 pl-6">
          {explanation.explanation || "Our AI suggests that your background in frontend development and React perfectly aligns with the core requirements of this role."}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-primary/10 flex items-center gap-4">
        <div className="flex -space-x-2">
           <div className="w-8 h-8 rounded-full border-2 border-white bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">AI</div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified by Career AI</p>
      </div>
    </Card>
  );
};

export default ExplanationPanel;
