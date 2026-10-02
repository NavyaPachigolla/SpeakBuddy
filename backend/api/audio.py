import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.stt_service import transcribe_audio_bytes

logger = logging.getLogger("speakbuddy.audio")
router = APIRouter(prefix="/transcribe", tags=["Audio STT"])

@router.post("")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        audio_content = await audio.read()
        if not audio_content:
            raise HTTPException(status_code=400, detail="Audio file is empty.")
            
        transcribed_text = transcribe_audio_bytes(audio_content, filename=audio.filename or "recording.wav")
        return {
            "text": transcribed_text,
            "filename": audio.filename,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Speech transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Speech transcription failed: {str(e)}")
