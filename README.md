# AI Career Guide – Job Matching Platform

An advanced AI-powered career assistant that matches user resumes with real-time job listings from the world's leading remote job boards.

##  Key Features

- **AI-Powered Matching**: Uses `pgvector` and Sentence Transformer embeddings (Hugging Face Inference API) to find high-relevance job matches.
- **Real-Time Job Fetching**: Automated scrapers for **Remotive.io** and **We Work Remotely** to keep the job feed fresh.
- **Background Synchronization**: Jobs are fetched and embedded in the background, ensuring zero latency for the end user.
- **Direct Application**: One-click "Apply" buttons for all matched roles.
- **Skill Gap Analysis**: AI-driven insights into how your profile fits each specific role.

##  Architecture

1.  **Frontend**: React (Vite) + Tailwind CSS, deployed on **Vercel**.
2.  **Backend**: FastAPI (Python), deployed on **Render**.
3.  **Database**: PostgreSQL with `pgvector` extension.
4.  **AI Engine**: Hugging Face Inference API (`all-MiniLM-L6-v2`).
5.  **Data Layer**: Custom scrapers for JSON/RSS source normalization.

##  Setup Instructions

### Backend
1.  Navigate to `backend/`.
2.  Create a `.env` file with `DATABASE_URL`, `HUGGING_FACE_API_TOKEN`, and `SECRET_KEY`.
3.  Install dependencies: `pip install -r requirements.txt`.
4.  Run the server: `uvicorn main:app --reload`.

### Frontend
1.  Navigate to `frontend/`.
2.  Set `VITE_API_URL` in your environment.
3.  Install dependencies: `npm install`.
4.  Run the application: `npm run dev`.

---

## 🎯 System Objectives
- **Near Real-Time**: Jobs are synced and processed seamlessly.
- **High Relevance**: Top 5-10 matches with similarity scores > 60%.
- **Performance Optimized**: Uses hybrid caching and background processing to maintain speed.
