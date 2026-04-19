'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';

// Detect iOS (Safari doesn't fire beforeinstallprompt)
const isIOS = () =>
  typeof navigator !== 'undefined' &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(window as any).MSStream;

const isInStandaloneMode = () =>
  typeof window !== 'undefined' &&
  (('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches);

const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISSED_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed — don't show
    if (isInStandaloneMode()) return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < DISMISSED_EXPIRY) return;

    const ios = isIOS();
    setIsIOSDevice(ios);

    if (ios) {
      // iOS: show manual install guide after 3 seconds
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    // Chrome/Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show our custom prompt after a short delay (not immediately)
      setTimeout(() => setShow(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShow(false);
      setInstalled(true);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
    if (outcome === 'accepted') setInstalled(true);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-[360px] z-[300]"
        >
          <div className="relative bg-[#111827] border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden">
            {/* Gradient accent strip */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500" />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3.5 mb-4">
                {/* App icon */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/icon-192x192.png"
                    alt="CareerGuide AI"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-0.5">
                    Install App
                  </p>
                  <h3 className="text-base font-black text-white leading-tight tracking-tight">
                    CareerGuide AI
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Add to your home screen for the best experience
                  </p>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Benefits row */}
              <div className="flex gap-3 mb-4">
                {['Works offline', 'Instant access', 'Job alerts'].map((b) => (
                  <div
                    key={b}
                    className="flex-1 text-center py-2 bg-white/[0.04] rounded-xl border border-white/5"
                  >
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-tight">
                      {b}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isIOSDevice ? (
                // iOS manual instructions
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-3 bg-white/[0.04] rounded-xl border border-white/5">
                    <Share size={15} className="text-primary-400 shrink-0" />
                    <p className="text-[11px] text-slate-300 font-medium leading-snug">
                      Tap the <span className="font-black text-white">Share</span> button in Safari
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 bg-white/[0.04] rounded-xl border border-white/5">
                    <Plus size={15} className="text-primary-400 shrink-0" />
                    <p className="text-[11px] text-slate-300 font-medium leading-snug">
                      Then tap <span className="font-black text-white">"Add to Home Screen"</span>
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="w-full mt-1 h-10 rounded-xl text-[11px] font-black text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
                  >
                    Maybe later
                  </button>
                </div>
              ) : (
                // Chrome / Android / Desktop
                <div className="flex gap-2.5">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 h-11 rounded-xl border border-white/10 text-[11px] font-black text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all uppercase tracking-wider"
                  >
                    Not now
                  </button>
                  <button
                    onClick={handleInstall}
                    className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[12px] font-black tracking-wide flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-glow"
                  >
                    <Download size={14} />
                    Install App
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
