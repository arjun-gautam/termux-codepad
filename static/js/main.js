// TermuxPad - Main Entry Point

async function loadSystemInfo() {
  try {
    const res = await fetch('/api/system');
    const data = await res.json();
    if (data.workspace) {
      WORKSPACE = data.workspace;
      termCwd = data.workspace;
      updateTermCwd(data.workspace);
    }
    const tools = Object.entries(data.tools || {}).filter(([, v]) => v).map(([k]) => k);
    outputLog(`TermuxPad ready. Tools: ${tools.join(', ') || 'none detected'}`, 'info');
  } catch (e) { console.error('loadSystemInfo:', e); }
}

window.addEventListener('load', async () => {
  // Init all modules
  initEditor();
  initTerminal();
  initModal();
  initContextMenu();
  initPanelResize();

  // Load data
  await loadSystemInfo();
  await refreshTree();

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeProjectExplorer(); return; }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveCurrentFile(); }
    if (e.ctrlKey && e.key === 'n') { e.preventDefault(); newFileDialog(); }
    if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
    if (e.ctrlKey && e.key === 'o') { e.preventDefault(); openProjectExplorer(); }
    if (e.key === 'F5') { e.preventDefault(); runCode(); }
  });

  // Explorer keyboard: Enter to open selected folder
  document.getElementById('explorer-overlay').addEventListener('keydown', e => {
    if (e.key === 'Enter' && explorerState.selectedType === 'dir') confirmOpenProject();
  });

  // Open project explorer on startup
  openProjectExplorer();
});
