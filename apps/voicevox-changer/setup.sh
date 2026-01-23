#!/bin/bash

# Configuration
MODEL_URL="https://huggingface.co/sxndypz/rvc-v2-models/resolve/main/meimei.zip"
MODEL_DIR="model"
VENV_DIR=".venv"

echo "Setting up VOICEVOX Changer (RVC Version)..."

# 1. Setup virtual environment if not exists
if [ -d "$VENV_DIR" ]; then
    echo "Removing old virtual environment..."
    rm -rf "$VENV_DIR"
fi

echo "Creating virtual environment with Python 3.11..."
python3.11 -m venv "$VENV_DIR"

# 2. Install dependencies
echo "Installing dependencies..."
./"$VENV_DIR"/bin/pip install --upgrade pip setuptools wheel
./"$VENV_DIR"/bin/pip install -r requirements.txt

# 3. Download and extract model
mkdir -p "$MODEL_DIR"
if [ ! -f "$MODEL_DIR/meimei.pth" ]; then
    if [ ! -f "$MODEL_DIR/meimei.zip" ]; then
        echo "Downloading Meimei Himari RVC model..."
        curl -L "$MODEL_URL" -o "$MODEL_DIR/meimei.zip"
    fi
    echo "Extracting model..."
    unzip -o "$MODEL_DIR/meimei.zip" -d "$MODEL_DIR"
    echo "Cleaning up zip file..."
    rm "$MODEL_DIR/meimei.zip"
fi

echo "Setup completed successfully!"
