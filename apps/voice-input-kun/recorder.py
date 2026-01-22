import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import os
import tempfile
import threading
import time

class AudioRecorder:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.recording = []
        self.is_recording = False
        self.stream = None
        self.thread = None

    def _record_loop(self):
        """
        Threaded loop to read audio from stream safely without blocking main thread.
        """
        # Block size (number of frames) to read at a time
        block_size = 1024 
        try:
            with sd.InputStream(samplerate=self.sample_rate, channels=1, dtype='float32') as stream:
                while self.is_recording:
                    # Read returns (data, overflowed)
                    data, overflowed = stream.read(block_size)
                    if overflowed:
                        print("Audio overflow!")
                    self.recording.append(data.copy())
        except Exception as e:
            print(f"Error in recording loop: {e}")

    def start_recording(self):
        if self.is_recording:
            return
        self.recording = []
        self.is_recording = True
        print("Starting recording thread...")
        self.thread = threading.Thread(target=self._record_loop)
        self.thread.start()

    def stop_recording(self):
        if not self.is_recording:
            return None
        
        self.is_recording = False
        if self.thread:
            self.thread.join()  # Wait for thread to finish
            self.thread = None
        print("Recording stopped.")
        
        if not self.recording:
            return None

        # Concatenate and save to a temporary file
        audio_data = np.concatenate(self.recording, axis=0)
        
        # Diagnostics
        duration = len(audio_data) / self.sample_rate
        max_amp = np.abs(audio_data).max() if len(audio_data) > 0 else 0
        print(f"Recorded audio: {duration:.2f}s, max amplitude: {max_amp:.4f}")
        
        if max_amp < 0.001:
            print("Warning: Recorded audio seems silent. Check your microphone/permissions.")

        temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        wav.write(temp_file.name, self.sample_rate, audio_data)
        return temp_file.name

if __name__ == "__main__":
    pass
