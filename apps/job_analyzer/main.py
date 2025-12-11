import os
import argparse
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def load_file(filepath):
    """Loads text from a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

def analyze_job(job_description, requirements):
    """Analyzes the job description against requirements using Gemini."""
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        print("Please set your API key in the .env file.")
        sys.exit(1)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = f"""
    あなたは優秀なキャリアアドバイザーです。
    以下の「求人情報」とユーザーの「希望条件」を比較し、この求人がユーザーにおすすめできるかどうかを判定してください。

    ## 希望条件
    {requirements}

    ## 求人情報
    {job_description}

    ## 出力フォーマット
    以下の形式で出力してください。

    ---
    **総合判定**: [S/A/B/C] (Sが最高、Cが最低)
    **推奨理由**:
    - (理由1)
    - (理由2)
    **懸念点**:
    - (懸念点1)
    - (懸念点2)
    **詳細分析**:
    (各希望条件に対する適合度を簡単に解説)
    ---
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error analyzing job: {e}"

def main():
    parser = argparse.ArgumentParser(description='Analyze job offers based on your requirements.')
    parser.add_argument('input', help='Path to the job description file (text format)')
    
    args = parser.parse_args()
    
    # 1. Load User Requirements
    # Assumes requirements.md is in the same directory as this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_path = os.path.join(script_dir, "requirements.md")
    
    if not os.path.exists(requirements_path):
        print("Error: requirements.md not found.")
        print("Please create requirements.md with your job preferences.")
        sys.exit(1)
        
    requirements = load_file(requirements_path)
    print("Loaded requirements.")

    # 2. Load Job Description
    job_description = load_file(args.input)
    print(f"Loaded job description from {args.input}.")

    # 3. Analyze
    print("Analyzing job offer...")
    result = analyze_job(job_description, requirements)
    
    # 4. Output Result
    print("\n" + "="*30)
    print("       ANALYSIS RESULT       ")
    print("="*30 + "\n")
    print(result)

if __name__ == "__main__":
    main()
