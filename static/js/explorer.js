// TermuxPad - Project Explorer Module
// Handles: filesystem navigation, project open/close/rename

const explorerState = {
  currentPath: null,
  selectedPath: null,
  selectedType: null,
};

let recentProjects = [];
try { recentProjects = JSON.parse(localStorage.getItem('tpad_recent') || '[]'); } catch (_) {}

function saveRecent(path) {
  recentProjects = [path, ...recentProjects.filter(p => p !== path)].slice(0, 8);
  try { localStorage.setItem('tpad_recent', JSON.stringify(recentProjects)); } catch (_) {}
}

// ── Open / Close Explorer ─────────────────────────────────────────────────────
function openProjectExplorer() {
  document.getElementById('explorer-overlay').classList.add('show');
  renderRecentLinks();
  const startPath = explorerState.currentPath || WORKSPACE || '/data/data/com.termux/files/home';
  explorerBrowse(startPath);
}

function closeProjectExplorer() {
  document.getElementById('explorer-overlay').classList.remove('show');
}

// ── Recent Links ──────────────────────────────────────────────────────────────
function renderRecentLinks() {
  const el = document.getElementById('ql-recent');
  el.innerHTML = '';
  recentProjects.slice(0, 5).forEach(p => {
    const name = p.split('/').filter(Boolean).pop() || p;
    const div = document.createElement('div');
    div.className = 'ql-item';
    div.title = p;
    div.innerHTML = `${Icons.folder(13)}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${name}</span>`;
    div.onclick = () => explorerBrowse(p);
    el.appendChild(div);
  });
}

// ── Browse ────────────────────────────────────────────────────────────────────
async function explorerBrowse(path) {
  document.getElementById('explorer-loading').classList.add('show');
  try {
    const res = await fetch('/api/explorer/browse?path=' + encodeURIComponent(path));
    const data = await res.json();
    if (data.error) { console.error('Explorer:', data.error); return; }
    explorerState.currentPath = data.path;
    explorerState.selectedPath = null;
    explorerState.selectedType = null;
    document.getElementById('explorer-path-bar').value = data.path;
    document.getElementById('exp-back-btn').disabled = !data.parent;
    document.getElementById('explorer-selected-path').textContent = 'Select a folder to open as project';
    document.getElementById('explorer-open-btn').disabled = true;
    renderExplorerFiles(data.items || []);
  } catch (e) { console.error('Explorer browse error:', e); }
  finally { document.getElementById('explorer-loading').classList.remove('show'); }
}

// ── Render Files Grid ─────────────────────────────────────────────────────────
function renderExplorerFiles(items) {
  const container = document.getElementById('explorer-files');
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = `<div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;color:var(--fg3);gap:8px;font-size:12px">
      <span style="opacity:0.5">${Icons.folderOpen(32)}</span>Empty folder</div>`;
    return;
  }
  const dirs  = items.filter(i => i.type === 'dir');
  const files = items.filter(i => i.type === 'file');
  [...dirs, ...files].forEach(item => {
    const el = document.createElement('div');
    el.className = 'explorer-item ' + (item.type === 'dir' ? 'dir-item' : 'file-item');
    const iconHtml = item.type === 'dir'
      ? Icons.folderLg(36)
      : getFileIconSvg(item.name, 32);
    el.innerHTML = `<div class="ei-icon">${iconHtml}</div><div class="ei-name">${item.name}</div>`;
    if (item.type === 'dir') {
      el.addEventListener('click', ev => {
        if (ev.detail === 2) { explorerBrowse(item.path); return; }
        selectExplorerItem(el, item.path, 'dir');
      });
    } else {
      el.addEventListener('click', () => selectExplorerItem(el, item.path, 'file'));
    }
    container.appendChild(el);
  });
}

function selectExplorerItem(el, path, type) {
  document.querySelectorAll('.explorer-item.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  explorerState.selectedPath = path;
  explorerState.selectedType = type;
  const openBtn = document.getElementById('explorer-open-btn');
  const label   = document.getElementById('explorer-selected-path');
  if (type === 'dir') {
    openBtn.disabled = false;
    label.textContent = path;
  } else {
    openBtn.disabled = true;
    label.textContent = `"${path.split('/').pop()}" is a file — select a folder`;
  }
}

// ── Confirm Open ──────────────────────────────────────────────────────────────
async function confirmOpenProject() {
  const path = explorerState.selectedPath;
  if (!path || explorerState.selectedType !== 'dir') return;
  const btn = document.getElementById('explorer-open-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Opening...';
  try {
    const res = await fetch('/api/workspace/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    const data = await res.json();
    if (data.success) {
      WORKSPACE = data.workspace;
      termCwd = data.workspace;
      updateTermCwd(data.workspace);
      saveRecent(path);
      closeProjectExplorer();
      state.tabs = [];
      state.activeTab = null;
      showEditor(false);
      renderTabs();
      renderTree(data.tree || [], document.getElementById('file-tree'), '');
      const folderName = path.split('/').filter(Boolean).pop() || path;
      document.getElementById('sidebar-project-name').textContent = folderName;
      document.getElementById('close-project-btn').style.display = 'flex';
      document.getElementById('open-project-btn').style.display = 'none';
      setStatus('Opened: ' + folderName, 'success');
      setTimeout(() => setStatus('Ready', ''), 3000);
    } else {
      outputLog('Failed to open project: ' + (data.error || ''), 'err');
    }
  } catch (e) { outputLog('Open project error: ' + e.message, 'err'); }
  finally {
    btn.disabled = false;
    btn.innerHTML = Icons.folderOpen(14) + ' Open as Project';
  }
}

// ── Close Project ─────────────────────────────────────────────────────────────
async function closeProject() {
  if (state.tabs.some(t => t.modified) && !confirm('Unsaved changes. Close project anyway?')) return;
  state.tabs = [];
  state.activeTab = null;
  showEditor(false);
  renderTabs();
  try {
    const res = await fetch('/api/workspace/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: WORKSPACE || '/data/data/com.termux/files/home/termuxpad-workspace' }),
    });
    const data = await res.json();
    if (data.workspace) { WORKSPACE = data.workspace; termCwd = data.workspace; updateTermCwd(data.workspace); }
    renderTree(data.tree || [], document.getElementById('file-tree'), '');
  } catch (_) {}
  document.getElementById('sidebar-project-name').textContent = 'Explorer';
  document.getElementById('close-project-btn').style.display = 'none';
  document.getElementById('open-project-btn').style.display = 'flex';
  openProjectExplorer();
}

// ── Rename Project Folder ─────────────────────────────────────────────────────
async function renameProjectFolder() {
  if (!WORKSPACE || document.getElementById('sidebar-project-name').textContent === 'Explorer') return;
  const currentName = WORKSPACE.split('/').filter(Boolean).pop();
  openModal('Rename Project', currentName, async (newName) => {
    if (!newName || newName === currentName) return;
    const parentDir = WORKSPACE.substring(0, WORKSPACE.lastIndexOf('/'));
    const newPath = parentDir + '/' + newName;
    const res = await fetch('/api/file/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_path: WORKSPACE, new_path: newPath }),
    });
    const data = await res.json();
    if (data.success) {
      const res2 = await fetch('/api/workspace/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath }),
      });
      const data2 = await res2.json();
      if (data2.success) {
        WORKSPACE = data2.workspace;
        termCwd = data2.workspace;
        updateTermCwd(data2.workspace);
        document.getElementById('sidebar-project-name').textContent = newName;
        renderTree(data2.tree || [], document.getElementById('file-tree'), '');
        setStatus('Renamed to: ' + newName, 'success');
        setTimeout(() => setStatus('Ready', ''), 3000);
      }
    } else {
      outputLog('Rename project failed: ' + (data.error || ''), 'err');
    }
  }, currentName);
}

// ── Navigation Helpers ────────────────────────────────────────────────────────
function explorerGoUp() {
  if (!explorerState.currentPath) return;
  const parts = explorerState.currentPath.split('/').filter(Boolean);
  parts.pop();
  explorerBrowse(parts.length ? '/' + parts.join('/') : '/');
}
function explorerNavigateTo(path) { if (path) explorerBrowse(path); }
function explorerRefresh() { if (explorerState.currentPath) explorerBrowse(explorerState.currentPath); }
