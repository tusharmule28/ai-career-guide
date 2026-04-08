import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, UploadCloud, BrainCircuit, Target, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="section-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-widest mb-8 animate-float">
            <Sparkles size={14} className="text-accent-500" />
            Empowering the modern workforce
          </div>

          <h1 className="text-5xl md:text-8xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Find Your Career <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-indigo-600 to-accent-600 bg-[length:200%_auto] animate-gradient">
              North Star with AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Join 10,000+ professionals using our AI matching engine to discover roles that perfectly align with their skills, ambition, and potential.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user ? (
              <>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="h-14 px-10 text-lg w-full sm:min-w-[200px] shadow-glow">
                    Get Started <Rocket size={20} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="h-14 px-8 text-lg w-full border border-slate-200 hover:bg-slate-50">
                    Live Demo
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="h-14 px-10 text-lg w-full shadow-glow">
                  Go to Dashboard <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-slate-50/50 py-32 border-y border-slate-100">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Built for the future of work</h2>
            <p className="text-slate-500 font-medium text-lg">We've automated the most painful parts of the job search, so you can focus on making an impact.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Instant Extraction',
                description: 'Our proprietary parsing engine extracts every nuance of your experience from your resume in seconds.',
                icon: UploadCloud,
                color: 'text-blue-600',
                bg: 'bg-blue-50'
              },
              {
                title: 'Semantic Analysis',
                description: 'We don\'t just match keywords. We understand the context and trajectory of your professional growth.',
                icon: BrainCircuit,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50'
              },
              {
                title: 'Role Alignment',
                description: 'Receive role suggestions with detailed match scores and personalized skill-gap analysis.',
                icon: Target,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium transition-smooth group cursor-default">
                <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center ${feature.bg} ${feature.color} group-hover:scale-110 transition-smooth`}>
                  <feature.icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-accent-600 transition-colors">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 section-container">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">Ready to find your <br />perfect match?</h2>
            <p className="text-slate-400 text-lg mb-12 font-medium">Join thousands of job seekers who found their dream role with AI Career Guide.</p>
            <Link to="/signup">
              <Button size="lg" className="h-14 px-12 text-lg rounded-2xl bg-dark text-slate-900 hover:bg-slate-100 shadow-xl font-black">
                Sign Up Now — It's Free
              </Button>
            </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
