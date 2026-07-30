#!/bin/bash
# TermuxPad Setup Script
# Run this once to install dependencies

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     TermuxPad - Setup Script         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Detect if we're in Termux or regular Linux
if [ -d "/data/data/com.termux" ]; then
  IS_TERMUX=true
  echo "📱 Detected: Termux environment"
else
  IS_TERMUX=false
  echo "💻 Detected: Linux environment"
fi

echo ""

# Check if in virtual environment
if [ -n "$VIRTUAL_ENV" ]; then
  echo "✓ Virtual environment detected: $VIRTUAL_ENV"
  IN_VENV=true
else
  IN_VENV=false
fi

# Install system packages
if [ "$IS_TERMUX" = true ]; then
  echo "[1/4] Updating package list..."
  pkg update -y 2>/dev/null || true

  echo "[2/4] Installing Python & pip..."
  pkg install -y python python-pip 2>/dev/null || true
else
  echo "[1/4] Checking Python installation..."
  if ! command -v python3 &> /dev/null; then
    echo "  Python3 not found. Please install it first:"
    echo "    sudo apt install python3 python3-pip python3-venv"
    exit 1
  fi
  echo "  ✓ Python3 found: $(python3 --version)"
fi

# Install Flask dependencies
echo "[3/4] Installing Flask & Flask-CORS..."

if [ "$IN_VENV" = true ]; then
  # We're in a virtual environment, use pip directly
  pip install flask flask-cors
elif [ "$IS_TERMUX" = true ]; then
  # Termux without venv
  pip install flask flask-cors --quiet
else
  # Regular Linux without venv - create one
  echo ""
  echo "  ⚠️  Not in a virtual environment!"
  echo "  Creating virtual environment..."
  
  if ! python3 -m venv venv 2>/dev/null; then
    echo "  Error: python3-venv not installed. Installing..."
    sudo apt install python3-venv -y || {
      echo "  Failed to install python3-venv"
      echo "  Please run: sudo apt install python3-venv"
      exit 1
    }
    python3 -m venv venv
  fi
  
  echo "  ✓ Virtual environment created: ./venv"
  echo "  Installing packages in virtual environment..."
  ./venv/bin/pip install flask flask-cors
  
  echo ""
  echo "  ℹ️  Virtual environment created. To activate it:"
  echo "     source venv/bin/activate"
  echo ""
fi

# Optional: install common language runtimes
echo ""
echo "[4/4] Optional language runtimes (press Enter to skip each):"

read -p "  Install Node.js (JavaScript)? [y/N]: " ans
if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
  pkg install -y nodejs 2>/dev/null || echo "  Skipped."
fi

read -p "  Install GCC (C/C++)? [y/N]: " ans
if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
  pkg install -y clang 2>/dev/null || echo "  Skipped."
fi

read -p "  Install Ruby? [y/N]: " ans
if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
  pkg install -y ruby 2>/dev/null || echo "  Skipped."
fi

read -p "  Install PHP? [y/N]: " ans
if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
  pkg install -y php 2>/dev/null || echo "  Skipped."
fi

read -p "  Install Lua? [y/N]: " ans
if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
  pkg install -y lua54 2>/dev/null || echo "  Skipped."
fi

echo ""
echo "✅ Setup complete!"
echo ""

if [ "$IN_VENV" = true ]; then
  echo "  To start TermuxPad:"
  echo "    python server.py"
elif [ "$IS_TERMUX" = false ] && [ -d "venv" ]; then
  echo "  To start TermuxPad:"
  echo "    source venv/bin/activate"
  echo "    python server.py"
else
  echo "  To start TermuxPad:"
  echo "    python3 server.py"
fi

echo ""
echo "  Then open your browser:"
echo "    http://localhost:8080"
echo ""
