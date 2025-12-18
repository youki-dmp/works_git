import os
import sys
import requests
from bs4 import BeautifulSoup
import markdown
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
        return ""

from playwright.sync_api import sync_playwright

def fetch_text_from_url(url):
    """Fetches text content from a URL using Playwright (Headless Browser)."""
    try:
        with sync_playwright() as p:
            # Launch with HTTP/2 disabled to avoid protocol errors on strict sites
            browser = p.chromium.launch(
                headless=True,
                args=['--disable-http2']
            )
            
            # Create a context with a realistic Mac user agent
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1280, 'height': 800},
                ignore_https_errors=True
            )
            
            page = context.new_page()
            
            # Go to URL and wait for load
            # 'domcontentloaded' is faster than 'networkidle' but usually sufficient for text
            page.goto(url, timeout=60000, wait_until='domcontentloaded')
            
            # Get content
            content = page.content()
            browser.close()
            
            # Parse with BeautifulSoup as before
            soup = BeautifulSoup(content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "header", "footer", "nav", "noscript"]):
                script.decompose()
                
            text = soup.get_text()
            
            # Clean text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text

    except Exception as e:
        print(f"Error fetching URL with Playwright: {e}")
        return f"Error fetching URL: {e}"

def generate_html_report_content(markdown_content):
    """Generates HTML content from Markdown (body only, no full html wrapper)."""
    return markdown.markdown(markdown_content)

def analyze_job_content(job_description, requirements):
    """Analyzes the job description against requirements using Gemini."""
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY not found."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = f"""
    あなたは優秀なキャリアアドバイザーです。
    以下の「求人情報」とユーザーの「希望条件」を比較し、この求人がユーザーにおすすめできるかどうかを判定してください。

    ## 希望条件
    {requirements}

    ## 求人情報
    {job_description[:20000]} 

    ## 出力フォーマット
    以下のMarkdown形式で出力してください。見出しなどは適切に使用してください。

    # 総合判定: [S/A/B/C]
    
    ## 推奨理由
    - (理由1)
    - (理由2)

    ## 懸念点
    - (懸念点1)
    - (懸念点2)

    ## 詳細分析
    (各希望条件に対する適合度を解説)
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error analyzing job: {e}"
