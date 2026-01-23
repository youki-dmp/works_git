import os
import sys
import time
import numpy as np
import sounddevice as sd
import torch
import threading
import queue
import logging
import argparse
import pystray
import traceback
import multiprocessing as mp
from pystray import MenuItem as item
from PIL import Image, ImageDraw, ImageFont

# Set spawn method for Mac stability
if sys.platform == "darwin":
    try:
        mp.set_start_method('spawn', force=True)
    except:
        pass

# NUCLEAR STABILITY FOR MAC
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1" 
torch.set_num_threads(1)
if sys.platform == "darwin":
    # Force CPU globally to prevent MPS/CPU context switching deadlocks
    os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
    os.environ["MPS_FORCE_CPU"] = "1"

# Constants
MODEL_PATH = "model/meimei.pth"
INDEX_PATH = "model/added_IVF1149_Flat_nprobe_1_meimei_v2.index"
INPUT_SR = 16000
OUTPUT_SR = 32000
CHUNK_SIZE = 8192 # Doubled for smoother playback

# Suppress verbose logging
logging.getLogger("numba").setLevel(logging.WARNING)
logging.basicConfig(level=logging.WARNING)

def rvc_worker_process(in_q, out_q, stop_event, model_path, index_path, f0_up_key, f0_method):
    """Isolated RVC worker to prevent PortAudio deadlocks."""
    import traceback
    # Fix for PyTorch 2.6+ security check inside the new process
    try:
        from fairseq.data.dictionary import Dictionary
        import torch
        torch.serialization.add_safe_globals([Dictionary])
    except ImportError:
        pass

    sys.stdout.write(f"[*] RVC Worker Process Started (PID: {os.getpid()})\n")
    sys.stdout.flush()
    
    try:
        # FORCE CPU for absolute stability on Mac (MPS hangs frequently in multi-process)
        device = "cpu"
        
        from rvc_python.infer import RVCInference
        from rvc_python.modules.vc.utils import load_hubert
        
        # Initialize RVC
        rvc = RVCInference(device=device)
        rvc.load_model(model_path, index_path=index_path)
        
        vc = rvc.vc
        pipeline = vc.pipeline
        net_g = vc.net_g
        hubert_model = vc.hubert_model
        if hubert_model is None:
            hubert_model = load_hubert(vc.config, vc.lib_dir)
            vc.hubert_model = hubert_model
            
        sys.stdout.write(f"[*] RVC Engine Ready on {device} (Mode: {f0_method})\n")
        sys.stdout.flush()
        
        processed_count = 0
        while not stop_event.is_set():
            try:
                chunk16k = in_q.get(timeout=0.5)
                if chunk16k is None: break
                
                processed_count += 1
                
                # Inference
                with torch.no_grad():
                    idx_path = rvc.models[rvc.current_model].get("index", "")
                    audio_opt = pipeline.pipeline(
                        hubert_model, net_g, 0, chunk16k, "", [0, 0, 0],
                        f0_up_key, f0_method,
                        idx_path,
                        0.5, vc.if_f0, 3,
                        OUTPUT_SR, OUTPUT_SR, 0.0, vc.version, 0.0
                    )
                
                # Send back to main process
                out_q.put(audio_opt)
                
            except queue.Empty:
                continue
            except Exception as e:
                sys.stdout.write(f"\n[Worker Error] {e}\n")
                traceback.print_exc()
                sys.stdout.flush()
                
    except Exception as ie:
        sys.stdout.write(f"\n[Worker Critical] {ie}\n")
        traceback.print_exc()
        sys.stdout.flush()

class RealTimeVC:
    def __init__(self, model_path, index_path, f0_up_key=12):
        self.input_queue = mp.Queue()
        self.output_queue = mp.Queue()
        self.local_output_queue = queue.Queue() # Local thread-safe bridge
        self.monitor_queue = queue.Queue(maxsize=10)
        
        self.stop_event = mp.Event()
        self.f0_up_key = f0_up_key
        self.f0_method = "pm" # Fast mode for smooth real-time
        self.is_monitoring = False
        
        self.model_path = model_path
        self.index_path = index_path
        
        # Audio Device State
        self.input_device = None
        self.output_device = None
        self.stream = None
        self.monitor_stream = None
        self.stream_lock = threading.Lock()
        
        # Audio Levels
        self.input_level = 0.0
        self.output_level = 0.0
        
        self.worker_process = None
        self.icon = None

    def create_emoji_image(self, emoji="🔊", size=64):
        image = Image.new('RGBA', (size, size), (255, 255, 255, 0))
        draw = ImageDraw.Draw(image)
        font_paths = ["/System/Library/Fonts/Apple Color Emoji.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"]
        font = None
        for path in font_paths:
            if os.path.exists(path):
                try: font = ImageFont.truetype(path, size - 10); break
                except: continue
        if font is None: font = ImageFont.load_default()
        try:
            draw.text((size//2, size//2), emoji, font=font, fill=(255, 255, 255, 255), anchor="mm")
        except:
            draw.text((10, 10), emoji, font=font, fill=(255, 255, 255, 255))
        return image

    def update_devices(self, input_id=None, output_id=None):
        with self.stream_lock:
            if input_id is not None: self.input_device = input_id
            if output_id is not None: self.output_device = output_id
        print(f"\n[*] デバイス切り替え: 入力={self.input_device}, 出力={self.output_device}")
        self.trigger_restart()

    def toggle_monitor(self):
        self.is_monitoring = not self.is_monitoring
        print(f"\n[*] モニタリング: {'ON' if self.is_monitoring else 'OFF'}")
        self.trigger_restart()

    def trigger_restart(self):
        with self.stream_lock:
            if self.stream:
                try: self.stream.stop(); self.stream.close()
                except: pass
                self.stream = None
            if self.monitor_stream:
                try: self.monitor_stream.stop(); self.monitor_stream.close()
                except: pass
                self.monitor_stream = None
        # Drain queues
        while not self.input_queue.empty():
            try: self.input_queue.get_nowait()
            except: break
        while not self.output_queue.empty():
            try: self.output_queue.get_nowait()
            except: break

    def on_quit(self, icon, item):
        if self.stop_event.is_set(): return
        sys.stdout.write("\n[*] 終了処理中 (Shutting down safely)...\n")
        sys.stdout.flush()
        self.stop_event.set()
        self.trigger_restart()
        
        if self.worker_process:
            self.input_queue.put(None)
            self.worker_process.terminate()
            self.worker_process.join(timeout=1.0)
            
        if icon:
            try: icon.stop()
            except: pass

    def callback_unified(self, indata, outdata, frames, time_info, status):
        in_float = indata.flatten()
        self.input_level = np.sqrt(np.mean(in_float**2))
        
        # Decimation (32k -> 16k)
        in_16k = in_float[::2]
        
        # Norm/Gain: Boost and scale to int16 range for RVC engine
        rms = np.sqrt(np.mean(in_16k**2))
        if rms > 0.0001:
            # Target a healthy RMS of ~10000 in the int16 range
            in_16k = (in_16k / (rms + 1e-9)) * 8000.0
        else:
            in_16k = in_16k * 32768.0
        
        # Fit to CHUNK_SIZE
        if len(in_16k) != CHUNK_SIZE:
            if len(in_16k) < CHUNK_SIZE:
                in_16k = np.pad(in_16k, (0, CHUNK_SIZE - len(in_16k)))
            else:
                in_16k = in_16k[:CHUNK_SIZE]
        
        # Send to worker process (only if voice detected)
        NOISE_GATE_THRESHOLD = 0.01 # Adjust if needed
        if self.input_level > NOISE_GATE_THRESHOLD:
            self.input_queue.put(in_16k)
        
        # Receive from worker process via local bridge
        try:
            out_chunk = self.local_output_queue.get_nowait()
            out_f = out_chunk.astype(np.float32) / 32768.0
            self.output_level = np.sqrt(np.mean(out_f**2))
            
            if len(out_f) > frames: out_f = out_f[:frames]
            elif len(out_f) < frames: out_f = np.pad(out_f, (0, frames - len(out_f)))
            
            outdata[:] = out_f.reshape(-1, 1)
            
            if self.is_monitoring:
                try: self.monitor_queue.put_nowait(out_f)
                except: pass
        except queue.Empty:
            outdata.fill(0)
            self.output_level = 0.0

    def callback_monitor(self, outdata, frames, time_info, status):
        try:
            data = self.monitor_queue.get_nowait()
            if len(data) > frames: data = data[:frames]
            elif len(data) < frames: data = np.pad(data, (0, frames - len(data)))
            outdata[:] = data.reshape(-1, 1)
        except queue.Empty:
            outdata.fill(0)

    def meter_loop(self):
        while not self.stop_event.is_set():
            i_val = int(min(1.0, self.input_level * 10.0) * 50)
            o_val = int(min(1.0, self.output_level * 10.0) * 50)
            in_bar = "#" * i_val
            out_bar = "#" * o_val
            sys.stdout.write(f"\r 入力: [{in_bar:<50}] | 出力: [{out_bar:<50}]")
            sys.stdout.flush()
            time.sleep(0.05)

    def bridge_loop(self):
        """Bridge multiprocessing.Queue to local threading.Queue for audio callback safety."""
        while not self.stop_event.is_set():
            try:
                # Use a small timeout to stay responsive
                chunk = self.output_queue.get(timeout=0.1)
                if chunk is not None:
                    # Catch-up: don't let the local queue grow too large
                    if self.local_output_queue.qsize() > 5:
                        try: self.local_output_queue.get_nowait()
                        except: pass
                    self.local_output_queue.put(chunk)
            except queue.Empty:
                continue
            except Exception as e:
                time.sleep(0.1)

    def audio_loop(self):
        BLOCK_SIZE = CHUNK_SIZE * (OUTPUT_SR // INPUT_SR)
        while not self.stop_event.is_set():
            in_id, out_id, mon = self.input_device, self.output_device, self.is_monitoring
            try:
                with self.stream_lock:
                    self.stream = sd.Stream(
                        device=(in_id, out_id),
                        samplerate=OUTPUT_SR,
                        blocksize=BLOCK_SIZE,
                        dtype='float32',
                        channels=1,
                        callback=self.callback_unified
                    )
                    self.stream.start()
                    if mon:
                        try:
                            self.monitor_stream = sd.OutputStream(
                                samplerate=OUTPUT_SR,
                                blocksize=BLOCK_SIZE,
                                dtype='float32',
                                channels=1,
                                callback=self.callback_monitor
                            )
                            self.monitor_stream.start()
                        except: pass

                while not self.stop_event.is_set() and self.input_device == in_id and \
                      self.output_device == out_id and self.is_monitoring == mon:
                    time.sleep(0.2)
                self.trigger_restart()
                time.sleep(0.5)
            except Exception as e:
                time.sleep(1.0)

    def setup_tray(self):
        devices = sd.query_devices()
        in_list = [(i, d['name']) for i, d in enumerate(devices) if d['max_input_channels'] > 0]
        out_list = [(i, d['name']) for i, d in enumerate(devices) if d['max_output_channels'] > 0]
        
        def make_in_action(idx): return lambda: self.update_devices(input_id=idx)
        def make_out_action(idx): return lambda: self.update_devices(output_id=idx)
        
        menu_items = [
            item('入力デバイス (Input)', pystray.Menu(*[
                item(name, make_in_action(idx), checked=lambda i, idx=idx: self.input_device == idx)
                for idx, name in in_list
            ])),
            item('出力デバイス (Output)', pystray.Menu(*[
                item(name, make_out_action(idx), checked=lambda i, idx=idx: self.output_device == idx)
                for idx, name in out_list
            ])),
            item('自分の声を聴く (Monitoring)', self.toggle_monitor, checked=lambda i: self.is_monitoring),
            pystray.Menu.SEPARATOR,
            item('終了 (Quit)', self.on_quit)
        ]
        self.icon = pystray.Icon("VOICEVOX", self.create_emoji_image(), "VOICEVOX Changer", pystray.Menu(*menu_items))
        self.icon.run()

    def run(self):
        # Start Worker Process
        self.worker_process = mp.Process(
            target=rvc_worker_process,
            args=(self.input_queue, self.output_queue, self.stop_event, 
                  self.model_path, self.index_path, self.f0_up_key, self.f0_method),
            daemon=True
        )
        self.worker_process.start()
        
        # Start Threads
        target_threads = [
            (self.audio_loop, "AudioLoop"),
            (self.meter_loop, "MeterLoop"),
            (self.bridge_loop, "BridgeLoop")
        ]
        for target, name in target_threads:
            t = threading.Thread(target=target, name=name, daemon=True)
            t.start()
            
        print("\n" + "="*50)
        print("  ⚡️ VOICEVOX RVC GOLD BUILD (Multi-Process)")
        print("  - トレイアイコンからデバイスを選択してください")
        print("  - 自分の声を聴くには 'Monitor' をONにしてください")
        print("="*50 + "\n")
        
        try:
            self.setup_tray()
        except KeyboardInterrupt:
            self.on_quit(None, None)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Real-time RVC Voice Changer")
    parser.add_argument("--f0", type=int, default=12)
    parser.add_argument("--input", type=int)
    parser.add_argument("--output", type=int)
    args = parser.parse_args()

    if not os.path.exists(MODEL_PATH):
        print(f"[!] モデル見つかりません: {MODEL_PATH}")
        sys.exit(1)

    vc = RealTimeVC(MODEL_PATH, INDEX_PATH, f0_up_key=args.f0)
    vc.input_device = args.input
    vc.output_device = args.output
    
    try:
        vc.run()
    except KeyboardInterrupt:
        vc.on_quit(None, None)
