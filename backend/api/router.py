from fastapi import APIRouter
from api.endpoints import health, users, resumes, skills, explanations, jobs, auth, matching, dashboard, applications, notifications, cron, agent

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills"])
api_router.include_router(explanations.router, prefix="/explanations", tags=["Explanations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(matching.router, prefix="/matching", tags=["Matching"])
api_router.include_router(cron.router, prefix="/cron", tags=["Cron"])
api_router.include_router(agent.router, prefix="/agent", tags=["Agent"])
