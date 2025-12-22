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

def save_file(filepath, content):
    """Saves text to a file."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error saving file: {e}")
        return False

from playwright.sync_api import sync_playwright

def fetch_text_from_url(url):
    """Fetches text content from a URL using Playwright (Headless Browser) with enhanced robustness."""
    try:
        with sync_playwright() as p:
            # Using higher quality browser launch arguments
            browser = p.chromium.launch(
                headless=True,
                args=[
                    '--disable-http2',
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            )
            
            # Context with more complete browser fingerprint
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1280, 'height': 800},
                device_scale_factor=1,
                is_mobile=False,
                has_touch=False,
                locale='ja-JP',
                timezone_id='Asia/Tokyo',
                ignore_https_errors=True
            )
            
            page = context.new_page()
            
            # Set additional headers
            page.set_extra_http_headers({
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1"
            })

            # Go to URL with slightly longer timeout and better wait strategy
            # Use 'networkidle' for more reliable content loading on JS-heavy sites
            try:
                page.goto(url, timeout=45000, wait_until='networkidle')
            except Exception as e:
                print(f"Networkidle failed, falling back to domcontentloaded: {e}")
                page.goto(url, timeout=30000, wait_until='domcontentloaded')

            # Wait a bit just in case of slow JS rendering
            page.wait_for_timeout(2000)
            
            # Get content
            content = page.content()
            browser.close()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            # Remove exhaustive list of noise elements
            noise_elements = [
                "script", "style", "header", "footer", "nav", "noscript", 
                "aside", "iframe", "svg", "button", "input", "form"
            ]
            for element in soup(noise_elements):
                element.decompose()
                
            # Focus on main content if possible (common job site structures)
            main_content = soup.find('main') or soup.find('div', id='content') or soup.find('div', class_='content') or soup
            
            text = main_content.get_text(separator='\n')
            
            # Clean text thoroughly
            lines = []
            for line in text.splitlines():
                stripped = line.strip()
                if stripped and len(stripped) > 2: # Ignore very short lines (often debris)
                    lines.append(stripped)
            
            cleaned_text = '\n'.join(lines)
            
            # If cleaned text is too short, the scraping might have failed or hit a bot wall
            if len(cleaned_text) < 100:
                return f"Error: Fetched content is too short ({len(cleaned_text)} chars). Site might be blocking or content is empty."
            
            return cleaned_text

    except Exception as e:
        print(f"Error fetching URL with Playwright: {e}")
        return f"Error fetching URL: {e}"

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
    適合スコア: [0-100の数値]
    
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
