import React from 'react';

const About = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 md:py-20">
      <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-indigo-500/30 pb-4">
        About the Platform
      </h1>
      <div className="space-y-6 text-lg text-slate-300 leading-relaxed font-light">
        <p>
          The <span className="text-indigo-400 font-medium">AI Job Matching Project</span> is built to bridge the gap between talented individuals and their dream roles using the power of advanced large language models.
        </p>
        <p>
          Our mission is to simplify the job search process by providing highly accurate matching scores, personalized career advice, and transparent insights into why a particular role is a good fit for you.
        </p>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl my-10 shadow-lg shadow-indigo-500/5">
          <h2 className="text-2xl font-bold text-white mb-4">Our Technology</h2>
          <p className="text-slate-400">
            We use a combination of FastAPI for the backend, PostgreSQL for data persistence, and React for a lightning-fast, premium user experience. Our AI matching engine is powered by state-of-the-art embedding models and LLMs.
          </p>
        </div>
        <p>
          Whether you're a seasoned professional or just starting your career, we're here to help you navigate the ever-changing job market with confidence.
        </p>
      </div>
    </div>
  );
};

export default About;
