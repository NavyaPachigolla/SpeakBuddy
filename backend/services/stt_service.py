import logging
import tempfile
import os
from pathlib import Path
from typing import Optional
from backend.config import settings

logger = logging.getLogger("speakbuddy.stt")

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            logger.info(f"Loading faster-whisper model '{settings.WHISPER_MODEL_SIZE}' on {settings.WHISPER_DEVICE}...")
            _whisper_model = WhisperModel(
                settings.WHISPER_MODEL_SIZE,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE
            )
            logger.info("Whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load faster-whisper model: {e}")
            raise e
    return _whisper_model

def transcribe_audio_bytes(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """Transcribe raw audio bytes using the local faster-whisper model."""
    if not audio_bytes or len(audio_bytes) < 100:
        return ""
        
    model = get_whisper_model()
    
    # Save to temp file
    suffix = Path(filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(audio_bytes)
        temp_path = temp_audio.name
        
    try:
        segments, info = model.transcribe(
            temp_path,
            beam_size=5,
            language="en",
            task="transcribe"
        )
        transcribed_text = " ".join([segment.text for segment in segments]).strip()
        return transcribed_text
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise e
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
