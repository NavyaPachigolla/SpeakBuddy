import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, AlertCircle, RefreshCw, AudioWaveform as Waveform, FileAudio } from 'lucide-react';
import { uploadAudioToWhisper } from '../services/api';

export default function VoiceInput({ onSendMessage, isAiThinking, disabled }) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isWhisperTranscribing, setIsWhisperTranscribing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Web Speech Recognition reference
  const recognitionRef = useRef(null);
  // MediaRecorder reference for raw audio Whisper fallback
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setInputText((prev) => {
            const trimmed = prev.trim();
            const addition = (finalTranscript || interimTranscript).trim();
            if (!trimmed) return addition;
            // Prevent duplicate appending
            if (trimmed.endsWith(addition)) return trimmed;
            return `${trimmed} ${addition}`;
          });
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition event error:', event.error);
          if (event.error === 'not-allowed') {
            setMicError('Microphone access was denied. Please allow microphone access in your browser bar.');
          } else if (event.error === 'no-speech') {
            // Ignore benign no-speech event
          } else {
            setMicError(`Voice recognition: ${event.error}`);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Speech recognition init failed:', err);
        setSpeechSupported(false);
      }
    }
  }, []);

  // Start Voice Recording
  const startRecording = async () => {
    setMicError(null);
    try {
      // 1. If Web Speech API is supported, use it for instant real-time transcription
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          return;
        } catch (e) {
          console.warn('Recognition start caught error, falling back to MediaRecorder:', e);
        }
      }

      // 2. Fallback: Use MediaRecorder + faster-whisper backend transcription
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size > 500) {
          setIsWhisperTranscribing(true);
          try {
            const data = await uploadAudioToWhisper(audioBlob, 'recording.wav');
            if (data?.text) {
              setInputText((prev) => (prev ? `${prev} ${data.text}` : data.text));
            }
          } catch (err) {
            console.error('Whisper transcription failed:', err);
            setMicError('Audio transcription failed. You can type your message directly.');
          } finally {
            setIsWhisperTranscribing(false);
          }
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission denied. Please allow microphone permissions in your browser.');
      } else {
        setMicError('Microphone not available on this device. You can type your message.');
      }
      setIsRecording(false);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isAiThinking || disabled) return;
    if (isRecording) {
      stopRecording();
    }
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm transition-all">
      
      {/* Friendly error alert */}
      {micError && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{micError}</span>
          </div>
          <button 
            onClick={() => setMicError(null)} 
            className="text-amber-700 hover:text-amber-900 font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live recording status badge */}
      {isRecording && (
        <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Listening... Speak clearly into your microphone</span>
          </div>
          <span className="text-[11px] font-mono">Press button to stop</span>
        </div>
      )}

      {/* Whisper transcribing status */}
      {isWhisperTranscribing && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
          <div className="loading-spinner" style={{ '--size': '16px', '--thickness': '2px' }} />
          <span>Processing audio with local Whisper speech model...</span>
        </div>
      )}

      {/* Input controls container */}
      <div className="flex items-end gap-2">
        
        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleToggleRecording}
          disabled={isAiThinking || disabled}
          title={isRecording ? 'Stop Recording' : 'Start Speaking (Microphone)'}
          className={`h-11 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white voice-recording-active hover:bg-rose-700'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 animate-bounce" />
              <span className="font-bold">Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline font-semibold">🎙️ Speak</span>
            </>
          )}
        </button>

        {/* Textarea for review / manual editing */}
        <div className="relative flex-1">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? 'Listening to you speak...'
                : 'Click "Speak" to talk or type your answer here...'
            }
            disabled={isAiThinking || disabled}
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isAiThinking || disabled}
          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            !inputText.trim() || isAiThinking || disabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 active:scale-95'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>

      {/* Helpful microcopy */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>💡 Speak your thoughts naturally — you can edit before sending</span>
        <span>Enter ↵ to send</span>
      </div>

    </div>
  );
}
