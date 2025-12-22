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

def format_analysis_result(url_or_text, analysis_markdown):
    """Common formatter for analysis results."""
    from job_logic import generate_html_report_content
    analysis_html = generate_html_report_content(analysis_markdown)
    
    # Parse basic result (Rank and Score) from markdown
    rank = "Unknown"
    score = 0
    import re
    
    rank_match = re.search(r"総合判定:\s?([\*]*)([SABC])", analysis_markdown)
    if rank_match:
        rank = rank_match.group(2)
    
    score_match = re.search(r"適合スコア:\s?(\d+)", analysis_markdown)
    if score_match:
        try:
            score = int(score_match.group(1))
        except:
            pass

    result_data = {
        "id": str(uuid.uuid4()),
        "url": url_or_text[:100] + ("..." if len(url_or_text) > 100 else ""),
        "timestamp": datetime.now().isoformat(),
        "rank": rank,
        "score": score,
        "markdown": analysis_markdown,
        "html": analysis_html,
        "status": "success"
    }
    
    # Save Log
    log_path = os.path.join(LOGS_DIR, f"{result_data['id']}.json")
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
        
    return result_data

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
        return format_analysis_result(url, analysis_markdown)

    except Exception as e:
        return {"url": url, "status": "error", "message": str(e)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    urls = data.get('urls', [])
    
    if not urls or not isinstance(urls, list):
        return jsonify({"error": "Invalid input. 'urls' list required."}), 400
    
    urls = urls[:5] 
    results = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_single_url, url) for url in urls]
        for future in futures:
            results.append(future.result())
            
    return jsonify({"results": results})

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    """Analyzes raw job description text."""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "Text is required"}), 400
        
    try:
        requirements = get_requirements()
        analysis_markdown = analyze_job_content(text, requirements)
        result = format_analysis_result("Direct Text Input", analysis_markdown)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/requirements', methods=['GET', 'POST'])
def handle_requirements():
    """Handles fetching and updating requirements.md."""
    from job_logic import save_file
    if request.method == 'POST':
        data = request.json
        content = data.get('content', '')
        if save_file(REQUIREMENTS_PATH, content):
            return jsonify({"status": "success"})
        else:
            return jsonify({"status": "error", "message": "Failed to save requirements"}), 500
    else:
        content = get_requirements()
        return jsonify({"content": content})

@app.route('/history', methods=['GET'])
def history():
    """Returns list of past logs (summary only)."""
    logs = []
    try:
        files = sorted(os.listdir(LOGS_DIR), reverse=True)
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
                            "score": data.get("score", 0),
                            "timestamp": data.get("timestamp"),
                            "status": data.get("status")
                        })
                except:
                    continue
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    return jsonify({"logs": logs})

@app.route('/log/<log_id>', methods=['GET', 'DELETE'])
def get_log(log_id):
    """Returns or deletes full log details."""
    log_path = os.path.join(LOGS_DIR, f"{log_id}.json")
    if not os.path.exists(log_path):
        return abort(404)
    
    if request.method == 'DELETE':
        try:
            os.remove(log_path)
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    with open(log_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
