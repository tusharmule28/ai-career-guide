# AI Job Matching Platform: Technical Dossier

This document is designed to help you prepare for interviews. It breaks down the architecture, technical decisions, and challenges of the project.

---

## 🚀 Project Overview
**What is it?**  
A high-performance AI-driven job matching platform that uses **Semantic Vector Search** to connect candidates with opportunities. Unlike traditional keyword-based matching, this system understands the context of a user's skills and the requirements of a job description.

---

## 🛠️ Technical Stack

### **Backend (The Engine)**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
  - *Why?* High performance, asynchronous (async/await), and automatic OpenAPI (Swagger) documentation.
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
  - *Why?* Industry standard for Python; provides powerful relationship mapping and type safety.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector)
  - *Why?* Traditional relational data handling combined with advanced vector similarity search for AI features.
- **Background Tasks**: [Celery](https://docs.celeryq.dev/) + [Redis](https://redis.io/)
  - *Why?* Handles long-running tasks like job scraping and AI embedding generation without blocking the main API.
- **Security**: JWT Authentication, CORS safety protocols, and Rate Limiting (`slowapi`).

### **AI & Machine Learning**
- **Embeddings**: HuggingFace Transformers (`SentenceTransformer`)
  - *Function*: Converts job descriptions and resumes into 384-dimensional or 768-dimensional vectors.
- **Matching Engine**: Cosine Similarity via SQL (`<=>` operator in `pgvector`).
- **Logic Layers**:
  - `Gap Analysis`: Compares user vectors vs job vectors to find "missing" skills.
  - `Explanation Service`: Uses AI to generate human-readable reasons why a user is a good fit.

### **Frontend (The Interface)**
- **Stack**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks (Context API/Redux).
- **Deployment**: Vercel/Netlify for the frontend; Render/Supabase for the backend.

---

## 🏛️ System Architecture

1.  **User Uploads Resume**: The backend parses the PDF (via `PyMuPDF`) and extracts text.
2.  **Vectorization**: The `EmbeddingService` converts the profile into a high-dimensional vector and stores it in PostgreSQL using `pgvector`.
3.  **Job Ingestion**: Scrapers fetch jobs; each job is also vectorized and indexed.
4.  **Matching**: When a user visits their dashboard, a single SQL query calculates the distance between their profile vector and all job vectors.
5.  **Result**: The top $N$ jobs with the highest similarity score are returned as "Matches".

---

## 💡 Major Technical Challenges & Solutions

### 1. Database Migration: Render to Supabase
- **Challenge**: The Render internal database was hitting performance limits. We needed to migrate to a more robust, scalable solution like Supabase with better pooling support.
- **Solution**: 
  - Automated the migration using a custom Python script.
  - Used `pg_dump` and `pg_restore` (v18) to ensure zero data loss.
  - Implemented **URL Encoding** for special characters in credentials (e.g., `#` to `%23`) to prevent connection string failures.
  - Switched to **Transaction Pooling (Port 6543)** in Supabase to handle high-concurrency requests in a serverless-like environment.

### 2. Manual Schema Patching
- **Challenge**: Alembic migrations would sometimes fall out of sync with Render's auto-generated tables.
- **Solution**: Developed a robust `startup` event in FastAPI that checks for missing columns (like `job_title`, `is_premium`) and applies raw SQL patches automatically if they are missing. This ensured a self-healing database schema on deployment.

### 3. CORS Policy Complexity
- **Challenge**: Managing cross-origin requests between multiple staging URLs (Vercel, Netlify) while maintaining strict security.
- **Solution**: Built a dynamic CORS middleware that sanitizes and validates origins at runtime, allowing credentials while blocking illegal wildcard combinations.

---

## 🎯 Interview Q&A (Preparation)

#### **Q1: Why did you choose FastAPI over Django or Flask?**
> "FastAPI offers native async support, which is critical for an AI platform where wait times for embeddings can be high. It's significantly faster than Django and provides automatic type validation via Pydantic, reducing runtime errors."

#### **Q2: How does the AI matching actually work?**
> "We don't just search for keywords like 'Python'. We use a HuggingFace model to generate an embedding—a numerical representation of the context. We store these as `vector` types in PostgreSQL. Matching is a simple mathematical calculation (Cosine Similarity) performed directly in the database for maximum speed."

#### **Q3: What was the most difficult part of the migration?**
> "Handling the connection strings. Because our database password had special characters like `#`, standard connection attempts failed. I solved this by URL-encoding the components and moving the application to use the Transaction Pooler (Port 6543) instead of the direct connection (5432) to prevent 'Too many connections' errors under load."

#### **Q4: How do you handle database scalability?**
> "On the backend, we use SQLAlchemy with optimized pooling (`pool_size=5`, `max_overflow=10`). On the database side, moving to Supabase allowed us to leverage their auto-scaling infrastructure and built-in connection pooler (PgBouncer)."

#### **Q5: How do you handle long-running transactions like resume processing?**
> "We use Celery as a task queue with Redis as a broker. This allows the API to return a 'Processing' status to the user immediately, while the heavy lifting of PDF parsing and vector generation happens in a separate background process."

---

## 📈 Future Improvements (The "Senior" Perspective)
1. **Hybrid Search**: Combine BM25 (keyword) with Vector Search for even better precision.
2. **Horizontal Scaling**: Containerize the app using Docker (already have a `Dockerfile`) and deploy to a K8s cluster.
3. **Caching Layer**: Use Redis to cache the top matches for high-active users to reduce DB load.

---
*This document summarizes your role as a Senior Python/DevOps engineer on this project.*
