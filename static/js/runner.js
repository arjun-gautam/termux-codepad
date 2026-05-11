// TermuxPad - Code Runner & Output Panel Module

// ── Run Code ─────────────────────────────────────────────────────────────────
async function runCode() {
  if (!state.activeTab) { outputLog('No file open.', 'warn'); return; }
  const tab = state.tabs.find(t => t.id === state.activeTab);
  if (!tab) return;
  await saveCurrentFile();
  switchPanelTab('output');
  outputClear();
  outputLog(`Running ${tab.name} (${tab.language})...`, 'info');
  setStatus('Running...', 'running');

  const runBtn = document.getElementById('run-btn');
  runBtn.disabled = true;
  runBtn.innerHTML = '<span class="spinner"></span><span>Running</span>';

  const t0 = Date.now();
  try {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: editor.getValue(),
        language: tab.language,
        stdin: document.getElementById('stdin-input').value,
        timeout: 30,
      }),
    });
    const data = await res.json();
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    if (data.stdout) outputAppend(data.stdout, 'stdout');
    if (data.stderr) outputAppend(data.stderr, 'stderr');
    if (!data.stdout && !data.stderr) outputLog('(No output)', 'warn');
    const ok = data.returncode === 0;
    outputLog(`\n─── ${ok ? '✓' : '✗'} Exited ${data.returncode} in ${elapsed}s ───`, ok ? 'success' : 'err');
    setStatus(ok ? '✓ Success' : `✗ Error (${data.returncode})`, ok ? 'success' : 'error');
  } catch (e) {
    outputLog('Request failed: ' + e.message, 'err');
    setStatus('Failed', 'error');
  } finally {
    runBtn.disabled = false;
    runBtn.innerHTML = Icons.play(13) + '<span>Run</span>';
  }
}

// ── Output Panel ──────────────────────────────────────────────────────────────
function outputLog(msg, type = 'info') {
  const el = document.getElementById('output-text');
  const span = document.createElement('span');
  const cls = { err: 'out-stderr', info: 'out-info', success: 'out-success', warn: 'out-warn' }[type] || 'out-stdout';
  span.className = cls;
  span.textContent = msg + '\n';
  el.appendChild(span);
  el.scrollTop = el.scrollHeight;
  expandPanel();
}

function outputAppend(text, cls = 'stdout') {
  const el = document.getElementById('output-text');
  const span = document.createElement('span');
  span.className = 'out-' + cls;
  span.textContent = text;
  el.appendChild(span);
  el.scrollTop = el.scrollHeight;
}

function outputClear() { document.getElementById('output-text').innerHTML = ''; }

function clearOutput(e) {
  e && e.stopPropagation();
  outputClear();
  document.getElementById('terminal-text').innerHTML = '';
}

function expandPanel() {
  if (state.panelCollapsed) {
    state.panelCollapsed = false;
    const p = document.getElementById('output-panel');
    p.classList.remove('collapsed');
    p.style.height = '220px';
  }
}

function togglePanel(e) {
  e && e.stopPropagation();
  state.panelCollapsed = !state.panelCollapsed;
  const p = document.getElementById('output-panel');
  p.classList.toggle('collapsed', state.panelCollapsed);
  if (!state.panelCollapsed) p.style.height = '220px';
}

function switchPanelTab(name, e) {
  e && e.stopPropagation();
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.output-pane').forEach(t => t.classList.remove('active'));
  const btn = document.querySelector(`.panel-tab[onclick*="${name}"]`);
  if (btn) btn.classList.add('active');
  const pane = document.getElementById(`pane-${name}`);
  if (pane) pane.classList.add('active');
  expandPanel();
}

// ── Panel Resize ──────────────────────────────────────────────────────────────
function initPanelResize() {
  const resizeEl = document.getElementById('panel-resize');
  let resizeStartY = 0, resizeStartH = 0;

  resizeEl.addEventListener('mousedown', e => {
    panelResizing = true;
    resizeStartY = e.clientY;
    resizeStartH = document.getElementById('output-panel').offsetHeight;
    document.body.style.cursor = 'row-resize';
  });
  document.addEventListener('mousemove', e => {
    if (!panelResizing) return;
    const newH = Math.max(80, Math.min(600, resizeStartH + resizeStartY - e.clientY));
    document.getElementById('output-panel').style.height = newH + 'px';
    document.getElementById('output-panel').classList.remove('collapsed');
    state.panelCollapsed = false;
  });
  document.addEventListener('mouseup', () => { panelResizing = false; document.body.style.cursor = ''; });

  resizeEl.addEventListener('touchstart', e => {
    panelResizing = true;
    resizeStartY = e.touches[0].clientY;
    resizeStartH = document.getElementById('output-panel').offsetHeight;
  });
  document.addEventListener('touchmove', e => {
    if (!panelResizing) return;
    const newH = Math.max(80, Math.min(500, resizeStartH + resizeStartY - e.touches[0].clientY));
    document.getElementById('output-panel').style.height = newH + 'px';
  });
  document.addEventListener('touchend', () => { panelResizing = false; });
}
