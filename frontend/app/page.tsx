'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Rocket, UploadCloud, BrainCircuit, Target, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import Button, { cn } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-accent-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-border/50 text-text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-8 shadow-inner"
          >
            <Sparkles size={14} className="text-primary-400" />
            Next-Gen Job Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] md:leading-[0.85]"
          >
            Find your next <br className="hidden lg:block" />
            <span className="premium-gradient bg-clip-text text-transparent">
              role, faster
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
          >
            The world's first AI-native job matching platform that analyzes your DNA (skills) to find your perfect professional home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {!user ? (
              <>
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="h-16 px-10 text-lg w-full sm:min-w-[220px] rounded-[2rem] shadow-glow hover:scale-105 active:scale-95 transition-all font-black">
                    Start Matching <Rocket size={20} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="h-16 px-8 text-lg w-full border border-border/50 hover:bg-surface rounded-[2rem] font-bold">
                    Existing Access
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="h-16 px-10 text-lg w-full shadow-glow rounded-[2rem] font-black">
                  Resume Dashboard <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-surface/30 py-32 border-y border-border/50 backdrop-blur-sm">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Built for modern talent</h2>
            <p className="text-text-secondary font-bold text-lg leading-relaxed italic opacity-80">Stop applying. Start matching. Our AI does the heavy lifting so you can focus on your interview.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Instant Extraction',
                description: 'We analyze your resume in milliseconds using advanced OCR and semantic understanding.',
                icon: UploadCloud,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10'
              },
              {
                title: 'Semantic Synergy',
                description: 'We match you based on context, project impact, and potential—not just keywords.',
                icon: BrainCircuit,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10'
              },
              {
                title: 'Precision Scoring',
                description: 'Receive role suggestions with detailed match scores and personalized strategy reports.',
                icon: Target,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10'
              }
            ].map((feature, idx) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={idx}
                className="bg-surface/50 p-10 rounded-[2.5rem] border border-border/50 shadow-soft hover:shadow-premium hover:border-primary-400/30 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={cn("w-14 h-14 rounded-2xl mb-8 flex items-center justify-center border border-white/5", feature.bg, feature.color)}>
                  <feature.icon size={32} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed font-bold text-sm mb-8">{feature.description}</p>
                <Link
                  href={user ? "/jobs" : "/signup"}
                  className="flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest group-hover:gap-3 transition-all"
                >
                  Explore Technology <ChevronRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 section-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="premium-gradient rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">The future of job <br className="hidden md:block" /> hunting is AI.</h2>
            <p className="text-white/80 text-lg mb-12 font-bold max-w-md mx-auto">Join 10,000+ engineers finding their dream roles through intelligent matching.</p>
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-lg rounded-[2rem] bg-white text-black hover:bg-slate-100 shadow-2xl font-black transition-all hover:scale-105 active:scale-95">
                Join the Elite Platform
              </Button>
            </Link>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] -ml-48 -mb-48" />
        </motion.div>
      </section>
    </div>
  );
}
