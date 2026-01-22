import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import os
import tempfile

class AudioRecorder:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.recording = []
        self.is_recording = False
        self.stream = None

    def _callback(self, indata, frames, time, status):
        if status:
            print(status)
        if self.is_recording:
            self.recording.append(indata.copy())

    def start_recording(self):
        self.recording = []
        self.is_recording = True
        self.stream = sd.InputStream(samplerate=self.sample_rate, channels=1, callback=self._callback)
        self.stream.start()
        print("Recording started...")

    def stop_recording(self):
        self.is_recording = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
        print("Recording stopped.")
        
        if not self.recording:
            return None

        # Concatenate and save to a temporary file
        audio_data = np.concatenate(self.recording, axis=0)
        temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        wav.write(temp_file.name, self.sample_rate, audio_data)
        return temp_file.name

if __name__ == "__main__":
    # Test script (placeholder)
    pass
