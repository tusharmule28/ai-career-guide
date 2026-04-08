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
      login({ email }, data.access_token);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-[1.5rem] text-white mb-6 shadow-2xl shadow-slate-900/20">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Identity Access</h1>
          <p className="text-slate-500 mt-3 font-medium">Continue your professional journey with AI.</p>
        </div>

        <Card className="p-10 glass-card border-none shadow-premium">
          <div className="mb-10 p-5 bg-accent-50 rounded-2xl border border-accent-100/50 flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-accent-600 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> Demo Environment
            </h4>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-700 font-bold">Email: <span className="text-slate-500 font-medium ml-1">admin@example.com</span></p>
              <p className="text-xs text-slate-700 font-bold">Pass: <span className="text-slate-500 font-medium ml-1">admin123</span></p>
            </div>
          </div>

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
              variant="accent"
              className="w-full h-14 text-base font-black shadow-glow" 
              loading={loading}
              icon={LogIn}
            >
              Sign In to Guide
            </Button>
          </form>

          <div className="mt-10 text-center text-sm font-medium">
            <span className="text-slate-400">New explorer? </span>
            <Link to="/signup" className="text-accent-600 font-bold hover:text-accent-700 transition-smooth ml-1">
              Create Free Account
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
