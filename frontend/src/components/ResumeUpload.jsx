import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, Sparkles } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.upload('/resumes/upload', formData);
      setSuccess(true);
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF file.');
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-accent/10 p-3 rounded-2xl text-accent mb-4">
          <FileText size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Resume Analysis</h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          Upload your resume in PDF format. Our AI will analyze your skills and match you with the best career opportunities.
        </p>
        
        {/* Privacy Surety Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100 animate-in fade-in zoom-in duration-1000 delay-300">
           <ShieldCheck size={14} />
           100% Secure & Private Analysis
        </div>
      </div>

      <Card className="p-10 border-2 border-dashed border-gray-200 bg-gray-50/30 hover:border-primary/30 transition-smooth">
        <div 
          onClick={!file && !success ? () => fileInputRef.current?.click() : undefined}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center py-12 ${!file && !success ? 'cursor-pointer' : ''}`}
        >
          {!file && !success && (
            <>
              <div className="bg-white p-4 rounded-full shadow-sm mb-6 text-primary group-hover:scale-110 transition-smooth">
                <Upload size={40} />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">Drag and drop your resume here</p>
              <p className="text-gray-500 text-sm mb-8">Support PDF files up to 10MB</p>
              
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
                <Button variant="secondary" className="px-8 shadow-sm pointer-events-none">
                  Browse Files
                </Button>
              </div>
            </>
          )}

          {file && !success && (
            <div className="w-full max-w-md animate-in zoom-in duration-300">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg text-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-smooth"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleUpload} 
                  loading={loading}
                  className="w-full py-4 text-lg"
                  icon={Sparkles}
                >
                  {loading ? 'Analyzing Profile...' : 'Start AI Analysis'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setFile(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {success && (
            <div className="text-center animate-in zoom-in duration-500">
              <div className="bg-green-50 p-6 rounded-full text-green-600 mb-6 inline-block">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
              <p className="text-gray-500">Your profile has been successfully matched with 12+ roles.</p>
              <p className="text-primary font-medium mt-4 flex items-center justify-center gap-2">
                Redirecting to your matches <Loader2 size={16} className="animate-spin" />
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </Card>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="text-primary shrink-0 mt-1"><Sparkles size={20} /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">NLP Powered</p>
            <p className="text-xs text-gray-500">Intelligent extraction of hidden skills and experience.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-primary shrink-0 mt-1"><Sparkles size={20} /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">Career Gap Analysis</p>
            <p className="text-xs text-gray-500">Identify exactly what skills you're missing for your goal role.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-primary shrink-0 mt-1"><Sparkles size={20} /></div>
          <div>
            <p className="text-sm font-bold text-gray-900">Instant Matching</p>
            <p className="text-xs text-gray-500">Real-time matching with high-priority job listings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
