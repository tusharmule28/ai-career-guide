import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle, Crown, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { api } from '../utils/api';
import type { ApplyWithAIResult, Job } from '../types/api';

interface ApplyWithAIBtnProps {
  job: Job;
  creditsRemaining: number;
  isPremium: boolean;
  onCreditsUsed?: (newCount: number) => void;
}

type ModalState = 'idle' | 'loading' | 'success' | 'error' | 'no_credits';

const MatchGauge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="36" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="45" cy="45" r="36"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-slate-400">/ 100</span>
      </div>
      <span className="text-xs text-slate-400 mt-1">Match Score</span>
    </div>
  );
};

const SkillBadge: React.FC<{ label: string; variant: 'match' | 'gap' }> = ({ label, variant }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    variant === 'match' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50' : 'bg-rose-900/50 text-rose-300 border border-rose-700/50'
  }`}>
    {label}
  </span>
);

const ApplyWithAIModal: React.FC<{
  result: ApplyWithAIResult;
  job: Job;
  onClose: () => void;
}> = ({ result, job, onClose }) => {
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-[#0f172a] z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Apply with AI</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Job + Match Score */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{job.title}</h3>
              <p className="text-sm text-slate-400">{job.company}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{result.match_rationale}</p>
            </div>
            <MatchGauge score={result.match_score} />
          </div>

          {/* Skills */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-2">✓ Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_skills.length ? result.matched_skills.map(s => (
                  <SkillBadge key={s} label={s} variant="match" />
                )) : <span className="text-xs text-slate-500">None detected</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-400 mb-2">✗ Skill Gaps</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills.length ? result.missing_skills.map(s => (
                  <SkillBadge key={s} label={s} variant="gap" />
                )) : <span className="text-xs text-slate-500">No gaps found!</span>}
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-slate-900 rounded-xl border border-slate-800">
            <div
              className="flex items-center justify-between p-4 cursor-pointer select-none"
              onClick={() => setCoverLetterExpanded(!coverLetterExpanded)}
            >
              <span className="text-sm font-semibold text-white">AI-Generated Cover Letter</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                {coverLetterExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            {coverLetterExpanded && (
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.cover_letter}</p>
              </div>
            )}
          </div>

          {/* Pre-fill Data */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Pre-filled Application Data</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.pre_fill_data).filter(([, v]) => v).map(([key, value]) => (
                <div key={key} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 capitalize mb-0.5">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-slate-200 truncate">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Credits & Apply Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              {result.credits_remaining === -1
                ? '✨ Premium — Unlimited Access'
                : `${result.credits_remaining} free credit${result.credits_remaining !== 1 ? 's' : ''} remaining`}
            </p>
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Apply Manually →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ApplyWithAIBtn: React.FC<ApplyWithAIBtnProps> = ({
  job,
  creditsRemaining,
  isPremium,
  onCreditsUsed,
}) => {
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [result, setResult] = useState<ApplyWithAIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const hasAccess = isPremium || creditsRemaining > 0;

  const handleClick = async () => {
    if (!hasAccess) {
      setModalState('no_credits');
      return;
    }
    setModalState('loading');
    try {
      const data = await api.post('/agent/apply-with-ai', { job_id: job.id }) as ApplyWithAIResult;
      setResult(data);
      setModalState('success');
      if (onCreditsUsed && data.credits_remaining !== -1) {
        onCreditsUsed(data.credits_remaining);
      }
    } catch (err: any) {
      if (err.message?.includes('402') || err.message?.toLowerCase().includes('credit')) {
        setModalState('no_credits');
      } else {
        setErrorMsg(err.message || 'Something went wrong.');
        setModalState('error');
      }
    }
  };

  return (
    <>
      {/* The trigger button */}
      <button
        onClick={handleClick}
        disabled={modalState === 'loading'}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg
          ${hasAccess
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white hover:scale-105'
            : 'bg-slate-800 text-slate-400 cursor-default border border-slate-700'
          }`}
      >
        {modalState === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {modalState === 'loading' ? 'Analyzing...' : 'Apply with AI'}
        {!isPremium && creditsRemaining > 0 && (
          <span className="absolute -top-2 -right-2 bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {creditsRemaining}
          </span>
        )}
        {isPremium && (
          <Crown className="w-3 h-3 text-yellow-400" />
        )}
      </button>

      {/* Success Modal */}
      {modalState === 'success' && result && (
        <ApplyWithAIModal
          result={result}
          job={job}
          onClose={() => setModalState('idle')}
        />
      )}

      {/* No Credits Modal */}
      {modalState === 'no_credits' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-violet-800/40 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Upgrade to Premium</h3>
            <p className="text-slate-400 text-sm mb-6">
              You've used your 3 free AI credits. Upgrade for unlimited AI-powered applications.
            </p>
            <div className="space-y-3">
              <div className="bg-slate-900 border border-violet-700/30 rounded-xl p-4 text-left">
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-400" /> Unlimited Apply with AI</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-400" /> Priority job matching</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-violet-400" /> Advanced skill gap reports</li>
                </ul>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Auto Apply <span className="text-yellow-300">(Premium)</span>
              </button>
              <button onClick={() => setModalState('idle')} className="w-full py-2 text-slate-400 text-sm hover:text-white transition-colors">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {modalState === 'error' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-rose-800/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
            <p className="text-slate-400 text-sm mb-4">{errorMsg}</p>
            <button onClick={() => setModalState('idle')} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyWithAIBtn;
