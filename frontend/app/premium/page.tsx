'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Rocket, 
  ArrowRight,
  Target,
  BarChart3,
  Bot
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const FeatureItem = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-[2rem] bg-surface/30 border border-white/5 hover:border-primary-500/30 transition-all duration-500 group"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
      <Icon className="text-primary-400" size={24} />
    </div>
    <h3 className="text-lg font-black text-white mb-2 tracking-tight">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed font-medium">
      {description}
    </p>
  </motion.div>
);

const PricingCard = ({ 
  tier, 
  price, 
  features, 
  bestValue = false,
  description
}: { 
  tier: string, 
  price: string, 
  features: string[], 
  bestValue?: boolean,
  description: string
}) => (
  <Card className={`relative overflow-hidden p-8 sm:p-10 flex flex-col h-full rounded-[3rem] ${bestValue ? 'ring-2 ring-primary-500/50 shadow-glow bg-surface/50' : 'bg-surface/30 border-white/5'}`}>
    {bestValue && (
      <div className="absolute top-6 right-6">
        <span className="px-3 py-1 rounded-full bg-primary-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
          Best Value
        </span>
      </div>
    )}
    
    <div className="mb-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-400 mb-2">{tier}</p>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-black text-white tracking-tighter">{price}</span>
        {price !== 'Free' && <span className="text-text-muted font-bold text-sm">/month</span>}
      </div>
      <p className="text-sm text-text-secondary font-medium leading-relaxed">
        {description}
      </p>
    </div>

    <div className="space-y-4 mb-10 flex-1">
      {features.map((feature, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <span className="text-sm text-text-secondary font-medium tracking-tight">{feature}</span>
        </div>
      ))}
    </div>

    <Button 
      variant={bestValue ? 'accent' : 'secondary'} 
      size="lg" 
      className="w-full rounded-2xl h-14 font-black text-base group"
    >
      {tier === 'Free' ? 'Current Plan' : 'Go Elite Now'}
      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
    </Button>
  </Card>
);

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-[120px] -z-10" />

      <div className="section-container relative z-10 pt-24 pb-32">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-black uppercase tracking-[0.2em] text-primary-400 mb-8">
              <Crown size={14} /> New: Alpha Trajectory Tracking
            </span>
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] sm:leading-[0.9]">
              Upgrade to <span className="text-transparent bg-clip-text premium-gradient">Elite</span> Access.
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary font-medium leading-relaxed mb-10 px-4">
              Stop guessing. Start winning. Elite members get 10x more visibility and AI-powered application strategies that land interviews.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          <FeatureItem 
            icon={Bot}
            title="Unlimited AI Strategy"
            description="Run deep analysis on every role. Get bespoke cover letters and skill-gap reports without limits."
          />
          <FeatureItem 
            icon={Target}
            title="Elite Match Priority"
            description="Our neural matching engine prioritizes Elite profiles, increasing your visibility to high-growth companies."
          />
          <FeatureItem 
            icon={BarChart3}
            title="Trajectory Tracking"
            description="Monitor your application progress with real-time analytics. Know exactly where you stand in the funnel."
          />
          <FeatureItem 
            icon={Zap}
            title="Instant Skill Backfill"
            description="One-click AI suggestions on how to bridge skill gaps and update your CV for specific high-value roles."
          />
          <FeatureItem 
            icon={ShieldCheck}
            title="Verified Credentials"
            description="Signal excellence with a verified profile badge that proves your skills have been vetted by our AI."
          />
          <FeatureItem 
            icon={Rocket}
            title="Career Concierge"
            description="Get priority support and strategic advice from our team to optimize your job-matching performance."
          />
        </div>

        {/* Pricing Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PricingCard 
              tier="Free"
              price="Free"
              description="Perfect for exploring the platform and finding your first few high-synergy matches."
              features={[
                "Basic neural job matching",
                "3 AI Strategy sessions per month",
                "Application tracking (Up to 5)",
                "Standard profile visibility",
                "Community support"
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <PricingCard 
              tier="Elite"
              price="$19"
              bestValue={true}
              description="For serious candidates who want to dominate their career trajectory with AI-powered tools."
              features={[
                "Unlimited AI Strategy sessions",
                "Priority neural matching",
                "Alpha Trajectory analytics",
                "Bespoke cover letter generator",
                "Verified profile badge",
                "Early access to new features"
              ]}
            />
          </motion.div>
        </div>

        {/* FAQ Shortcut */}
        <div className="mt-24 text-center">
          <p className="text-text-muted text-sm font-bold tracking-tight mb-4">
            Trusted by 5,000+ developers at top tech companies.
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos if needed */}
             <div className="text-xl font-black">TECHCORP</div>
             <div className="text-xl font-black">CLOUDCORE</div>
             <div className="text-xl font-black">AI SOLUTIONS</div>
             <div className="text-xl font-black">DATASYS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
