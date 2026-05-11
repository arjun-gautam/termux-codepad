// TermuxPad - Terminal Module

let termHistory = [];
let termHistIdx = -1;

function updateTermCwd(cwd) {
  if (!cwd) return;
  termCwd = cwd;
  let display = cwd;
  const termuxHome = '/data/data/com.termux/files/home';
  if (display.startsWith(termuxHome)) {
    display = '~' + display.slice(termuxHome.length);
  } else if (display.length > 35) {
    display = '...' + display.slice(-32);
  }
  document.getElementById('term-cwd').textContent = display || '~';
}

function termAppend(text, cls = 'stdout') {
  const el = document.getElementById('terminal-text');
  const span = document.createElement('span');
  span.className = cls === 'stderr' ? 'out-stderr' : cls === 'prompt' ? 'out-prompt' : 'out-stdout';
  span.textContent = text;
  el.appendChild(span);
  el.scrollTop = el.scrollHeight;
}

function initTerminal() {
  const termInput = document.getElementById('terminal-input');

  termInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const cmd = termInput.value.trim();
      if (!cmd) return;
      termHistory.unshift(cmd);
      termHistIdx = -1;
      termInput.value = '';
      termAppend(`$ ${cmd}\n`, 'prompt');
      if (cmd === 'clear') { document.getElementById('terminal-text').innerHTML = ''; return; }

      const cwd = termCwd || WORKSPACE;
      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd, cwd }),
        });
        const data = await res.json();
        if (data.stdout) termAppend(data.stdout, 'stdout');
        if (data.stderr) termAppend(data.stderr, 'stderr');
        if (data.cwd) updateTermCwd(data.cwd);
      } catch (err) { termAppend('Error: ' + err.message + '\n', 'stderr'); }
    } else if (e.key === 'ArrowUp') {
      termHistIdx = Math.min(termHistIdx + 1, termHistory.length - 1);
      termInput.value = termHistory[termHistIdx] || '';
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      termHistIdx = Math.max(termHistIdx - 1, -1);
      termInput.value = termHistIdx === -1 ? '' : termHistory[termHistIdx];
      e.preventDefault();
    }
  });
}
