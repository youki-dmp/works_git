import os
import sys

# Add the rvc-python lib to path if needed (though it should be installed)
# .venv/bin/python3 will have it in path.

from rvc_python.infer import RVCInference
import torch

MODEL_PATH = "model/meimei.pth"
INDEX_PATH = "model/added_IVF1149_Flat_nprobe_1_meimei_v2.index"

def test_load():
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"Using device: {device}")
    
    try:
        rvc = RVCInference(device=device)
        print("RVCInference initialized (Base models should be downloaded now).")
        
        rvc.load_model(MODEL_PATH, index_path=INDEX_PATH)
        print("Meimei Himari model loaded successfully!")
        
        print(f"Target Sample Rate: {rvc.vc.tgt_sr}")
        
    except Exception as e:
        print(f"Failed to load model: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_load()
