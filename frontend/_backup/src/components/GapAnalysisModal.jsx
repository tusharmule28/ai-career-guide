import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import Button from './ui/Button';

const GapAnalysisModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      handleAnalyze();
    }
  }, [isOpen]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/resumes/gap-analysis');
      setAnalysis(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume gap.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 text-accent-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">AI Resume Gap Analysis</h3>
              <p className="text-sm text-slate-500 font-medium">Market Readiness Review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 size={40} className="text-accent-500 animate-spin mb-4" />
              <p className="text-slate-600 font-bold">Our AI is analyzing your career trajectory...</p>
              <p className="text-slate-400 text-sm mt-2">Correlating your skills with current market demands</p>
            </div>
          ) : error ? (
            <div className="py-12 px-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
              <AlertCircle className="text-red-500 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-red-900">Analysis Failed</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={handleAnalyze}>Retry Analysis</Button>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-8 animate-fade-in">
              {/* Score Card */}
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[1.5rem] text-white overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Market Readiness</p>
                  <p className="text-4xl font-black">{analysis.readiness_score}%</p>
                </div>
                <div className="relative z-10 flex flex-col items-end">
                   <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-accent-500" style={{ width: `${analysis.readiness_score}%` }}></div>
                   </div>
                   <p className="text-[10px] font-bold text-accent-400">EXCELLED</p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl"></div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center text-[10px]">1</span>
                  Improvement Suggestions
                </h4>
                <ul className="space-y-3">
                  {analysis.improvement_suggestions?.map((item, i) => (
                    <li key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-slate-700 leading-relaxed list-none flex gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Keywords */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-6 h-6 bg-red-100 text-red-600 rounded-md flex items-center justify-center text-[10px]">2</span>
                   Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords?.map((keyword, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Structural Feedback */}
              <div className="p-6 bg-accent-50 rounded-2xl border border-accent-100">
                <h4 className="text-sm font-bold text-accent-700 flex items-center gap-2 mb-3">
                   <CheckCircle2 size={18} /> Structural Feedback
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed">{analysis.structural_feedback}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button onClick={onClose} className="px-8 h-12">Close Review</Button>
        </div>
      </div>
    </div>
  );
};

export default GapAnalysisModal;
