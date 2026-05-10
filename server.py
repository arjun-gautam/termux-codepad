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
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='static')
CORS(app)

# ── Workspace ──────────────────────────────────────────────────────────────────

DEFAULT_WORKSPACE = os.path.expanduser("~/termuxpad-workspace")
os.makedirs(DEFAULT_WORKSPACE, exist_ok=True)
active_workspace = DEFAULT_WORKSPACE


def safe_path(rel_path):
    """Resolve a relative path inside active_workspace. Returns None if unsafe."""
    ws = os.path.realpath(active_workspace)
    if not rel_path or rel_path in ('/', '.'):
        return ws
    # Strip leading slashes so we never escape the workspace
    rel_path = rel_path.lstrip('/')
    target = os.path.realpath(os.path.join(ws, rel_path))
    if not target.startswith(ws + os.sep) and target != ws:
        return None
    return target


def file_tree(directory, depth=0, max_depth=5):
    """Return recursive file tree relative to active_workspace."""
    if depth > max_depth:
        return []
    items = []
    try:
        entries = sorted(
            os.scandir(directory),
            key=lambda e: (not e.is_dir(), e.name.lower())
        )
        for e in entries:
            if e.name.startswith('.'):
                continue
            rel = os.path.relpath(e.path, active_workspace)
            item = {
                'name': e.name,
                'path': rel,
                'type': 'dir' if e.is_dir() else 'file',
                'size': e.stat().st_size if e.is_file() else 0,
            }
            if e.is_dir():
                item['children'] = file_tree(e.path, depth + 1, max_depth)
            items.append(item)
    except (PermissionError, OSError):
        pass
    return items


def browse_fs(directory):
    """List a real filesystem path for the project explorer (unrestricted)."""
    items = []
    try:
        entries = sorted(
            os.scandir(directory),
            key=lambda e: (not e.is_dir(), e.name.lower())
        )
        for e in entries:
            if e.name.startswith('.'):
                continue
            items.append({
                'name': e.name,
                'path': e.path,
                'type': 'dir' if e.is_dir() else 'file',
            })
    except (PermissionError, OSError):
        pass
    return items


# ── Static ─────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


# ── Workspace API ──────────────────────────────────────────────────────────────

@app.route('/api/workspace', methods=['GET'])
def workspace_info():
    return jsonify({'workspace': active_workspace})

@app.route('/api/workspace/open', methods=['POST'])
def workspace_open():
    global active_workspace
    data = request.get_json() or {}
    path = data.get('path', '').strip()
    if not path:
        return jsonify({'error': 'No path provided'}), 400
    abs_path = os.path.realpath(path)
    if not os.path.isdir(abs_path):
        # Try creating it
        try:
            os.makedirs(abs_path, exist_ok=True)
        except Exception as e:
            return jsonify({'error': f'Not a directory: {e}'}), 400
    active_workspace = abs_path
    return jsonify({'success': True, 'workspace': active_workspace, 'tree': file_tree(active_workspace)})


# ── File System Explorer (unrestricted browse) ─────────────────────────────────

@app.route('/api/explorer/browse')
def explorer_browse():
    path = request.args.get('path', os.path.expanduser('~'))
    abs_path = os.path.realpath(path)
    if not os.path.isdir(abs_path):
        return jsonify({'error': 'Not a directory'}), 400
    parent = str(Path(abs_path).parent)
    return jsonify({
        'path': abs_path,
        'parent': None if parent == abs_path else parent,
        'items': browse_fs(abs_path),
    })


# ── File Tree ──────────────────────────────────────────────────────────────────

@app.route('/api/files')
def list_files():
    path = request.args.get('path', '')
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    return jsonify({'tree': file_tree(target), 'workspace': active_workspace})


# ── File CRUD ──────────────────────────────────────────────────────────────────

@app.route('/api/file', methods=['GET'])
def read_file():
    path = request.args.get('path', '')
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    if not os.path.isfile(target):
        return jsonify({'error': 'File not found'}), 404
    try:
        with open(target, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        st = os.stat(target)
        return jsonify({
            'content': content,
            'path': path,
            'name': os.path.basename(target),
            'size': st.st_size,
            'modified': st.st_mtime,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file', methods=['POST'])
def write_file():
    data = request.get_json() or {}
    path = data.get('path', '').strip()
    content = data.get('content', '')
    if not path:
        return jsonify({'error': 'No path provided'}), 400
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    if os.path.isdir(target):
        return jsonify({'error': 'Path is a directory'}), 400
    try:
        os.makedirs(os.path.dirname(target) or active_workspace, exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({'success': True, 'path': path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file/new', methods=['POST'])
def new_file():
    data = request.get_json() or {}
    path = data.get('path', '').strip().lstrip('/')
    ftype = data.get('type', 'file')
    if not path:
        return jsonify({'error': 'No path provided'}), 400
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    try:
        if ftype == 'dir':
            os.makedirs(target, exist_ok=True)
        else:
            parent = os.path.dirname(target)
            os.makedirs(parent, exist_ok=True)
            if not os.path.exists(target):
                open(target, 'w').close()
        return jsonify({'success': True, 'path': path, 'abs': target})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file/delete', methods=['POST'])
def delete_file():
    data = request.get_json() or {}
    path = data.get('path', '').strip()
    target = safe_path(path)
    if not target:
        return jsonify({'error': 'Invalid path'}), 400
    try:
        if os.path.isdir(target):
            shutil.rmtree(target)
        else:
            os.remove(target)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file/rename', methods=['POST'])
def rename_file():
    data = request.get_json() or {}
    old_path = data.get('old_path', '').strip()
    new_path = data.get('new_path', '').strip()

    # Support absolute paths (e.g. renaming the project folder itself)
    if os.path.isabs(old_path) and os.path.isabs(new_path):
        src = os.path.realpath(old_path)
        dst = os.path.realpath(new_path)
        # Safety: both must share the same parent directory
        if os.path.dirname(src) != os.path.dirname(dst):
            return jsonify({'error': 'Cannot move across directories'}), 400
    else:
        src = safe_path(old_path)
        dst = safe_path(new_path)
        if not src or not dst:
            return jsonify({'error': 'Invalid path'}), 400

    try:
        os.rename(src, dst)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Terminal ───────────────────────────────────────────────────────────────────

@app.route('/api/terminal', methods=['POST'])
def terminal_cmd():
    data = request.get_json() or {}
    cmd = data.get('command', '').strip()
    cwd = data.get('cwd', active_workspace).strip()

    # Resolve the cwd - fall back to workspace if invalid
    if not cwd:
        cwd = active_workspace
    abs_cwd = os.path.realpath(cwd)
    if not os.path.isdir(abs_cwd):
        abs_cwd = active_workspace

    home = os.path.expanduser('~')

    try:
        # Wrap command so we can track cwd after `cd`
        # We cd into abs_cwd first, run the command, then print the new cwd
        marker = '@@TERMUXPAD_CWD@@'
        wrapped = f'cd {abs_cwd!r} && {{ {cmd}; }}; echo "{marker}$(pwd)"'
        result = subprocess.run(
            wrapped,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,
            env={**os.environ, 'HOME': home},
        )
        stdout = result.stdout
        new_cwd = abs_cwd

        # Extract the cwd marker from stdout
        if marker in stdout:
            parts = stdout.rsplit(marker, 1)
            stdout = parts[0]
            new_cwd = parts[1].strip()
            if not os.path.isdir(new_cwd):
                new_cwd = abs_cwd

        return jsonify({
            'stdout': stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
            'cwd': new_cwd,
        })
    except subprocess.TimeoutExpired:
        return jsonify({'stdout': '', 'stderr': 'Command timed out after 30s', 'returncode': -1, 'cwd': abs_cwd})
    except Exception as e:
        return jsonify({'stdout': '', 'stderr': str(e), 'returncode': -1, 'cwd': abs_cwd})


# ── Code Runner ────────────────────────────────────────────────────────────────

EXT_TO_LANG = {
    '.py': 'python', '.js': 'javascript', '.ts': 'typescript',
    '.sh': 'bash', '.bash': 'bash', '.rb': 'ruby', '.php': 'php',
    '.pl': 'perl', '.lua': 'lua', '.r': 'r', '.java': 'java',
    '.c': 'c', '.cpp': 'cpp', '.cc': 'cpp', '.go': 'go', '.rs': 'rust',
}

RUNNERS = {
    'python': lambda f, _: (['python3', f], None),
    'javascript': lambda f, _: (['node', f], None),
    'bash': lambda f, _: (['bash', f], None),
    'sh': lambda f, _: (['sh', f], None),
    'ruby': lambda f, _: (['ruby', f], None),
    'php': lambda f, _: (['php', f], None),
    'perl': lambda f, _: (['perl', f], None),
    'lua': lambda f, _: (['lua', f], None),
    'go': lambda f, d: (['go', 'run', f], None),
}

def run_code(code, language, stdin_data='', timeout=30):
    lang = language.lower().replace('python3', 'python').replace('typescript', 'javascript')
    ext = {'python':'.py','javascript':'.js','bash':'.sh','sh':'.sh','ruby':'.rb',
           'php':'.php','perl':'.pl','lua':'.lua','go':'.go','r':'.r',
           'java':'.java','c':'.c','cpp':'.cpp','rust':'.rs'}.get(lang, '.txt')
    tmp = tempfile.mkdtemp()
    try:
        if lang == 'java':
            import re
            m = re.search(r'public\s+class\s+(\w+)', code)
            cls = m.group(1) if m else 'Main'
            src = os.path.join(tmp, f'{cls}.java')
        else:
            src = os.path.join(tmp, f'code{ext}')
        with open(src, 'w') as f:
            f.write(code)

        if lang in ('c', 'cpp'):
            compiler = 'g++' if lang == 'cpp' else 'gcc'
            out = os.path.join(tmp, 'a.out')
            cp = subprocess.run([compiler, src, '-o', out, '-lm'],
                                capture_output=True, text=True, timeout=30)
            if cp.returncode != 0:
                return {'stdout': '', 'stderr': cp.stderr, 'returncode': cp.returncode}
            cmd = [out]
        elif lang == 'java':
            cp = subprocess.run(['javac', src], capture_output=True, text=True, timeout=30, cwd=tmp)
            if cp.returncode != 0:
                return {'stdout': '', 'stderr': cp.stderr, 'returncode': cp.returncode}
            cmd = ['java', '-cp', tmp, cls]
        elif lang == 'rust':
            out = os.path.join(tmp, 'prog')
            cp = subprocess.run(['rustc', src, '-o', out], capture_output=True, text=True, timeout=60)
            if cp.returncode != 0:
                return {'stdout': '', 'stderr': cp.stderr, 'returncode': cp.returncode}
            cmd = [out]
        elif lang in RUNNERS:
            cmd, _ = RUNNERS[lang](src, tmp)
        else:
            return {'stdout': '', 'stderr': f'Language "{language}" not supported', 'returncode': -1}

        proc = subprocess.run(
            cmd, input=stdin_data, capture_output=True, text=True,
            timeout=timeout, cwd=tmp,
            env={**os.environ, 'PYTHONUNBUFFERED': '1'}
        )
        return {'stdout': proc.stdout, 'stderr': proc.stderr, 'returncode': proc.returncode}
    except subprocess.TimeoutExpired:
        return {'stdout': '', 'stderr': f'Timed out after {timeout}s', 'returncode': -1}
    except FileNotFoundError as e:
        name = str(e).split("'")[1] if "'" in str(e) else 'interpreter'
        return {'stdout': '', 'stderr': f'Not found: {name}\nInstall: pkg install {name}', 'returncode': -1}
    except Exception as e:
        return {'stdout': '', 'stderr': str(e), 'returncode': -1}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


@app.route('/api/run', methods=['POST'])
def run_endpoint():
    data = request.get_json() or {}
    result = run_code(
        data.get('code', ''),
        data.get('language', 'python'),
        data.get('stdin', ''),
        min(int(data.get('timeout', 30)), 60)
    )
    return jsonify(result)


@app.route('/api/run/file', methods=['POST'])
def run_file_endpoint():
    data = request.get_json() or {}
    path = data.get('path', '')
    target = safe_path(path)
    if not target or not os.path.isfile(target):
        return jsonify({'error': 'File not found'}), 404
    ext = os.path.splitext(target)[1].lower()
    lang = EXT_TO_LANG.get(ext, 'python')
    with open(target, 'r') as f:
        code = f.read()
    return jsonify(run_code(code, lang, data.get('stdin', '')))


# ── System Info ────────────────────────────────────────────────────────────────

@app.route('/api/system')
def system_info():
    tools = ['python3', 'node', 'gcc', 'g++', 'java', 'javac', 'ruby', 'php', 'go', 'rustc', 'lua', 'perl', 'bash']
    available = {}
    for t in tools:
        try:
            available[t] = subprocess.run(['which', t], capture_output=True).returncode == 0
        except Exception:
            available[t] = False
    return jsonify({
        'workspace': active_workspace,
        'python': sys.version,
        'platform': sys.platform,
        'tools': available,
    })


# ── Main ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f"""
╔══════════════════════════════════════╗
║       TermuxPad Code Editor          ║
╠══════════════════════════════════════╣
║  URL   : http://localhost:{port}
║  Space : {active_workspace}
╚══════════════════════════════════════╝
    """)
    # Seed workspace with examples if empty
    for name, content in [
        ('hello.py', '# Welcome to TermuxPad!\nprint("Hello from Termux!")\n'),
        ('hello.sh', '#!/bin/bash\necho "Hello from bash!"\nfor i in 1 2 3; do echo "Line $i"; done\n'),
    ]:
        fp = os.path.join(DEFAULT_WORKSPACE, name)
        if not os.path.exists(fp):
            open(fp, 'w').write(content)
    from flask import Flask
    app.run(host=host, port=port, debug=False, threaded=True)
