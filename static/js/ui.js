// TermuxPad - UI Utilities Module
// Handles: modal, context menu, status bar

// ── Status Bar ────────────────────────────────────────────────────────────────
function setStatus(msg, cls = '') {
  const el = document.getElementById('run-status');
  el.textContent = msg;
  el.className = cls;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(title, placeholder, cb, initialValue) {
  document.getElementById('modal-title').textContent = title;
  const inp = document.getElementById('modal-input');
  inp.placeholder = placeholder;
  inp.value = initialValue !== undefined ? initialValue : '';
  const confirmBtn = document.getElementById('modal-confirm');
  confirmBtn.textContent = title.startsWith('Rename') ? 'Rename' : 'Create';
  document.getElementById('modal').classList.add('show');
  modalCallback = cb;
  setTimeout(() => {
    inp.focus();
    if (initialValue) inp.select();
  }, 80);
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  modalCallback = null;
}

function confirmModal() {
  const val = document.getElementById('modal-input').value.trim();
  const cb = modalCallback;
  closeModal();
  if (cb) cb(val);
}

function initModal() {
  document.getElementById('modal-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmModal();
    if (e.key === 'Escape') closeModal();
  });
}

// ── Context Menu ──────────────────────────────────────────────────────────────
function showCtxMenu(e, path, type) {
  e.preventDefault();
  state.ctxTarget = { path, type };
  const m = document.getElementById('ctx-menu');
  document.getElementById('ctx-open').style.display    = type === 'file' ? '' : 'none';
  document.getElementById('ctx-newfile').style.display = type === 'dir'  ? '' : 'none';
  document.getElementById('ctx-newfolder').style.display = type === 'dir' ? '' : 'none';
  m.style.left = e.clientX + 'px';
  m.style.top  = e.clientY + 'px';
  m.classList.add('show');
}

async function ctxAction(action) {
  const { path, type } = state.ctxTarget || {};
  document.getElementById('ctx-menu').classList.remove('show');
  if (!path) return;
  if (action === 'open' && type === 'file')  openFile(path);
  else if (action === 'rename')              treeRename({ stopPropagation: () => {} }, path);
  else if (action === 'delete')              treeDelete({ stopPropagation: () => {} }, path);
  else if (action === 'newfile')             newFileDialog(path);
  else if (action === 'newfolder')           newFolderDialog(path);
}

function initContextMenu() {
  document.addEventListener('click', () => {
    document.getElementById('ctx-menu').classList.remove('show');
  });
}
