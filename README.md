#  AI Career Guide – Intelligent Job Matching Platform

An AI-powered platform that matches resumes with relevant jobs using semantic search and LLM insights, helping users understand not just what fits but why it fits.

Built as a focused MVP to demonstrate real-world AI system design and practical LLM usage.

---

##  MVP Focus

Core Goal:
Deliver high-quality job matches and skill gap insights from a user’s resume.

---

##  Core Features (MVP)

###  1. AI-Powered Job Matching

* Uses Sentence Transformers and pgvector
* Matches resumes with jobs using semantic similarity (not keyword matching)
* Returns top relevant jobs ranked by relevance

---

###  2. LLM Skill Gap Analysis

* Powered by Llama 3 (via Groq)
* For top matches, provides:

  * Matched skills
  * Missing skills
  * Improvement suggestions
* Explains why a job is a good fit

---

###  3. Smart Resume Processing

* Resume upload automatically performs:

  * Text extraction
  * Embedding generation
* No manual input required

---

##  Simplified Architecture (MVP)

```
User Resume → Text Extraction → Embedding
                                 ↓
                          Vector Search (pgvector)
                                 ↓
                           Top Job Matches
                                 ↓
                         LLM Skill Analysis
                                 ↓
                              Results UI
```

---

##  Tech Stack

### Backend

* FastAPI (Python)
* PostgreSQL + pgvector
* Redis (background tasks)

---

### AI

* Hugging Face (Embeddings)
* Groq (Llama 3 for analysis)

---

### Frontend

* Next.js
* Tailwind CSS

---

## Getting Started

```
docker-compose up --build
```

Frontend → http://localhost:3000
API Docs → http://localhost:8000/docs

---

##  Environment Variables

| Variable               | Description           |
| ---------------------- | --------------------- |
| DATABASE_URL           | PostgreSQL connection |
| REDIS_URL              | Redis instance        |
| HUGGING_FACE_API_TOKEN | Embeddings            |
| GROQ_API_KEY           | LLM analysis          |

---

##  Future Scope (Beyond MVP)

* Real-time job scraping
* Resume scoring dashboard
* AI career roadmap generator
* Chat-based assistant

---

##  Author Note

This MVP focuses on:

* Semantic job matching using vector search
* Explainable AI using LLM reasoning
* Clean and scalable backend design
