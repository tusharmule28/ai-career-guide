import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import Card from './ui/Card';
import { Lightbulb, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

const SkillGap = ({ jobId, jobTitle }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchSkillGap();
    }
  }, [jobId]);

  const fetchSkillGap = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const data = await api.get(`/skills/gap/${jobId}`);
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch skill gap analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Card className="flex items-center justify-center py-10 animate-pulse">
      <Loader2 size={24} className="animate-spin text-primary/50 mr-3" />
      <span className="text-gray-400 font-medium">Analyzing skill set...</span>
    </Card>
  );

  if (error) return (
    <Card className="bg-red-50 border-red-100 flex items-start gap-3 p-4">
      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
      <p className="text-sm text-red-600 font-medium">{error}</p>
    </Card>
  );

  if (!analysis) return null;

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-primary" />
        <h3 className="font-extrabold text-gray-900 tracking-tight">AI Skill Gap Analysis</h3>
      </div>

      <div className="space-y-6">
        {/* Matched Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} />
            Skills You Have
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_skills?.map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 shadow-sm transition-smooth hover:scale-105"
              >
                {skill}
              </span>
            ))}
            {(!analysis.matched_skills || analysis.matched_skills.length === 0) && (
              <p className="text-xs text-gray-400 italic font-medium">None detected from your resume.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
            <AlertCircle size={14} />
            Missing for this Role
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills?.map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10 shadow-sm transition-smooth hover:scale-105"
              >
                {skill}
              </span>
            ))}
            {(!analysis.missing_skills || analysis.missing_skills.length === 0) && (
              <p className="text-xs text-gray-400 italic font-medium">Your skills are a perfect match!</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="pt-4 bg-gray-50 -mx-6 px-6 pb-6 mt-4 border-t border-gray-100">
          <div className="flex items-start gap-3 mt-4">
            <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1 leading-tight">Focus Recommendation</p>
              <p className="text-xs text-gray-500 italic font-medium">
                {analysis.recommendation || `Adding projects using ${analysis.missing_skills?.[0] || 'the above skills'} would increase your match score significantly.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SkillGap;
