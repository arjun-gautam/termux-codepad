#!/usr/bin/env python3
"""
TermuxPad - Web-based Code Editor for Termux
Run: python3 server.py
Access: http://localhost:8080
"""

import os
import sys
import json
import subprocess
import tempfile
import threading
import time
import signal
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS

app = Flask(__name__, static_folder='static')
CORS(app)

# Default workspace directory
DEFAULT_WORKSPACE = os.path.expanduser("~/termuxpad-workspace")
os.makedirs(DEFAULT_WORKSPACE, exist_ok=True)

# Active workspace (can be changed at runtime)
active_workspace = DEFAULT_WORKSPACE

# Track running processes
running_processes = {}
process_lock = threading.Lock()

def safe_path(rel_path):
    """Ensure path stays within active workspace."""
    if not rel_path or rel_path == '/':
        return active_workspace
    rel_path = rel_path.lstrip('/')
    abs_path = os.path.realpath(os.path.join(active_workspace, rel_path))
    if not abs_path.startswith(os.path.realpath(active_workspace)):
        return None
    return abs_path

def get_file_tree(directory, depth=0, max_depth=4):
    """Recursively get file tree relative to active_workspace."""
    if depth > max_depth:
        return []
    items = []
    try:
        entries = sorted(os.scandir(directory), key=lambda e: (not e.is_dir(), e.name.lower()))
        for entry in entries:
            if entry.name.startswith('.'):
                continue
            rel = os.path.relpath(entry.path, active_workspace)
            item = {
                'name': entry.name,
                'path': rel,
                'type': 'dir' if entry.is_dir() else 'file',
                'size': entry.stat().st_size if entry.is_file() else 0,
            }
            if entry.is_dir():
                item['children'] = get_file_tree(entry.path, depth + 1, max_depth)
            items.append(item)
    except PermissionError:
        pass
    return items


def browse_directory(directory):
    """List a real filesystem directory (unrestricted, for the explorer)."""
    items = []
    try:
        entries = sorted(os.scandir(directory), key=lambda e: (not e.is_dir(), e.name.lower()))
        for entry in entries:
            if entry.name.startswith('.'):
                continue
            items.append({
                'name': entry.name,
                'path': entry.path,
                'type': 'dir' if entry.is_dir() else 'file',
            })
    except PermissionError:
        pass
    return items

# ─── Static Files ──────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# ─── File API ──────────────────────────────────────────────────────────────────

@app.route('/api/files', methods=['GET'])
def list_files():
    path = request.args.get('path', '')
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    tree = get_file_tree(target)
    return jsonify({'tree': tree, 'workspace': active_workspace})


@app.route('/api/explorer/browse', methods=['GET'])
def explorer_browse():
    """Browse any directory on the real filesystem."""
    path = request.args.get('path', os.path.expanduser('~'))
    abs_path = os.path.realpath(path)
    if not os.path.isdir(abs_path):
        return jsonify({'error': 'Not a directory'}), 400
    parent = str(Path(abs_path).parent)
    items = browse_directory(abs_path)
    return jsonify({
        'path': abs_path,
        'parent': parent if parent != abs_path else None,
        'items': items,
    })


@app.route('/api/workspace/open', methods=['POST'])
def workspace_open():
    """Set a new active workspace directory."""
    global active_workspace
    data = request.get_json()
    path = data.get('path', '')
    abs_path = os.path.realpath(path)
    if not os.path.isdir(abs_path):
        return jsonify({'error': 'Not a directory'}), 400
    active_workspace = abs_path
    tree = get_file_tree(active_workspace)
    return jsonify({'success': True, 'workspace': active_workspace, 'tree': tree})


@app.route('/api/workspace/current', methods=['GET'])
def workspace_current():
    return jsonify({'workspace': active_workspace})

@app.route('/api/file', methods=['GET'])
def read_file():
    path = request.args.get('path', '')
    target = safe_path(path)
    if not target or not os.path.isfile(target):
        return jsonify({'error': 'File not found'}), 404
    try:
        with open(target, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        stat = os.stat(target)
        return jsonify({
            'content': content,
            'path': path,
            'name': os.path.basename(target),
            'size': stat.st_size,
            'modified': stat.st_mtime
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/file', methods=['POST'])
def write_file():
    data = request.get_json()
    path = data.get('path', '')
    content = data.get('content', '')
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    try:
        parent = os.path.dirname(target)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({'success': True, 'path': path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/file/new', methods=['POST'])
def new_file():
    data = request.get_json()
    path = data.get('path', '')
    ftype = data.get('type', 'file')  # 'file' or 'dir'
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    try:
        if ftype == 'dir':
            os.makedirs(target, exist_ok=True)
        else:
            parent = os.path.dirname(target)
            if parent:
                os.makedirs(parent, exist_ok=True)
            if not os.path.exists(target):
                with open(target, 'w') as f:
                    f.write('')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/file/delete', methods=['POST'])
def delete_file():
    data = request.get_json()
    path = data.get('path', '')
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    try:
        import shutil
        if os.path.isdir(target):
            shutil.rmtree(target)
        else:
            os.remove(target)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/file/rename', methods=['POST'])
def rename_file():
    data = request.get_json()
    old_path = data.get('old_path', '')
    new_path = data.get('new_path', '')
    src = safe_path(old_path)
    dst = safe_path(new_path)
    if not src or not dst:
        return jsonify({'error': 'Invalid path'}), 400
    try:
        os.rename(src, dst)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── Run Code API ──────────────────────────────────────────────────────────────

LANGUAGE_RUNNERS = {
    'python':     lambda f: ['python3', f],
    'python3':    lambda f: ['python3', f],
    'javascript': lambda f: ['node', f],
    'js':         lambda f: ['node', f],
    'typescript': lambda f: ['npx', 'ts-node', f],
    'ts':         lambda f: ['npx', 'ts-node', f],
    'bash':       lambda f: ['bash', f],
    'sh':         lambda f: ['sh', f],
    'ruby':       lambda f: ['ruby', f],
    'php':        lambda f: ['php', f],
    'perl':       lambda f: ['perl', f],
    'lua':        lambda f: ['lua', f],
    'r':          lambda f: ['Rscript', f],
    'java':       None,  # handled separately
    'c':          None,  # handled separately
    'cpp':        None,  # handled separately
    'c++':        None,  # handled separately
    'go':         lambda f: ['go', 'run', f],
    'rust':       None,  # handled separately
}

EXT_TO_LANG = {
    '.py': 'python', '.js': 'javascript', '.ts': 'typescript',
    '.sh': 'bash', '.bash': 'bash', '.rb': 'ruby', '.php': 'php',
    '.pl': 'perl', '.lua': 'lua', '.r': 'r', '.java': 'java',
    '.c': 'c', '.cpp': 'cpp', '.cc': 'cpp', '.go': 'go', '.rs': 'rust',
}

def run_code(code, language, stdin_data='', timeout=30):
    """Execute code and return output."""
    lang = language.lower()
    ext_map = {
        'python': '.py', 'python3': '.py', 'javascript': '.js', 'js': '.js',
        'typescript': '.ts', 'ts': '.ts', 'bash': '.sh', 'sh': '.sh',
        'ruby': '.rb', 'php': '.php', 'perl': '.pl', 'lua': '.lua',
        'r': '.r', 'java': '.java', 'c': '.c', 'cpp': '.cpp', 'c++': '.cpp',
        'go': '.go', 'rust': '.rs',
    }
    
    suffix = ext_map.get(lang, '.txt')
    tmp_dir = tempfile.mkdtemp()
    
    try:
        # Special case: Java needs class name matching filename
        if lang == 'java':
            import re
            match = re.search(r'public\s+class\s+(\w+)', code)
            classname = match.group(1) if match else 'Main'
            src_file = os.path.join(tmp_dir, f'{classname}.java')
        else:
            src_file = os.path.join(tmp_dir, f'code{suffix}')
        
        with open(src_file, 'w') as f:
            f.write(code)
        
        # Build command
        if lang in ('c', 'c++', 'cpp'):
            compiler = 'g++' if lang in ('cpp', 'c++') else 'gcc'
            out_file = os.path.join(tmp_dir, 'a.out')
            compile_proc = subprocess.run(
                [compiler, src_file, '-o', out_file, '-lm'],
                capture_output=True, text=True, timeout=30
            )
            if compile_proc.returncode != 0:
                return {'stdout': '', 'stderr': compile_proc.stderr, 'returncode': compile_proc.returncode, 'error': 'Compilation failed'}
            cmd = [out_file]
        elif lang == 'java':
            compile_proc = subprocess.run(
                ['javac', src_file],
                capture_output=True, text=True, timeout=30, cwd=tmp_dir
            )
            if compile_proc.returncode != 0:
                return {'stdout': '', 'stderr': compile_proc.stderr, 'returncode': compile_proc.returncode, 'error': 'Compilation failed'}
            cmd = ['java', '-cp', tmp_dir, classname]
        elif lang == 'rust':
            out_file = os.path.join(tmp_dir, 'prog')
            compile_proc = subprocess.run(
                ['rustc', src_file, '-o', out_file],
                capture_output=True, text=True, timeout=60
            )
            if compile_proc.returncode != 0:
                return {'stdout': '', 'stderr': compile_proc.stderr, 'returncode': compile_proc.returncode, 'error': 'Compilation failed'}
            cmd = [out_file]
        else:
            runner = LANGUAGE_RUNNERS.get(lang)
            if not runner:
                return {'stdout': '', 'stderr': f'Language "{language}" not supported.', 'returncode': -1}
            cmd = runner(src_file)
        
        proc = subprocess.run(
            cmd,
            input=stdin_data,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=tmp_dir,
            env={**os.environ, 'PYTHONUNBUFFERED': '1'}
        )
        
        return {
            'stdout': proc.stdout,
            'stderr': proc.stderr,
            'returncode': proc.returncode
        }
    
    except subprocess.TimeoutExpired:
        return {'stdout': '', 'stderr': f'Execution timed out after {timeout}s', 'returncode': -1}
    except FileNotFoundError as e:
        cmd_name = str(e).split("'")[1] if "'" in str(e) else 'interpreter'
        return {'stdout': '', 'stderr': f'Command not found: {cmd_name}\nInstall it with: pkg install {cmd_name}', 'returncode': -1}
    except Exception as e:
        return {'stdout': '', 'stderr': str(e), 'returncode': -1}
    finally:
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)

@app.route('/api/run', methods=['POST'])
def run_endpoint():
    data = request.get_json()
    code = data.get('code', '')
    language = data.get('language', 'python')
    stdin_data = data.get('stdin', '')
    timeout = min(int(data.get('timeout', 30)), 60)
    
    result = run_code(code, language, stdin_data, timeout)
    return jsonify(result)

# ─── Run File ──────────────────────────────────────────────────────────────────

@app.route('/api/run/file', methods=['POST'])
def run_file_endpoint():
    data = request.get_json()
    path = data.get('path', '')
    stdin_data = data.get('stdin', '')
    
    target = safe_path(path)
    if not target or not os.path.isfile(target):
        return jsonify({'error': 'File not found'}), 404
    
    ext = os.path.splitext(target)[1].lower()
    language = EXT_TO_LANG.get(ext, 'python')
    
    with open(target, 'r') as f:
        code = f.read()
    
    result = run_code(code, language, stdin_data)
    return jsonify(result)

# ─── System Info ──────────────────────────────────────────────────────────────

@app.route('/api/system', methods=['GET'])
def system_info():
    info = {
        'workspace': active_workspace,
        'python': sys.version,
        'platform': sys.platform,
    }
    
    tools = ['python3', 'node', 'gcc', 'g++', 'java', 'javac', 'ruby', 'php', 'go', 'rustc', 'lua', 'perl']
    available = {}
    for tool in tools:
        try:
            result = subprocess.run(['which', tool], capture_output=True, text=True)
            available[tool] = result.returncode == 0
        except:
            available[tool] = False
    
    info['tools'] = available
    return jsonify(info)

# ─── Terminal Command ──────────────────────────────────────────────────────────

@app.route('/api/terminal', methods=['POST'])
def terminal_cmd():
    data = request.get_json()
    cmd = data.get('command', '')
    cwd = data.get('cwd', active_workspace)
    
    # Resolve cwd - allow home, workspace, /tmp, /sdcard, /storage
    home = os.path.expanduser('~')
    abs_cwd = os.path.realpath(cwd) if cwd else active_workspace
    if not os.path.isdir(abs_cwd):
        abs_cwd = active_workspace
    
    try:
        # Handle 'cd' commands by tracking directory change
        # Wrap in a subshell that prints the final cwd
        wrapped = f'cd {abs_cwd!r} 2>/dev/null; {cmd}; echo "@@CWD@@$(pwd)"'
        result = subprocess.run(
            wrapped, shell=True,
            capture_output=True, text=True,
            timeout=30,
            env={**os.environ, 'HOME': home}
        )
        stdout = result.stdout
        new_cwd = abs_cwd
        if '@@CWD@@' in stdout:
            parts = stdout.rsplit('@@CWD@@', 1)
            stdout = parts[0]
            new_cwd = parts[1].strip()
        return jsonify({
            'stdout': stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
            'cwd': new_cwd
        })
    except subprocess.TimeoutExpired:
        return jsonify({'stdout': '', 'stderr': 'Command timed out', 'returncode': -1, 'cwd': abs_cwd})
    except Exception as e:
        return jsonify({'stdout': '', 'stderr': str(e), 'returncode': -1, 'cwd': abs_cwd})

# ─── Main ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"""
╔══════════════════════════════════════╗
║       TermuxPad Code Editor          ║
╠══════════════════════════════════════╣
║  Server : http://{host}:{port}        
║  Local  : http://localhost:{port}     
║  Space  : {active_workspace}
╚══════════════════════════════════════╝
    """)
    
    # Create sample files if workspace is empty
    sample_py = os.path.join(DEFAULT_WORKSPACE, 'hello.py')
    if not os.path.exists(sample_py):
        with open(sample_py, 'w') as f:
            f.write('# Welcome to TermuxPad!\nprint("Hello from Termux!")\n\nfor i in range(5):\n    print(f"Line {i+1}")\n')
    
    sample_js = os.path.join(DEFAULT_WORKSPACE, 'hello.js')
    if not os.path.exists(sample_js):
        with open(sample_js, 'w') as f:
            f.write('// JavaScript example\nconsole.log("Hello from Node.js!");\n\nconst nums = [1, 2, 3, 4, 5];\nnums.forEach(n => console.log(`Number: ${n}`));\n')

    app.run(host=host, port=port, debug=False, threaded=True)
