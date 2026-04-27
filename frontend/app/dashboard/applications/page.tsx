'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  Trophy, 
  XCircle,
  MoreVertical,
  ChevronRight,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useApplicationStore from '@/lib/store/applicationStore';
import Card from '@/components/ui/Card';
import Button, { cn } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Application } from '@/types/job';

const STATUS_COLUMNS = [
  { id: 'PENDING', label: 'Staging', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'APPLIED', label: 'Deployed', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'SCREENED', label: 'Screening', icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'INTERVIEW', label: 'Interview', icon: PhoneCall, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { id: 'OFFERED', label: 'Secured', icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'REJECTED', label: 'Archived', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

export default function ApplicationsPage() {
  const { applications, loading, error, fetchApplications, updateApplicationStatus, deleteApplication } = useApplicationStore();
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDragStart = (e: React.DragEvent, app: Application) => {
    setDraggedApp(app);
    // Needed for Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', app.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    if (!draggedApp) return;

    if (draggedApp.status !== statusId) {
      try {
        await updateApplicationStatus(draggedApp.id, statusId);
        toast.success(`Application moved to ${STATUS_COLUMNS.find(c => c.id === statusId)?.label}`);
      } catch (err: any) {
        toast.error("Failed to move application.");
      }
    }
    setDraggedApp(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this application track?")) {
      try {
        await deleteApplication(id);
        toast.success("Application track removed.");
      } catch (err: any) {
        toast.error("Failed to remove application.");
      }
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="section-container min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-container min-h-[60vh] flex flex-col items-center justify-center">
         <EmptyState 
            icon={Zap}
            title="Telemetry Failure" 
            description={error}
            actionText="Try Again"
            onAction={() => fetchApplications()}
        />
      </div>
    );
  }

  return (
    <div className="section-container safe-bottom">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-6 border border-violet-500/20 shadow-sm"
          >
             <Briefcase size={12} className="fill-current" /> Career Pipeline
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
            Mission <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
            Track and manage your active career trajectories. Drag and drop to update status.
          </p>
        </div>
      </div>

      {applications.length === 0 && !loading ? (
        <EmptyState 
            icon={Briefcase}
            title="Pipeline Empty" 
            description="You haven't initiated any applications yet. Scan the market and deploy your first resume to see it tracked here."
            actionText="Explore Roles"
            onAction={() => window.location.href = '/jobs'}
        />
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x h-[calc(100vh-300px)] min-h-[600px]">
          {STATUS_COLUMNS.map((col) => {
            const columnApps = applications.filter(a => a.status === col.id);
            
            return (
              <div 
                key={col.id} 
                className="flex flex-col min-w-[320px] max-w-[320px] w-[320px] snap-center shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", col.bg, col.color, col.border)}>
                      <col.icon size={16} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{col.label}</h3>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-surface border border-white/5 text-[10px] font-black text-text-muted">
                    {columnApps.length}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 bg-surface/20 rounded-[2rem] border border-border/30 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                  <AnimatePresence>
                    {columnApps.map((app) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        key={app.id}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, app)}
                        className={cn(
                          "group relative bg-surface/80 hover:bg-surface border border-border/50 hover:border-white/10 p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing",
                          draggedApp?.id === app.id ? "opacity-50" : ""
                        )}
                      >
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <h4 className="text-sm font-black text-white group-hover:text-primary-300 transition-colors line-clamp-1 leading-tight tracking-tight">
                                {app.job?.title || app.job_title || 'Unknown Role'}
                             </h4>
                             <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                                {app.job?.company || app.company || 'Unknown Company'}
                             </p>
                           </div>
                           <button onClick={() => handleDelete(app.id)} className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors">
                              <MoreVertical size={14} />
                           </button>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                           <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                             {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                           </span>
                           
                           {app.job?.apply_url || app.apply_url ? (
                             <a 
                               href={app.job?.apply_url || app.apply_url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest"
                             >
                               Source <ChevronRight size={10} />
                             </a>
                           ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {columnApps.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-10 opacity-50">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-border/50 mx-auto mb-2 flex items-center justify-center">
                          <Briefcase size={16} className="text-text-muted" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Drop Here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
