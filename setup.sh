#!/data/data/com.termux/files/usr/bin/bash
# TermuxPad Setup Script
# Run this once to install dependencies

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     TermuxPad - Setup Script         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Update packages
echo "[1/4] Updating package list..."
pkg update -y 2>/dev/null || true

# Install Python
echo "[2/4] Installing Python & pip..."
pkg install -y python python-pip 2>/dev/null || true

# Install Flask via pip
echo "[3/4] Installing Flask & Flask-CORS..."
pip install flask flask-cors --quiet

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
echo "  To start TermuxPad:"
echo "    python3 server.py"
echo ""
echo "  Then open your browser:"
echo "    http://localhost:8080"
echo ""
