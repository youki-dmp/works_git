import os
from faster_whisper import WhisperModel

class TranscriptionEngine:
    def __init__(self, model_size="large-v3-turbo", device="cpu", compute_type="int8"):
        """
        Initialize the transcription engine.
        Using CPU by default for portability, int8 for speed.
        """
        print(f"Loading Whisper model: {model_size}...")
        # device_index is not strictly needed for cpu, but helps clarify
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)
        print("Model loaded.")

    def transcribe(self, audio_path):
        """
        Transcribe an audio file to text with speed optimizations.
        """
        # beam_size=1 is much faster than 5, while maintaining enough accuracy for large-v3-turbo
        # vad_filter removes silence, further speeding up processing
        segments, info = self.model.transcribe(
            audio_path, 
            beam_size=1, 
            language="ja",
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        text = ""
        for segment in segments:
            text += segment.text
            
        return text.strip()

if __name__ == "__main__":
    # Test script (placeholder)
    pass
