from blockrun_llm import setup_agent_wallet
import sys

try:
    client = setup_agent_wallet()
    balance = client.get_balance()
    address = client.get_wallet_address()
    print(f"BALANCE: {balance}")
    print(f"ADDRESS: {address}")
except Exception as e:
    print(f"ERROR: {e}")
