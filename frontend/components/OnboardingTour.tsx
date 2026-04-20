'use client';

import React, { useEffect, useState } from 'react';
import { Joyride, EventData, ACTIONS, EVENTS, STATUS, Step } from 'react-joyride';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingTour() {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if user is logged in and hasn't seen the tour yet
    const hasSeenTour = localStorage.getItem('onboarding_completed');
    if (user && !hasSeenTour) {
      setRun(true);
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="p-4">
          <h3 className="text-xl font-black mb-2">Welcome to the Command Center!</h3>
          <p className="text-sm">Let\'s take a quick look at your new AI-powered career trajectory hub.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '#resume-upload-section',
      content: (
        <div className="p-2">
          <h4 className="font-bold mb-1">Trajectory Sync</h4>
          <p className="text-xs">Upload your resume here to initialize AI matching protocols. We analyze your skills with neural precision.</p>
        </div>
      ),
    },
    {
      target: '#job-matches-section',
      content: (
        <div className="p-2">
          <h4 className="font-bold mb-1">Strategic Matches</h4>
          <p className="text-xs">Your personalized job feed. We flag roles with high matching potency based on your unique profile.</p>
        </div>
      ),
    },
    {
      target: '#skill-gap-section',
      content: (
        <div className="p-2">
          <h4 className="font-bold mb-1">AI Precision Analysis</h4>
          <p className="text-xs">Execute a deep scan to discover exactly which skills you need to reach 100% synergy with your target roles.</p>
        </div>
      ),
    },
    {
        target: '#profile-settings-nav',
        content: (
          <div className="p-2">
            <h4 className="font-bold mb-1">Refine Identity</h4>
            <p className="text-xs">Update your professional coordinates and social links anytime to keep your trajectory accurate.</p>
          </div>
        ),
      },
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem('onboarding_completed', 'true');
      setRun(false);
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        arrowColor: '#0f172a',
        backgroundColor: '#0f172a',
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        primaryColor: '#6366f1',
        textColor: '#ffffff',
        zIndex: 1000,
        showProgress: true,
        buttons: ['back', 'primary', 'skip'], 
      }}
      styles={{
        tooltipContainer: {
          textAlign: 'left',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '10px',
        },
        buttonPrimary: {
          borderRadius: '0.75rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '0.1em',
        },
        buttonBack: {
          color: '#94a3b8',
          fontWeight: '700',
          fontSize: '12px',
        },
        buttonSkip: {
            color: '#94a3b8',
            fontSize: '12px',
        }
      }}
    />
  );
}
