import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, UploadCloud, BrainCircuit, Target, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <div className="text-center pt-20 md:pt-28 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={16} />
          <span>The intelligent way to find your next role</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Match Your Skills with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
            the Future of Jobs
          </span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Leverage cutting-edge AI to find opportunities that perfectly align with your professional profile. Upload your resume and let our matching engine do the rest.
        </p>
        
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {!user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="px-8 shadow-lg shadow-primary/25 h-14 text-lg w-full sm:w-auto" icon={Rocket}>
                  Get Started for Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="px-8 h-14 text-lg w-full sm:w-auto">
                  View Live Demo
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button size="lg" className="px-8 shadow-lg shadow-primary/25 h-14 text-lg" icon={ArrowRight}>
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500">Three simple steps to your dream job</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: '1. Upload Resume', 
              description: 'Simply upload your PDF resume. Our system extracts your skills, experience, and education automatically.',
              icon: UploadCloud,
              color: 'bg-blue-50 text-blue-600'
            },
            { 
              title: '2. AI Analysis', 
              description: 'Advanced natural language processing identifies your unique strengths and uncovers hidden skill sets.',
              icon: BrainCircuit,
              color: 'bg-purple-50 text-purple-600'
            },
            { 
              title: '3. Precision Matching', 
              description: 'Get matched with roles that fit your profile perfectly, complete with skill gap analysis and insights.',
              icon: Target,
              color: 'bg-green-50 text-green-600'
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white border border-gray-100 p-8 rounded-3xl hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 group">
              <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
