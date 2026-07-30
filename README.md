# TermuxPad — Web Code Editor for Termux & Linux

A full-featured browser-based code editor that runs on Android via Termux or on Linux desktop systems.

## Quick Start

### 1. Clone or download this repository
```bash
cd ~/Downloads
git clone <repository-url> termux-codepad
cd termux-codepad
```

### 2. Install dependencies

**Option A: Automatic setup (recommended)**
```bash
bash setup.sh
```

**Option B: Manual setup with virtual environment (Linux)**
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install flask flask-cors
```

**Option C: Manual setup (Termux)**
```bash
pkg install python python-pip
pip install flask flask-cors
```

### 3. Start the server
```bash
# If using virtual environment (Linux)
source venv/bin/activate
python server.py

# Or directly (Termux)
python server.py
```

### 4. Open in browser
Navigate to: **http://localhost:8080**

---

## Features

| Feature | Description |
|---|---|
| **Syntax Highlighting** | Python, JS, TS, C/C++, Java, Go, Rust, Bash, Ruby, PHP, Lua, Perl, HTML, CSS, Markdown |
| **Code Execution** | Run code directly from the editor |
| **File Explorer** | Browse, create, rename, delete files and folders |
| **Multi-tab Editor** | Open multiple files simultaneously |
| **Terminal** | Built-in bash terminal with history |
| **Stdin Support** | Provide input to programs before running |
| **Themes** | Dracula, Monokai, Material, Nord |
| **Resizable Panels** | Drag panel borders to resize |
| **Code Folding** | Collapse/expand code blocks |
| **Bracket Matching** | Auto-close and highlight matching brackets |
| **Quick Access** | Platform-aware quick navigation (Termux/Linux paths) |
| **Project Explorer** | Full-screen file browser with folder navigation |

## New Features

### ✨ Platform-Aware Quick Links
The explorer now automatically detects your platform and shows appropriate quick access links:
- **Termux**: Home, Storage, Downloads, SDCard, Tmp
- **Linux**: Home, Documents, Downloads, Desktop, Tmp

### 📁 Create Files & Folders in Explorer
New buttons in the explorer allow you to create files and folders directly in the current directory without switching to the sidebar.

### 🔧 Cross-Platform Setup Script
The setup script now works on both Termux and Linux, automatically handling virtual environments.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save file |
| `Ctrl+N` | New file |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+O` | Open project explorer |
| `F5` / `Ctrl+Enter` | Run code |
| `F11` | Fullscreen toggle |
| `Ctrl+/` | Toggle comment |
| `Escape` | Close modal/explorer |

## Language Support

To run code in a language, install the runtime:

**Termux:**
```bash
pkg install nodejs        # JavaScript
pkg install clang         # C / C++
pkg install ruby          # Ruby
pkg install php           # PHP
pkg install lua54         # Lua
pkg install perl          # Perl
pkg install openjdk-17    # Java
pkg install golang        # Go
pkg install rust          # Rust
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install nodejs       # JavaScript
sudo apt install build-essential  # C / C++
sudo apt install ruby         # Ruby
sudo apt install php-cli      # PHP
sudo apt install lua5.4       # Lua
sudo apt install perl         # Perl
sudo apt install default-jdk  # Java
sudo apt install golang-go    # Go
sudo apt install rustc        # Rust
```

## Workspace

All project files are stored in: `~/termuxpad-workspace/` (default)

You can open any folder as a project using the "Open Project" button.

## Access from Other Devices (same WiFi)

**Termux:**
```bash
# Find your phone's IP
ip route show | grep src
```

**Linux:**
```bash
# Find your computer's IP
hostname -I | awk '{print $1}'
```

Then open `http://YOUR_IP:8080` from any device on the same network.

The server binds to `0.0.0.0` by default for network access.

## Project Structure

```
termux-codepad/
├── server.py              # Flask backend
├── setup.sh              # Cross-platform setup script
├── static/
│   ├── index.html        # Main UI
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       ├── main.js       # Entry point
│       ├── editor.js     # CodeMirror integration
│       ├── files.js      # File operations
│       ├── runner.js     # Code execution
│       ├── terminal.js   # Terminal emulation
│       ├── explorer.js   # Project explorer
│       ├── ui.js         # UI utilities
│       └── icons.js      # SVG icons
└── venv/                 # Virtual environment (Linux)
```

## Configuration

### Change Port
```bash
PORT=3000 python server.py
```

### Change Host
```bash
HOST=127.0.0.1 python server.py  # Localhost only
```

## Terminal Limitations

The built-in terminal is **non-interactive** and has some limitations:

### ❌ Won't Work
- **Interactive editors**: `nano`, `vim`, `vi`, `emacs`
  - **Solution**: Use the built-in code editor (Ctrl+N or Open File)
- **Interactive programs**: `htop`, `top`, `less`, `more`
  - **Solution**: Use alternatives like `ps aux` or `cat filename`
- **Interactive shells**: `python` (REPL), `node` (REPL), `irb`
  - **Solution**: Use the code runner (F5) to execute scripts
- **SSH sessions**: Cannot maintain interactive SSH connections
  - **Solution**: Use a dedicated terminal app

### ✅ Will Work
- File operations: `ls`, `cat`, `cp`, `mv`, `rm`, `mkdir`
- Text processing: `grep`, `sed`, `awk`, `find`
- System info: `pwd`, `whoami`, `date`, `ps aux`
- Script execution: `python script.py`, `node app.js`, `bash script.sh`
- Package management: `pip install`, `npm install`, `pkg install`

---

## Troubleshooting

### "externally-managed-environment" error (Linux)
Use a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors
```

### "Command not found" errors when running code
Install the required language runtime (see Language Support section).

### Quick links don't work
Some paths may not exist on your system. The app will show an error message for inaccessible paths.

### Port already in use
Change the port:
```bash
PORT=8081 python server.py
```

## Platform Compatibility

| Platform | Status | Notes |
|---|---|---|
| Termux (Android) | ✅ Tested | Primary target platform |
| Linux Desktop | ✅ Tested | Fully supported |
| macOS | ⚠️ Untested | Should work, may need adjustments |
| Windows WSL | ⚠️ Untested | Should work in WSL environment |

## Security Notes

- The app is designed for **local development only**
- Do not expose to the internet without proper security measures
- File operations are restricted to prevent system directory access
- Always run in a trusted network environment

## Recent Changes

See [BUGFIXES.md](BUGFIXES.md) and [FEATURES_ADDED.md](FEATURES_ADDED.md) for detailed information about recent improvements.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style
- Test on both Termux and Linux if possible
- Update documentation for new features

## License

MIT License - See LICENSE file for details

## Credits

- Built with Flask (Python backend)
- CodeMirror (code editor)
- Bootstrap Icons (UI icons)
- Designed for Termux and Linux environments
