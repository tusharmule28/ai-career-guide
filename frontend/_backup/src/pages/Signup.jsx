import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { api } from '../utils/api';

const Signup = () => {
  const [name, setName] = useState('');
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
      const user = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const data = await api.login(email, password);

      login({ name, email }, data.access_token);
      toast.success('Account created successfully! Welcome aboard.');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-3xl text-white mb-8 shadow-2xl shadow-primary-500/20 transform hover:-rotate-6 transition-all duration-500">
            <UserPlus size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tight">Join the Elite</h1>
          <p className="text-text-secondary mt-4 text-base font-medium">Unlock AI-powered career growth today.</p>
        </div>

        <Card className="p-10 md:p-12 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Rivera"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              label="Create Security Key"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl animate-shake">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary"
              className="w-full h-14 text-base font-black shadow-soft hover:shadow-glow" 
              loading={loading}
              icon={Sparkles}
            >
              Get Started Now
            </Button>
          </form>

          <div className="mt-10 text-center text-sm font-medium">
            <span className="text-text-muted">Existing member? </span>
            <Link to="/login" className="text-primary-400 font-black hover:text-primary-300 transition-all ml-1 underline decoration-primary-400/30 underline-offset-4">
              Sign In Here
            </Link>
          </div>
        </Card>

        <p className="mt-10 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">
          Your data is processed via encrypted neural networks
        </p>
      </div>
    </div>
  );
};

export default Signup;
