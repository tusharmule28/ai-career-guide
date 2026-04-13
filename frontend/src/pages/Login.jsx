import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { api } from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      
      // Fetch full profile to get the user's name
      // Note: We need to set the token first so the profile request is authorized
      // However, our AuthContext.login handles token storage, so we'll do it manually here for the profile fetch if needed
      // Actually, api.js getToken() uses localStorage directly. AuthContext.login sets both.
      
      // We'll call login first to set the state and token, then fetch profile and update it
      login({ email }, data.access_token);
      
      try {
        const profile = await api.get('/users/profile');
        if (profile && profile.full_name) {
          login({ name: profile.full_name, email }, data.access_token);
        }
      } catch (profileErr) {
        console.warn('Failed to fetch profile names after login:', profileErr);
      }
      
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-50/50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-3xl text-white mb-8 shadow-2xl shadow-primary-500/20 transform hover:rotate-6 transition-all duration-500">
            <Sparkles size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Access Guide</h1>
          <p className="text-slate-500 mt-4 text-base font-medium">Continue your professional journey with AI.</p>
        </div>

        <Card className="p-10 md:p-12 bg-white/90 border-slate-200/50 shadow-premium">

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Professional Email"
              type="email"
              placeholder="name@company.com"
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

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl animate-shake">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary"
              className="w-full h-14 text-base font-black shadow-soft hover:shadow-glow" 
              loading={loading}
              icon={LogIn}
            >
              Sign In to Portfolio
            </Button>
          </form>

          <div className="mt-10 text-center text-sm font-medium">
            <span className="text-slate-400">New explorer? </span>
            <Link to="/signup" className="text-primary-600 font-black hover:text-primary-700 transition-all ml-1 underline decoration-primary-200 underline-offset-4">
              Create Account
            </Link>
          </div>
        </Card>

        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
          Secured by Enterprise Grade Cryptography
        </p>
      </div>
    </div>
  );
};

export default Login;
