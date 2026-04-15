'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Mail, Lock, User, UserPlus, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const data = await api.login(email, password);
      
      // Fetch profile to get normalized user data
      const profile = await api.get('/users/profile');
      
      login(profile || { name, email }, data.access_token);
      toast.success('Account generated. Welcome to the elite layer.');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Registration failed. Check your data protocols.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-500/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
             initial={{ rotate: 15, scale: 0.5, opacity: 0 }}
             animate={{ rotate: 0, scale: 1, opacity: 1 }}
             transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
             className="inline-flex items-center justify-center w-24 h-24 premium-gradient rounded-[2rem] text-white mb-8 shadow-2xl shadow-primary-500/20"
          >
            <UserPlus size={48} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4">New Pioneer</h1>
          <p className="text-text-secondary text-sm font-bold uppercase tracking-[0.2em] opacity-60">Initialize your professional profile</p>
        </div>

        <Card className="p-10 md:p-12 border-white/10 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Pioneer"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Professional Email"
              type="email"
              placeholder="pioneer@careerguide.ai"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Security Key"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <AnimatePresence>
              {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
                type="submit" 
                variant="accent"
                className="w-full h-16 text-lg font-black rounded-2xl shadow-glow active:scale-[0.98] transform-gpu" 
                loading={loading}
                icon={Sparkles}
              >
                Launch Profile
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-xs font-bold text-text-muted">
              Already a member? 
              <Link href="/login" className="text-primary-400 font-black hover:text-primary-300 transition-all ml-2 underline decoration-primary-400/30 underline-offset-4">
                Verify Identity
              </Link>
            </p>
          </div>
        </Card>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center text-[9px] font-black text-text-muted uppercase tracking-[0.4em]"
        >
          Data processed via secure neural infrastructure
        </motion.p>
      </motion.div>
    </div>
  );
}
