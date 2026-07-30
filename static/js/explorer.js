// TermuxPad - Project Explorer Module
// Handles: filesystem navigation, project open/close/rename

const explorerState = {
  currentPath: null,
  selectedPath: null,
  selectedType: null,
  quickLinks: [],
};

let recentProjects = [];
try { recentProjects = JSON.parse(localStorage.getItem('tpad_recent') || '[]'); } catch (_) {}

function saveRecent(path) {
  recentProjects = [path, ...recentProjects.filter(p => p !== path)].slice(0, 8);
  try { localStorage.setItem('tpad_recent', JSON.stringify(recentProjects)); } catch (_) {}
}

// ── Load Quick Links ──────────────────────────────────────────────────────────
async function loadQuickLinks() {
  try {
    const res = await fetch('/api/system');
    const data = await res.json();
    if (data.quick_links) {
      explorerState.quickLinks = data.quick_links;
      renderQuickLinks();
    }
  } catch (e) {
    console.error('Failed to load quick links:', e);
  }
}

function renderQuickLinks() {
  const container = document.getElementById('ql-items-container');
  if (!container) return;
  
  container.innerHTML = '';
  explorerState.quickLinks.forEach(link => {
    const div = document.createElement('div');
    div.className = 'ql-item';
    div.title = link.path;
    
    // Get the icon SVG
    const iconMap = {
      'home': Icons.home(13),
      'hdd': Icons.hdd(13),
      'download': Icons.download(13),
      'phone': Icons.phone(13),
      'lightning': Icons.lightning(13),
      'file': Icons.file(13),
    };
    const icon = iconMap[link.icon] || Icons.folder(13);
    
    div.innerHTML = `${icon}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${link.name}</span>`;
    div.onclick = () => {
      // Check if path exists before navigating
      fetch('/api/explorer/browse?path=' + encodeURIComponent(link.path))
        .then(r => r.json())
        .then(d => {
          if (d.error) {
            // Path doesn't exist, show message
            outputLog(`Path not found: ${link.path}`, 'warn');
            expandPanel();
          } else {
            explorerBrowse(link.path);
          }
        })
        .catch(() => {
          outputLog(`Cannot access: ${link.path}`, 'err');
          expandPanel();
        });
    };
    container.appendChild(div);
  });
}

// ── Open / Close Explorer ─────────────────────────────────────────────────────
function openProjectExplorer() {
  const overlay = document.getElementById('explorer-overlay');
  overlay.classList.add('show');
  
  // Load quick links if not already loaded
  if (explorerState.quickLinks.length === 0) {
    loadQuickLinks();
  } else {
    renderQuickLinks();
  }
  
  renderRecentLinks();
  const startPath = explorerState.currentPath || WORKSPACE || (explorerState.quickLinks[0]?.path || '/tmp');
  explorerBrowse(startPath);
  // Focus path bar for keyboard navigation
  setTimeout(() => {
    document.getElementById('explorer-path-bar').focus();
  }, 100);
}

function closeProjectExplorer() {
  const overlay = document.getElementById('explorer-overlay');
  overlay.classList.remove('show');
  // Clear selection state
  explorerState.selectedPath = null;
  explorerState.selectedType = null;
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
  
  if (!items || !items.length) {
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
    
    if (item.type === 'dir') {
      // Directory with action buttons
      el.innerHTML = `
        <div class="ei-icon">${iconHtml}</div>
        <div class="ei-name">${item.name}</div>
        <div class="ei-actions">
          <button class="ei-action-btn" title="New File in ${item.name}" onclick="event.stopPropagation(); explorerNewFileIn('${item.path.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')">
            ${Icons.filePlus(14)}
          </button>
          <button class="ei-action-btn" title="New Folder in ${item.name}" onclick="event.stopPropagation(); explorerNewFolderIn('${item.path.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')">
            ${Icons.folder(14)}
          </button>
        </div>`;
      
      el.addEventListener('click', ev => {
        // Check if click is on action button
        if (ev.target.closest('.ei-action-btn')) return;
        if (ev.detail === 2) { explorerBrowse(item.path); return; }
        selectExplorerItem(el, item.path, 'dir');
      });
    } else {
      // File item (no action buttons)
      el.innerHTML = `<div class="ei-icon">${iconHtml}</div><div class="ei-name">${item.name}</div>`;
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

// ── Create File/Folder in Explorer ────────────────────────────────────────────
function explorerNewFile() {
  if (!explorerState.currentPath) {
    outputLog('No directory selected', 'warn');
    return;
  }
  
  openModal('New File', 'filename.py', async (name) => {
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    
    const filePath = explorerState.currentPath + '/' + clean;
    
    try {
      const res = await fetch('/api/file/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, type: 'file' }),
      });
      const data = await res.json();
      if (data.success) {
        explorerRefresh();
        outputLog('Created: ' + clean, 'success');
        setStatus('File created', 'success');
        setTimeout(() => setStatus('Ready', ''), 2000);
      } else {
        outputLog('Create failed: ' + (data.error || 'unknown'), 'err');
        expandPanel();
      }
    } catch (e) {
      outputLog('Create error: ' + e.message, 'err');
      expandPanel();
    }
  });
}

function explorerNewFolder() {
  if (!explorerState.currentPath) {
    outputLog('No directory selected', 'warn');
    return;
  }
  
  openModal('New Folder', 'folder-name', async (name) => {
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    
    const folderPath = explorerState.currentPath + '/' + clean;
    
    try {
      const res = await fetch('/api/file/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath, type: 'dir' }),
      });
      const data = await res.json();
      if (data.success) {
        explorerRefresh();
        outputLog('Created folder: ' + clean, 'success');
        setStatus('Folder created', 'success');
        setTimeout(() => setStatus('Ready', ''), 2000);
      } else {
        outputLog('Create folder failed: ' + (data.error || 'unknown'), 'err');
        expandPanel();
      }
    } catch (e) {
      outputLog('Create folder error: ' + e.message, 'err');
      expandPanel();
    }
  });
}

// Create file inside a specific directory
function explorerNewFileIn(dirPath, dirName) {
  openModal(`New File in "${dirName}"`, 'filename.py', async (name) => {
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    
    const filePath = dirPath + '/' + clean;
    
    try {
      const res = await fetch('/api/file/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, type: 'file' }),
      });
      const data = await res.json();
      if (data.success) {
        explorerRefresh();
        outputLog(`Created: ${dirName}/${clean}`, 'success');
        setStatus('File created', 'success');
        setTimeout(() => setStatus('Ready', ''), 2000);
      } else {
        outputLog('Create failed: ' + (data.error || 'unknown'), 'err');
        expandPanel();
      }
    } catch (e) {
      outputLog('Create error: ' + e.message, 'err');
      expandPanel();
    }
  });
}

// Create folder inside a specific directory
function explorerNewFolderIn(dirPath, dirName) {
  openModal(`New Folder in "${dirName}"`, 'folder-name', async (name) => {
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    
    const folderPath = dirPath + '/' + clean;
    
    try {
      const res = await fetch('/api/file/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath, type: 'dir' }),
      });
      const data = await res.json();
      if (data.success) {
        explorerRefresh();
        outputLog(`Created folder: ${dirName}/${clean}`, 'success');
        setStatus('Folder created', 'success');
        setTimeout(() => setStatus('Ready', ''), 2000);
      } else {
        outputLog('Create folder failed: ' + (data.error || 'unknown'), 'err');
        expandPanel();
      }
    } catch (e) {
      outputLog('Create folder error: ' + e.message, 'err');
      expandPanel();
    }
  });
}
