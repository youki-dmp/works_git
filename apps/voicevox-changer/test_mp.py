import torch
import numpy as np
import multiprocessing as mp
import time
import sys
import os

# Set start method for Mac
try:
    mp.set_start_method('spawn', force=True)
except:
    pass

def rvc_worker(in_q, out_q, model_path, index_path):
    print("[Worker] RVC Process starting...")
    try:
        from rvc_python.infer import RVCInference
        rvc = RVCInference(device="cpu")
        rvc.load_model(model_path, index_path=index_path)
        print("[Worker] Model loaded.")
        
        while True:
            item = in_q.get()
            if item is None: break
            
            # Dummy inference simulation
            # (In real use, we'd call pipeline here)
            out = item * 0.5
            out_q.put(out)
            
    except Exception as e:
        print(f"[Worker] Error: {e}")

if __name__ == "__main__":
    MODEL_PATH = "model/meimei.pth"
    INDEX_PATH = "model/added_IVF1149_Flat_nprobe_1_meimei_v2.index"
    
    in_q = mp.Queue()
    out_q = mp.Queue()
    p = mp.Process(target=rvc_worker, args=(in_q, out_q, MODEL_PATH, INDEX_PATH))
    p.start()
    
    print("[Main] Sending data...")
    test_data = np.random.rand(4096).astype(np.float32)
    in_q.put(test_data)
    
    try:
        result = out_q.get(timeout=10)
        print("[Main] Received result successfully!")
    except Exception as e:
        print(f"[Main] Failed to receive: {e}")
        
    in_q.put(None)
    p.join()
    print("[Main] Worker joined.")
