import os
import json
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, render_template, request, jsonify, abort
from job_logic import fetch_text_from_url, analyze_job_content, load_file, generate_html_report_content

app = Flask(__name__)

# Config
LOGS_DIR = os.path.join(os.path.dirname(__file__), 'logs')
REQUIREMENTS_PATH = os.path.join(os.path.dirname(__file__), 'requirements.md')
os.makedirs(LOGS_DIR, exist_ok=True)

# Helper to load requirements once or reload on request (here reloading to keep it fresh)
def get_requirements():
    return load_file(REQUIREMENTS_PATH)

def process_single_url(url):
    """Processes a single URL: fetch -> analyze -> return result dict."""
    try:
        if not url.startswith('http'):
            return {"url": url, "status": "error", "message": "Invalid URL"}
        
        job_text = fetch_text_from_url(url)
        if job_text.startswith("Error"):
             return {"url": url, "status": "error", "message": job_text}
        
        requirements = get_requirements()
        analysis_markdown = analyze_job_content(job_text, requirements)
        analysis_html = generate_html_report_content(analysis_markdown)
        
        # Parse basic result (Rank) from markdown if possible, for summary
        rank = "Unknown"
        if "総合判定: S" in analysis_markdown or "総合判定: **S" in analysis_markdown: rank = "S"
        elif "総合判定: A" in analysis_markdown or "総合判定: **A" in analysis_markdown: rank = "A"
        elif "総合判定: B" in analysis_markdown or "総合判定: **B" in analysis_markdown: rank = "B"
        elif "総合判定: C" in analysis_markdown or "総合判定: **C" in analysis_markdown: rank = "C"

        result_data = {
            "id": str(uuid.uuid4()),
            "url": url,
            "timestamp": datetime.now().isoformat(),
            "rank": rank,
            "markdown": analysis_markdown,
            "html": analysis_html,
            "status": "success"
        }
        
        # Save Log
        log_path = os.path.join(LOGS_DIR, f"{result_data['id']}.json")
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
            
        return result_data

    except Exception as e:
        return {"url": url, "status": "error", "message": str(e)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    urls = data.get('urls', [])
    
    # Validation
    if not urls or not isinstance(urls, list):
        return jsonify({"error": "Invalid input. 'urls' list required."}), 400
    
    # Limit processing
    urls = urls[:5] 
    
    results = []
    # Use ThreadPoolExecutor for concurrent processing
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_single_url, url) for url in urls]
        for future in futures:
            results.append(future.result())
            
    return jsonify({"results": results})

@app.route('/history', methods=['GET'])
def history():
    """Returns list of past logs (summary only)."""
    logs = []
    try:
        files = sorted(os.listdir(LOGS_DIR), reverse=True) # basic sort by name/timestamp if uuid not used
        # Sort by mtime
        files.sort(key=lambda x: os.path.getmtime(os.path.join(LOGS_DIR, x)), reverse=True)
        
        for filename in files:
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(LOGS_DIR, filename), 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        logs.append({
                            "id": data.get("id"),
                            "url": data.get("url"),
                            "rank": data.get("rank"),
                            "timestamp": data.get("timestamp"),
                            "status": data.get("status")
                        })
                except:
                    continue
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    return jsonify({"logs": logs})

@app.route('/log/<log_id>', methods=['GET'])
def get_log(log_id):
    """Returns full log details."""
    log_path = os.path.join(LOGS_DIR, f"{log_id}.json")
    if not os.path.exists(log_path):
        return abort(404)
    
    with open(log_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
