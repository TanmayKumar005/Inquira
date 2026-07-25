"""
Thin HTTP wrapper around run_research_pipeline() so the React frontend
can call it. Place this file next to pipeline.py, agents.py and tools.py.

Run with:
    pip install fastapi uvicorn
    uvicorn api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline import run_research_pipeline

app = FastAPI()

# Allow the Vite dev server to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "inquira-five.vercel.app"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str


@app.post("/api/research")
def research(req: ResearchRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="topic must not be empty")

    state = run_research_pipeline(topic)
    return {
        "search_results": state.get("search_results", ""),
        "scraped_content": state.get("scraped_content", ""),
        "report": state.get("report", ""),
        "feedback": state.get("feedback", ""),
    }