// Shared API response types — used across the frontend

export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  job_title?: string;
  location?: string;
  skills?: string;
  experience_years?: number;
  profile_picture?: string;
  social_links?: string;
  is_premium: boolean;
  ai_credits: number;
  created_at?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  description: string;
  required_skills: string[] | string;
  salary_min?: number;
  salary_max?: number;
  work_type?: string;
  company_logo?: string;
  apply_url: string;
  source?: string;
  posted_at?: string;
  score?: number;
  match_reason?: string;
}

export interface MatchResult {
  job: Job;
  score: number;
  missing_skills?: string[];
  explanation?: string;
}

export interface Resume {
  id: number;
  filename: string;
  file_url: string;
  extracted_text?: string;
  uploaded_at: string;
}

export interface ApplyWithAIResult {
  match_score: number;
  match_rationale: string;
  missing_skills: string[];
  matched_skills: string[];
  cover_letter: string;
  top_skills_to_highlight: string[];
  pre_fill_data: {
    first_name: string;
    last_name: string;
    email: string;
    summary: string;
    skills: string;
  };
  credits_remaining: number;
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  user_id: number;
  status: 'PENDING' | 'APPLIED' | 'SCREENED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED';
  notes?: string;
  applied_at: string;
  job?: Job;
}
