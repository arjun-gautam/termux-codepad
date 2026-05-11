// TermuxPad - File Operations Module
// Handles: open, save, create, delete, rename files and folders

async function openFile(path) {
  const existing = state.tabs.find(t => t.path === path);
  if (existing) { activateTab(existing.id); return; }
  try {
    const res = await fetch('/api/file?path=' + encodeURIComponent(path));
    if (!res.ok) { outputLog('Cannot open: ' + path, 'err'); return; }
    const data = await res.json();
    if (data.error) { outputLog('Cannot open: ' + data.error, 'err'); return; }
    const lang = getLangByExt(data.name);
    const tab = {
      id: 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      path,
      name: data.name,
      content: data.content,
      modified: false,
      language: lang,
    };
    state.tabs.push(tab);
    activateTab(tab.id);
  } catch (e) { outputLog('Error opening file: ' + e.message, 'err'); }
}

async function saveCurrentFile() {
  if (!state.activeTab) { setStatus('Nothing to save', ''); return; }
  const tab = state.tabs.find(t => t.id === state.activeTab);
  if (!tab) return;
  tab.content = editor.getValue();
  try {
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: tab.path, content: tab.content }),
    });
    const data = await res.json();
    if (data.success) {
      tab.modified = false;
      renderTabs();
      setStatus('Saved', 'success');
      setTimeout(() => setStatus('Ready', ''), 2000);
    } else {
      const msg = 'Save failed: ' + (data.error || 'unknown error');
      setStatus(msg, 'error');
      outputLog(msg, 'err');
      expandPanel();
    }
  } catch (e) {
    setStatus('Save error: ' + e.message, 'error');
    outputLog('Save error: ' + e.message, 'err');
    expandPanel();
  }
}

// ── New File / Folder Dialogs ─────────────────────────────────────────────────
function newFileDialog(dir) {
  openModal('New File', 'filename.py', async (name) => {
    if (!name) return;
    const clean = name.trim().replace(/^\/+/, '');
    if (!clean) return;
    const path = dir ? (dir + '/' + clean) : clean;
    try {
      const res = await fetch('/api/file/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type: 'file' }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshTree();
        await openFile(path);
      } else {
        outputLog('Create failed: ' + (data.error || 'unknown'), 'err');
        expandPanel();
      }
    } catch (e) { outputLog('Create error: ' + e.message, 'err'); expandPanel(); }
  });
}

function newFolderDialog(dir) {
  openModal('New Folder', 'folder-name', async (name) => {
    if (!name) return;
    const clean = name.trim().replace(/^\/+/, '');
    if (!clean) return;
    const path = dir ? (dir + '/' + clean) : clean;
    try {
      const res = await fetch('/api/file/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type: 'dir' }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshTree();
      } else {
        outputLog('Create folder failed: ' + (data.error || 'unknown'), 'err');
        expandPanel();
      }
    } catch (e) { outputLog('Create folder error: ' + e.message, 'err'); expandPanel(); }
  });
}

// ── Rename / Delete ───────────────────────────────────────────────────────────
function treeRename(e, path) {
  e.stopPropagation();
  const name = path.split('/').pop();
  openModal('Rename', name, async (newName) => {
    if (!newName || newName === name) return;
    const newPath = path.includes('/') ? path.replace(/[^/]+$/, newName) : newName;
    const res = await fetch('/api/file/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_path: path, new_path: newPath }),
    });
    const data = await res.json();
    if (data.success) {
      const tab = state.tabs.find(t => t.path === path);
      if (tab) { tab.path = newPath; tab.name = newName; renderTabs(); }
      await refreshTree();
    } else {
      outputLog('Rename failed: ' + (data.error || ''), 'err');
    }
  }, name);
}

function treeDelete(e, path) {
  e.stopPropagation();
  if (!confirm(`Delete "${path.split('/').pop()}"?`)) return;
  fetch('/api/file/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  }).then(r => r.json()).then(d => {
    if (d.success) {
      const tab = state.tabs.find(t => t.path === path);
      if (tab) closeTab(tab.id);
      refreshTree();
    } else {
      outputLog('Delete failed: ' + (d.error || ''), 'err');
    }
  });
}
