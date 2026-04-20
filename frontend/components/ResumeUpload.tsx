'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, FileUp } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Button, { cn } from './ui/Button';
import Card from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onUploadSuccess?: () => void;
  hasExistingResume?: boolean;
  existingResumeName?: string;
}

export default function ResumeUpload({ onUploadSuccess, hasExistingResume, existingResumeName }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF documents are supported for neural extraction.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }
    setFile(file);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadResume = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.upload('/resumes/upload', formData);
      toast.success('Resume analyzed and synchronized.');
      clearFile();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err.message || 'Failed to analyze resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-8 bg-surface/30 border-dashed border-2 border-border/50 rounded-[2.5rem] relative isolate overflow-hidden transition-all duration-500">
      <div className="relative z-10 flex flex-col items-center text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!file && hasExistingResume ? (
            <motion.div
              key="existing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full py-10"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-glow-emerald animate-pulse-slow">
                  <FileText size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Active Footprint Synced</h3>
                  <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-1">Current Resume</p>
                  <p className="text-lg font-black text-emerald-400">{existingResumeName || "Master_Resume.pdf"}</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  >
                    Replace Resume
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : !file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full py-12 cursor-pointer transition-all duration-300 rounded-[2rem] border-2 border-transparent ${
                isDragActive ? 'bg-indigo-500/10 border-indigo-500/30 scale-[1.02]' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow border border-indigo-500/20">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Sync Your Trajectory</h3>
              <p className="text-text-secondary text-sm font-bold max-w-[240px] mx-auto leading-relaxed">
                Drag and drop your <span className="text-indigo-400">PDF resume</span> to initialize AI matching protocols.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full py-8"
            >
              <div className="flex items-center justify-between p-6 bg-surface border border-white/5 rounded-2xl mb-8 relative group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <FileText size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white truncate max-w-[180px]">{file.name}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  disabled={uploading}
                  className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={uploadResume}
                  loading={uploading}
                  disabled={uploading}
                  variant="accent"
                  className="flex-1 h-14 rounded-xl font-black text-xs uppercase tracking-widest shadow-glow"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Analyzing Neural Data...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="mr-2" />
                      Execute Extraction
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearFile}
                  disabled={uploading}
                  className="h-14 rounded-xl font-bold text-text-secondary hover:text-white border border-border/50"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative background element */}
      <div className={cn(
        "absolute -right-24 -bottom-24 w-64 h-64 rounded-full blur-[100px] -z-10 transition-colors duration-1000",
        hasExistingResume && !file ? "bg-emerald-500/5" : "bg-indigo-500/5"
      )} />
    </Card>
  );
}
