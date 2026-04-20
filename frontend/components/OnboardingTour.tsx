'use client';

import React, { useEffect, useState } from 'react';
import {
  Joyride,
  STATUS,
  Step,
  ACTIONS,
  EVENTS,
  EventData,
} from 'react-joyride';
import { useAuth } from '@/lib/auth-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tourSteps: any[] = [
  {
    target: 'body',
    content: (
      <div className="p-4">
        <h3 className="text-xl font-black mb-2">👋 Welcome to CareerGuide AI!</h3>
        <p className="text-sm leading-relaxed">Let&apos;s take a quick 30-second tour of your AI-powered career command center.</p>
      </div>
    ),
    placement: 'center',
    skipBeacon: true,
  },
  {
    target: '#resume-upload-section',
    content: (
      <div className="p-2">
        <h4 className="font-black text-base mb-2">📄 Step 1: Upload Your Resume</h4>
        <p className="text-sm leading-relaxed">Upload your PDF resume here. Our AI will extract your skills, experience, and generate matching scores for every job automatically.</p>
      </div>
    ),
    skipBeacon: true,
  },
  {
    target: '#job-matches-section',
    content: (
      <div className="p-2">
        <h4 className="font-black text-base mb-2">🎯 Step 2: View Your Best Matches</h4>
        <p className="text-sm leading-relaxed">See your top-matched jobs ranked by AI. Each card shows your match score, required skills, and why it&apos;s a fit for you.</p>
      </div>
    ),
    skipBeacon: true,
  },
  {
    target: '#skill-gap-section',
    content: (
      <div className="p-2">
        <h4 className="font-black text-base mb-2">🤖 Step 3: Apply with AI Assistance</h4>
        <p className="text-sm leading-relaxed">Use &quot;AI Apply&quot; to get a tailored cover letter generated from your resume and the job description. Or use &quot;Quick Apply&quot; to apply manually — always free, no limits.</p>
      </div>
    ),
    skipBeacon: true,
  },
  {
    target: '#profile-settings-nav',
    content: (
      <div className="p-2">
        <h4 className="font-black text-base mb-2">✏️ Step 4: Keep Your Profile Updated</h4>
        <p className="text-sm leading-relaxed">Update your location, skills, experience, and designation anytime. Profile changes immediately improve your match scores.</p>
      </div>
    ),
    skipBeacon: true,
  },
];

export default function OnboardingTour() {
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (user) {
      const hasSeenTour = localStorage.getItem('onboarding_completed_v2');
      if (!hasSeenTour) {
        // Small delay to let the page render fully before starting
        const t = setTimeout(() => setRun(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, [user]);

  const handleCallback = (data: EventData) => {
    const { status, action, index, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      localStorage.setItem('onboarding_completed_v2', 'true');
      setRun(false);
      setStepIndex(0);
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }
  };

  return (
    <>
      <Joyride
        onEvent={handleCallback}
        continuous
        run={run}
        scrollToFirstStep
        stepIndex={stepIndex}
        steps={tourSteps}
        options={{
          arrowColor: '#0f172a',
          backgroundColor: '#0f172a',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: '#6366f1',
          textColor: '#ffffff',
          zIndex: 9999,
          showProgress: true,
          overlayClickAction: false,
          buttons: ['back', 'close', 'primary', 'skip'],
        }}
        styles={{
          tooltip: {
            borderRadius: '1.5rem',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '8px',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonPrimary: {
            borderRadius: '0.75rem',
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            fontSize: '11px',
            letterSpacing: '0.1em',
            padding: '10px 18px',
          },
          buttonBack: {
            color: '#94a3b8',
            fontWeight: 700,
            fontSize: '12px',
          },
          buttonSkip: {
            color: '#64748b',
            fontSize: '11px',
            fontWeight: 700,
          },
          buttonClose: {
            color: '#94a3b8',
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish Tour',
          next: 'Next →',
          open: 'Open',
          skip: 'Skip Tour',
        }}
      />

      {/* Replay Tour Button — visible after tour is completed */}
      {!run && typeof window !== 'undefined' && localStorage.getItem('onboarding_completed_v2') && (
        <button
          onClick={() => {
            setStepIndex(0);
            setRun(true);
          }}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-lg hover:bg-indigo-500 active:scale-95 transition-all"
          title="Replay Tutorial"
        >
          ?
        </button>
      )}
    </>
  );
}
