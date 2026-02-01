from blockrun_llm import generate_wallet_qr_ascii, get_wallet_address

print("### WALLET FUNDING REQUIRED ###")
print("To generate the high-quality anime-style images, please fund your BlockRun wallet.")
print(f"Address: {get_wallet_address()}")
print("\nScan this QR code to fund with USDC (Base network):")
print(generate_wallet_qr_ascii(get_wallet_address()))
