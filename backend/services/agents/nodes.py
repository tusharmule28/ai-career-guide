"""
LangGraph Agent Nodes — each function is one step in the AI pipeline.

Flow: Matcher → GapAnalyzer → Drafter → ApplyAssistant
"""
from __future__ import annotations
import json
import logging
from typing import TypedDict, Optional, List

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from core.config import settings

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────
# Shared State schema for the graph
# ────────────────────────────────────────────
class AgentState(TypedDict):
    # Inputs
    job_title: str
    job_description: str
    job_requirements: str
    resume_text: str
    user_name: str
    user_email: str
    user_bio: str
    user_skills: str

    # Outputs populated by each node
    match_score: Optional[int]
    match_rationale: Optional[str]
    missing_skills: Optional[List[str]]
    matched_skills: Optional[List[str]]
    cover_letter: Optional[str]
    pre_fill_data: Optional[dict]
    top_skills_to_highlight: Optional[List[str]]
    error: Optional[str]


def _get_llm() -> ChatGroq:
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama3-8b-8192",
        temperature=0.3,
    )


# ────────────────────────────────────────────
# Node 1: Matcher Agent
# ────────────────────────────────────────────
def matcher_node(state: AgentState) -> AgentState:
    """Compute a 0–100 match score and a one-sentence rationale."""
    if not settings.GROQ_API_KEY:
        return {**state, "match_score": 50, "match_rationale": "AI not configured.", "error": None}

    try:
        llm = _get_llm()
        prompt = f"""You are a strict job-matching expert.
Given:
- Job Title: {state['job_title']}
- Job Requirements: {state['job_requirements'][:1500]}
- Candidate Skills / Resume: {state['resume_text'][:1500]}

Return ONLY valid JSON:
{{"match_score": <0-100 integer>, "match_rationale": "<one sentence>"}}"""

        response = llm.invoke([HumanMessage(content=prompt)])
        data = json.loads(response.content)
        return {**state, "match_score": data["match_score"], "match_rationale": data["match_rationale"], "error": None}
    except Exception as e:
        logger.error(f"Matcher node error: {e}")
        return {**state, "match_score": 0, "match_rationale": "Could not compute.", "error": str(e)}


# ────────────────────────────────────────────
# Node 2: Skill Gap Agent
# ────────────────────────────────────────────
def gap_node(state: AgentState) -> AgentState:
    """Identify missing skills and skills that already match."""
    if not settings.GROQ_API_KEY:
        return {**state, "missing_skills": [], "matched_skills": []}

    try:
        llm = _get_llm()
        prompt = f"""You are a talent acquisition specialist.
Job Requirements: {state['job_requirements'][:1500]}
Candidate Resume: {state['resume_text'][:1500]}

Return ONLY valid JSON:
{{"missing_skills": ["...", "..."], "matched_skills": ["...", "..."]}}"""

        response = llm.invoke([HumanMessage(content=prompt)])
        data = json.loads(response.content)
        return {**state, "missing_skills": data.get("missing_skills", []), "matched_skills": data.get("matched_skills", [])}
    except Exception as e:
        logger.error(f"Gap node error: {e}")
        return {**state, "missing_skills": [], "matched_skills": [], "error": str(e)}


# ────────────────────────────────────────────
# Node 3: Draft Agent
# ────────────────────────────────────────────
def draft_node(state: AgentState) -> AgentState:
    """Generate a tailored cover letter and skills to highlight."""
    if not settings.GROQ_API_KEY:
        return {**state, "cover_letter": "AI not configured.", "top_skills_to_highlight": []}

    try:
        llm = _get_llm()
        prompt = f"""You are a professional career coach.
Write a concise, tailored cover letter for:
- Candidate: {state['user_name']}
- Applying for: {state['job_title']}
- Job Description: {state['job_description'][:1200]}
- Matched Skills: {', '.join(state.get('matched_skills') or [])}
- Missing Skills: {', '.join(state.get('missing_skills') or [])}
- Bio: {state.get('user_bio', '')}

Return ONLY valid JSON:
{{"cover_letter": "...", "top_skills_to_highlight": ["...", "..."]}}"""

        response = llm.invoke([HumanMessage(content=prompt)])
        data = json.loads(response.content)
        return {**state,
                "cover_letter": data.get("cover_letter", ""),
                "top_skills_to_highlight": data.get("top_skills_to_highlight", [])}
    except Exception as e:
        logger.error(f"Draft node error: {e}")
        return {**state, "cover_letter": "Could not generate.", "top_skills_to_highlight": [], "error": str(e)}


# ────────────────────────────────────────────
# Node 4: Apply Assistant Agent
# ────────────────────────────────────────────
def apply_node(state: AgentState) -> AgentState:
    """Pre-fill application form fields ready for user review."""
    name_parts = state["user_name"].split(" ", 1)
    pre_fill = {
        "first_name": name_parts[0],
        "last_name": name_parts[1] if len(name_parts) > 1 else "",
        "email": state.get("user_email", ""),
        "summary": f"Experienced professional applying for {state['job_title']}.",
        "skills": state.get("user_skills", ""),
    }
    return {**state, "pre_fill_data": pre_fill}
