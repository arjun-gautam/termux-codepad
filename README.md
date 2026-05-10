# TermuxPad — Web Code Editor for Termux

A full-featured browser-based code editor that runs entirely on your Android device via Termux.

## Quick Start

### 1. Install dependencies (first time only)
```bash
bash setup.sh
```

Or manually:
```bash
pkg install python python-pip
pip install flask flask-cors
```

### 2. Start the server
```bash
python3 server.py
```

### 3. Open in browser
Navigate to: **http://localhost:8080**

---

## Features

| Feature | Description |
|---|---|
| **Syntax Highlighting** | Python, JS, TS, C/C++, Java, Go, Rust, Bash, Ruby, PHP, Lua, Perl, HTML, CSS, Markdown |
| **Code Execution** | Run code directly from the editor |
| **File Explorer** | Browse, create, rename, delete files |
| **Multi-tab Editor** | Open multiple files simultaneously |
| **Terminal** | Built-in bash terminal with history |
| **Stdin Support** | Provide input to programs before running |
| **Themes** | Dracula, Monokai, Material, Nord |
| **Resizable Panels** | Drag panel borders to resize |
| **Code Folding** | Collapse/expand code blocks |
| **Bracket Matching** | Auto-close and highlight matching brackets |

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save file |
| `Ctrl+N` | New file |
| `Ctrl+B` | Toggle sidebar |
| `F5` / `Ctrl+Enter` | Run code |
| `Ctrl+/` | Toggle comment |

## Language Support

To run code in a language, install the runtime via `pkg`:

```bash
pkg install nodejs        # JavaScript
pkg install clang         # C / C++
pkg install ruby          # Ruby
pkg install php           # PHP
pkg install lua54         # Lua
pkg install perl          # Perl
```

## Workspace

All files are stored in: `~/termuxpad-workspace/`

## Access from Other Devices (same WiFi)

Find your phone's IP address:
```bash
ip route show | grep src
```

Then open `http://YOUR_IP:8080` from any device on the same network.

To bind to all interfaces (default), the server uses `0.0.0.0`.
