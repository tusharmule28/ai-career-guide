import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary p-3 rounded-2xl text-white mb-4 shadow-lg shadow-primary/20">
            <Sparkles size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue your career journey</p>
        </div>

        <Card className="p-8">
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
            <p className="font-semibold mb-1 flex items-center gap-2"><Sparkles size={16}/> Demo Credentials</p>
            <p>Email: <strong>admin@example.com</strong></p>
            <p>Password: <strong>admin123</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg animate-in shake-in">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-3" 
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/signup" className="font-semibold text-primary hover:text-primary-700 transition-smooth">
              Create one for free
            </Link>
          </div>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
