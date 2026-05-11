// TermuxPad - Editor Module
// Handles: language config, CodeMirror setup, tabs, file tree rendering

// ── State ─────────────────────────────────────────────────────────────────────
let WORKSPACE = '';
let termCwd = '';

const state = {
  tabs: [],
  activeTab: null,
  theme: 'dracula',
  fontSize: 13.5,
  panelCollapsed: false,
  sidebarVisible: true,
  ctxTarget: null,
};

let editor = null;
let modalCallback = null;
let panelResizing = false;

// ── Language Config ───────────────────────────────────────────────────────────
const LANG_MAP = {
  python:     { mode: 'python',        exts: ['.py']          },
  javascript: { mode: 'javascript',    exts: ['.js', '.mjs']  },
  typescript: { mode: 'javascript',    exts: ['.ts']          },
  c:          { mode: 'text/x-csrc',   exts: ['.c']           },
  cpp:        { mode: 'text/x-c++src', exts: ['.cpp', '.cc']  },
  java:       { mode: 'text/x-java',   exts: ['.java']        },
  go:         { mode: 'go',            exts: ['.go']           },
  rust:       { mode: 'rust',          exts: ['.rs']          },
  bash:       { mode: 'shell',         exts: ['.sh', '.bash'] },
  ruby:       { mode: 'ruby',          exts: ['.rb']          },
  php:        { mode: 'php',           exts: ['.php']         },
  lua:        { mode: 'lua',           exts: ['.lua']         },
  perl:       { mode: 'perl',          exts: ['.pl']          },
  html:       { mode: 'htmlmixed',     exts: ['.html', '.htm']},
  css:        { mode: 'css',           exts: ['.css']         },
  markdown:   { mode: 'markdown',      exts: ['.md']          },
};

function getLangByExt(filename) {
  const ext = '.' + filename.split('.').pop().toLowerCase();
  for (const [lang, cfg] of Object.entries(LANG_MAP))
    if (cfg.exts.includes(ext)) return lang;
  return 'python';
}

// ── Editor Init ───────────────────────────────────────────────────────────────
function initEditor() {
  editor = CodeMirror.fromTextArea(document.getElementById('cm-editor'), {
    theme: state.theme,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: false,
    keyMap: 'sublime',
    extraKeys: {
      'Ctrl-S':     () => saveCurrentFile(),
      'Ctrl-N':     () => newFileDialog(),
      'Ctrl-B':     () => toggleSidebar(),
      'F5':         () => runCode(),
      'Ctrl-/':     'toggleComment',
      'Ctrl-Enter': () => runCode(),
    },
  });
  editor.on('change', () => {
    if (!state.activeTab) return;
    const tab = state.tabs.find(t => t.id === state.activeTab);
    if (tab && editor.getValue() !== tab.content) { tab.modified = true; renderTabs(); }
  });
  editor.on('cursorActivity', () => {
    const c = editor.getCursor();
    document.getElementById('sb-cursor').textContent = `Ln ${c.line + 1}, Col ${c.ch + 1}`;
  });
  // Start hidden; shown when a file is opened
  document.getElementById('cm-host').style.display = 'none';
}

// ── File Tree ─────────────────────────────────────────────────────────────────
async function refreshTree() {
  try {
    const res = await fetch('/api/files');
    const data = await res.json();
    if (data.workspace) WORKSPACE = data.workspace;
    renderTree(data.tree || [], document.getElementById('file-tree'), '');
  } catch (e) { console.error('refreshTree:', e); }
}

function renderTree(items, container, parentPath) {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:20px 12px;font-size:11px;color:var(--fg3);text-align:center;';
    empty.textContent = 'Empty folder — click + to add a file';
    container.appendChild(empty);
    return;
  }
  const activeTab = state.tabs.find(t => t.id === state.activeTab);
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'tree-item';
    el.dataset.path = item.path;
    el.dataset.type = item.type;
    if (activeTab && activeTab.path === item.path) el.classList.add('active');

    const iconHtml = item.type === 'dir'
      ? Icons.folder(14)
      : getLangIconSvg(getLangByExt(item.name));

    el.innerHTML = `
      <span class="icon">${iconHtml}</span>
      <span class="name">${item.name}</span>
      <div class="tree-actions">
        <button class="tree-action-btn" title="Rename" onclick="treeRename(event,'${item.path.replace(/'/g, "\\'")}')">${Icons.rename(12)}</button>
        <button class="tree-action-btn" title="Delete" onclick="treeDelete(event,'${item.path.replace(/'/g, "\\'")}')">${Icons.trash(12)}</button>
      </div>`;

    if (item.type === 'file') {
      el.addEventListener('click', () => openFile(item.path));
      el.addEventListener('contextmenu', e => showCtxMenu(e, item.path, item.type));
    } else {
      let open = false;
      const childWrap = document.createElement('div');
      childWrap.style.paddingLeft = '14px';
      childWrap.style.display = 'none';
      if (item.children) renderTree(item.children, childWrap, item.path);
      el.addEventListener('click', () => {
        open = !open;
        childWrap.style.display = open ? 'block' : 'none';
        el.querySelector('.icon').innerHTML = open ? Icons.folderOpen(14) : Icons.folder(14);
      });
      el.addEventListener('contextmenu', e => showCtxMenu(e, item.path, item.type));
      container.appendChild(el);
      container.appendChild(childWrap);
      return;
    }
    container.appendChild(el);
  });
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function renderTabs() {
  const bar = document.getElementById('tabs-bar');
  bar.innerHTML = '';
  state.tabs.forEach(tab => {
    const el = document.createElement('div');
    el.className = 'tab' + (tab.id === state.activeTab ? ' active' : '') + (tab.modified ? ' modified' : '');
    el.innerHTML = `
      <span class="tab-icon">${getLangIconSvg(tab.language)}</span>
      <span class="tab-name">${tab.name}</span>
      <button class="tab-close" onclick="closeTab('${tab.id}',event)">${Icons.close(10)}</button>`;
    el.addEventListener('click', () => activateTab(tab.id));
    bar.appendChild(el);
  });
}

function activateTab(id) {
  const tab = state.tabs.find(t => t.id === id);
  if (!tab) return;
  if (state.activeTab && editor) {
    const cur = state.tabs.find(t => t.id === state.activeTab);
    if (cur) cur.content = editor.getValue();
  }
  state.activeTab = id;
  showEditor(true);
  editor.setValue(tab.content);
  editor.setOption('mode', (LANG_MAP[tab.language] || {}).mode || 'text/plain');
  document.getElementById('lang-select').value = tab.language;
  document.getElementById('sb-file').textContent = tab.name;
  document.getElementById('sb-lang').textContent = tab.language;
  renderTabs();
  editor.refresh();
  editor.focus();
}

function closeTab(id, event) {
  event && event.stopPropagation();
  const idx = state.tabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  if (state.tabs[idx].modified && !confirm(`"${state.tabs[idx].name}" has unsaved changes. Close anyway?`)) return;
  state.tabs.splice(idx, 1);
  if (state.activeTab === id) {
    const next = state.tabs[idx] || state.tabs[idx - 1];
    if (next) activateTab(next.id);
    else { state.activeTab = null; showEditor(false); renderTabs(); }
  } else renderTabs();
}

function showEditor(show) {
  document.getElementById('no-file').style.display   = show ? 'none'  : 'flex';
  document.getElementById('cm-host').style.display   = show ? 'flex'  : 'none';
  if (show && editor) setTimeout(() => editor.refresh(), 20);
}

// ── Language / Theme ──────────────────────────────────────────────────────────
function changeLanguage(lang) {
  if (!state.activeTab || !editor) return;
  const tab = state.tabs.find(t => t.id === state.activeTab);
  if (!tab) return;
  tab.language = lang;
  editor.setOption('mode', (LANG_MAP[lang] || {}).mode || 'text/plain');
  document.getElementById('sb-lang').textContent = lang;
  renderTabs();
}

function changeTheme(theme) {
  state.theme = theme;
  if (editor) {
    editor.setOption('theme', theme);
    setTimeout(() => editor.refresh(), 10);
  }
  document.body.setAttribute('data-theme', theme);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function toggleSidebar() {
  state.sidebarVisible = !state.sidebarVisible;
  document.getElementById('sidebar').classList.toggle('collapsed', !state.sidebarVisible);
  if (editor) setTimeout(() => editor.refresh(), 200);
}

// ── Settings ──────────────────────────────────────────────────────────────────
function showSettings() {
  openModal('Font Size', String(state.fontSize), (size) => {
    const sz = parseFloat(size);
    if (!isNaN(sz) && sz > 6 && sz < 40) {
      state.fontSize = sz;
      document.querySelector('.CodeMirror').style.fontSize = sz + 'px';
      if (editor) editor.refresh();
    }
  });
}
