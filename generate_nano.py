from blockrun_llm import ImageClient
import sys

def generate_thumbnail(prompt, output_path):
    client = ImageClient()
    try:
        print(f"Generating image for: {prompt}")
        result = client.generate(
            prompt=prompt,
            model="google/nano-banana"
        )
        url = result.data[0].url
        print(f"Image generated: {url}")
        
        # Download image
        import httpx
        with httpx.stream("GET", url) as r:
            with open(output_path, "wb") as f:
                for data in r.iter_bytes():
                    f.write(data)
        print(f"Saved to {output_path}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 generate_nano.py 'prompt' 'output.png'")
        sys.exit(1)
    generate_thumbnail(sys.argv[1], sys.argv[2])
