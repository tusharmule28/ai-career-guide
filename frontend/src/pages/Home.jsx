import React from 'react';
import ResumeUpload from '../components/ResumeUpload';

const Home = () => {
  return (
    <div className="space-y-16">
      <div className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-100 mb-6 drop-shadow-sm leading-tight transition-all">
          Match Your Skills with <br className="hidden md:block" /> the Future of Jobs
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 transition-all font-light">
          Leverage cutting-edge AI to find opportunities that perfectly align with your professional profile. Build your career with confidence.
        </p>
        
        <div className="mt-8">
            <ResumeUpload />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'AI-Powered Matching', description: 'Our custom-trained models analyze your resume to find the best-fitting jobs.' },
          { title: 'Tailored Insights', description: 'Get detailed feedback on why a job matches your profile and where you can improve.' },
          { title: 'Secure & Private', description: 'Your data is encrypted and used only for providing the best job recommendations.' }
        ].map((feature, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-indigo-500/5">
            <div className="w-12 h-12 bg-slate-800 rounded-xl mb-6 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                {idx + 1}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed font-light">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
