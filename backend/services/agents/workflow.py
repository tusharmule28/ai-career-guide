"""
LangGraph workflow — wires the 4 agent nodes into a linear pipeline.
"""
from langgraph.graph import StateGraph, END
from services.agents.nodes import AgentState, matcher_node, gap_node, draft_node, apply_node

def build_career_agent():
    """Build and compile the career agent graph."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("matcher", matcher_node)
    graph.add_node("gap_analyzer", gap_node)
    graph.add_node("drafter", draft_node)
    graph.add_node("apply_assistant", apply_node)

    # Linear edges: matcher → gap → draft → apply → END
    graph.set_entry_point("matcher")
    graph.add_edge("matcher", "gap_analyzer")
    graph.add_edge("gap_analyzer", "drafter")
    graph.add_edge("drafter", "apply_assistant")
    graph.add_edge("apply_assistant", END)

    return graph.compile()

# Singleton — compiled once on import
career_agent = build_career_agent()


async def run_apply_with_ai(
    job_title: str,
    job_description: str,
    job_requirements: str,
    resume_text: str,
    user_name: str,
    user_email: str,
    user_bio: str = "",
    user_skills: str = "",
) -> dict:
    """
    Public entry point: invoke the agent graph and return the full state.
    """
    initial_state: AgentState = {
        "job_title": job_title,
        "job_description": job_description,
        "job_requirements": job_requirements,
        "resume_text": resume_text,
        "user_name": user_name,
        "user_email": user_email,
        "user_bio": user_bio,
        "user_skills": user_skills,
        "match_score": None,
        "match_rationale": None,
        "missing_skills": None,
        "matched_skills": None,
        "cover_letter": None,
        "pre_fill_data": None,
        "top_skills_to_highlight": None,
        "error": None,
    }
    result = await career_agent.ainvoke(initial_state)
    return result
