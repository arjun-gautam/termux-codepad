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

function termAppend(content, className = '') {
  const output = document.getElementById('terminal-output');
  const line = document.createElement('div');
  line.className = 'term-line ' + className;
  line.textContent = content;
  output.appendChild(line);
  
  // Auto-scroll to bottom
  const container = document.getElementById('terminal-container');
  container.scrollTop = container.scrollHeight;
}

function termAppendPromptLine(cwd, command) {
  const output = document.getElementById('terminal-output');
  const line = document.createElement('div');
  line.className = 'term-line prompt-line';
  
  // Format cwd display
  let cwdDisplay = cwd;
  const termuxHome = '/data/data/com.termux/files/home';
  if (cwdDisplay.startsWith(termuxHome)) {
    cwdDisplay = '~' + cwdDisplay.slice(termuxHome.length);
  } else if (cwdDisplay.length > 35) {
    cwdDisplay = '...' + cwdDisplay.slice(-32);
  }
  
  line.innerHTML = `<span style="color:var(--green);font-size:11px">${cwdDisplay}</span><span style="color:var(--cyan)">$</span><span style="color:var(--fg0)">${escapeHtml(command)}</span>`;
  output.appendChild(line);
  
  // Auto-scroll to bottom
  const container = document.getElementById('terminal-container');
  container.scrollTop = container.scrollHeight;
}

function clearTerminal() {
  document.getElementById('terminal-output').innerHTML = '';
}

function initTerminal() {
  const termInput = document.getElementById('terminal-input');

  termInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const cmd = termInput.value.trim();
      if (!cmd) return;
      
      // Add to history
      termHistory.unshift(cmd);
      termHistIdx = -1;
      
      // Show the command in output (like bash does)
      termAppendPromptLine(termCwd || WORKSPACE, cmd);
      
      // Clear input
      termInput.value = '';
      
      // Handle special commands
      if (cmd === 'clear') {
        clearTerminal();
        return;
      }

      const cwd = termCwd || WORKSPACE;
      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd, cwd }),
        });
        const data = await res.json();
        
        // Show stdout
        if (data.stdout) {
          const lines = data.stdout.split('\n');
          lines.forEach((line, idx) => {
            if (idx === lines.length - 1 && line === '') return; // Skip trailing newline
            termAppend(line, 'stdout');
          });
        }
        
        // Show stderr
        if (data.stderr) {
          const lines = data.stderr.split('\n');
          lines.forEach((line, idx) => {
            if (idx === lines.length - 1 && line === '') return; // Skip trailing newline
            termAppend(line, 'stderr');
          });
        }
        
        // Update cwd
        if (data.cwd) updateTermCwd(data.cwd);
      } catch (err) { 
        termAppend('Error: ' + err.message, 'error');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      termHistIdx = Math.min(termHistIdx + 1, termHistory.length - 1);
      termInput.value = termHistory[termHistIdx] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      termHistIdx = Math.max(termHistIdx - 1, -1);
      termInput.value = termHistIdx === -1 ? '' : termHistory[termHistIdx];
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion could be added here
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      termInput.value = '';
      termAppend('^C', 'info');
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      clearTerminal();
    }
  });
  
  // Focus input when clicking anywhere in the terminal
  document.getElementById('terminal-container').addEventListener('click', () => {
    termInput.focus();
  });
  
  // Welcome message
  termAppend('TermuxPad Terminal - Type commands and press Enter', 'info');
  termAppend('Tip: Use Ctrl+L to clear, Ctrl+C to cancel', 'info');
  termAppend('', 'info');
}

// Helper function for HTML escaping
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
