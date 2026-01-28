from blockrun_llm import ImageClient, setup_agent_wallet
import sys

def main():
    try:
        # Initialize wallet/client
        wallet_client = setup_agent_wallet()
        print(f"Wallet address: {wallet_client.get_wallet_address()}")
        balance = wallet_client.get_balance()
        print(f"Current balance: ${balance:.2f} USDC")
        
        if balance < 0.01:
            print("Insufficient balance to generate image. Please fund the wallet.")
            return

        image_client = ImageClient()
        prompt = (
            "Photorealistic portrait of a 54-year-old Japanese female, 'Kumiko Sato'. "
            "Natural black hair with soft waves, wearing an elegant cream-colored cardigan. "
            "Warm and intelligent eyes with gentle smile lines. Background: A cozy living room "
            "with soft lighting, bookshelves, and a window with a garden view. 8k resolution, "
            "cinematic lighting, high-end commercial photography style, clear facial features."
        )
        
        print(f"Generating image for prompt: {prompt}")
        # Using nano-banana-pro if available, otherwise fallback to nano-banana
        # The skill doc says 'google/nano-banana' is $0.01
        result = image_client.generate(prompt, model="google/nano-banana-pro")
        url = result.data[0].url
        print(f"IMAGE_URL: {url}")
        
    except Exception as e:
        print(f"Error: {e}")
        # Fallback to nano-banana if pro fails or isn't specified
        try:
             result = image_client.generate(prompt, model="google/nano-banana")
             print(f"IMAGE_URL: {result.data[0].url}")
        except Exception as e2:
             print(f"Fallback Error: {e2}")

if __name__ == "__main__":
    main()
