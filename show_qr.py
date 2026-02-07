from blockrun_llm import setup_agent_wallet, generate_wallet_qr_ascii
client = setup_agent_wallet()
print("Please fund your wallet to use Nano Banana Pro for high-quality thumbnails:")
print(generate_wallet_qr_ascii(client.get_wallet_address()))
print(f"Wallet Address: {client.get_wallet_address()}")
