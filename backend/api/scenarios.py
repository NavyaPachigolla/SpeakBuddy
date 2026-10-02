import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

SCENARIOS_PATH = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts" / "scenarios.json"

@router.get("")
def get_scenarios():
    if not SCENARIOS_PATH.exists():
        raise HTTPException(status_code=404, detail="Scenarios definition not found.")
    try:
        data = json.loads(SCENARIOS_PATH.read_text(encoding="utf-8"))
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading scenarios: {str(e)}")
