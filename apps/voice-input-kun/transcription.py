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
        if not os.path.exists(audio_path):
            print(f"Transcription Error: File not found at {audio_path}")
            return "Error: Audio file not found."

        print(f"Starting transcription for: {audio_path}")
        try:
            # beam_size=1 is much faster than 5, while maintaining enough accuracy for large-v3-turbo
            # vad_filter removes silence, further speeding up processing
            segments, info = self.model.transcribe(
                audio_path, 
                beam_size=1, 
                language="ja",
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=500)
            )
            
            print(f"Transcription model call completed. Detected language: {info.language} with probability {info.language_probability:.2f}")

            text = ""
            for i, segment in enumerate(segments):
                print(f"  Processed segment {i+1}: {segment.text}")
                text += segment.text
                
            print("Transcription fully completed.")
            return text.strip()
        except Exception as e:
            print(f"Error during transcription process: {str(e)}")
            raise e

if __name__ == "__main__":
    # Test script (placeholder)
    pass
