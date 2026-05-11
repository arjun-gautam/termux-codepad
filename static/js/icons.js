// TermuxPad - SVG Icon Library
// All icons are inline SVGs from Lucide / Bootstrap Icons icon sets
// Usage: Icons.folder()  →  returns SVG string

const Icons = (() => {
  const svg = (body, size = 14) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

  return {
    // ── App / Toolbar ──────────────────────────────────────────────────────
    terminal: (s) => svg(`<path d="M6 9l-3 3 3 3"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M3 12h10M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M3 5l3 3-3 3"/>`, s || 16),
    sidebar:   (s) => svg(`<path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v11A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-11zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-11z"/>`, s),
    folder:    (s) => svg(`<path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.19a2 2 0 0 1 1.73 1L8 3h5.5a2 2 0 0 1 1.99 2.013l-.01 6.975a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3.87zm1.952-.435A1 1 0 0 0 1.5 4.5V12h11V5h-5a1 1 0 0 1-.86-.49L5.5 3H2.5a.996.996 0 0 0-.008.435z"/>`, s),
    folderOpen:(s) => svg(`<path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.762-2.172-1.485A1.34 1.34 0 0 0 5.764 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>`, s),
    filePlus:  (s) => svg(`<path d="M9 1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5v1H4a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3h5v1zm4 5v7.5l-1.5 1.5H9V6h4zm-1 1v6h1.5l.5-.5V7h-2z"/><path d="M12 0v6h4L12 0z"/>`, s),
    save:      (s) => svg(`<path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>`, s),
    play:      (s) => svg(`<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>`, s),
    settings:  (s) => svg(`<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.892 3.433-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.892-1.64-.901-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.474l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>`, s),
    close:     (s) => svg(`<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>`, s),
    chevronUp: (s) => svg(`<path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>`, s),
    chevronDown:(s)=> svg(`<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>`, s),
    chevronLeft:(s)=> svg(`<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>`, s),
    refresh:   (s) => svg(`<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>`, s),
    rename:    (s) => svg(`<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>`, s),
    trash:     (s) => svg(`<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>`, s),
    // ── File Icons ────────────────────────────────────────────────────────
    file:      (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>`, s),
    filePy:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4.5" y="11" font-size="6.5" font-family="monospace" fill="currentColor">py</text>`, s),
    fileJs:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4.5" y="11" font-size="6.5" font-family="monospace" fill="currentColor">js</text>`, s),
    fileTs:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4.5" y="11" font-size="6.5" font-family="monospace" fill="currentColor">ts</text>`, s),
    fileC:     (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="5.5" y="11" font-size="6.5" font-family="monospace" fill="currentColor">c</text>`, s),
    fileGo:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4.5" y="11" font-size="6.5" font-family="monospace" fill="currentColor">go</text>`, s),
    fileSh:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4.5" y="11" font-size="6.5" font-family="monospace" fill="currentColor">sh</text>`, s),
    fileMd:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4" y="11" font-size="6" font-family="monospace" fill="currentColor">md</text>`, s),
    fileJson:  (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/><text x="4" y="11" font-size="5.5" font-family="monospace" fill="currentColor">{}</text>`, s),
    // ── Large icons (for explorer grid / empty state) ──────────────────────
    folderLg:  (s) => svg(`<path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.19a2 2 0 0 1 1.73 1L8 3h5.5a2 2 0 0 1 1.99 2.013l-.01 6.975a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3.87zm1.952-.435A1 1 0 0 0 1.5 4.5V12h11V5h-5a1 1 0 0 1-.86-.49L5.5 3H2.5a.996.996 0 0 0-.008.435z"/>`, s || 36),
    fileLg:    (s) => svg(`<path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>`, s || 36),
    // ── Sidebar / explorer quicklinks ─────────────────────────────────────
    home:      (s) => svg(`<path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146z"/>`, s),
    hdd:       (s) => svg(`<path d="M4.318 2.986A2 2 0 0 1 6 2h4a2 2 0 0 1 1.682.986l1.658 2.487A.5.5 0 0 1 13.5 6H13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6h-.5a.5.5 0 0 1-.16-.027l-.015-.006-.005-.002A.5.5 0 0 1 2 5.5V5a2 2 0 0 1 .318-1.014l1.999-2zm.664 0-1.664 2.497H12.682L11.017 2.986A1 1 0 0 0 10 2.5H6a1 1 0 0 0-.841.441.5.5 0 0 0 .004.045zm-.498 4.014v6a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V7H4.484zm5.516 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5z"/>`, s),
    download:  (s) => svg(`<path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>`, s),
    phone:     (s) => svg(`<path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/><path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>`, s),
    lightning: (s) => svg(`<path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>`, s),
    git:       (s) => svg(`<path d="M15.698 7.287 8.712.302a1.03 1.03 0 0 0-1.457 0l-1.45 1.45 1.84 1.84a1.223 1.223 0 0 1 1.55 1.56l1.773 1.774a1.224 1.224 0 0 1 1.267 2.025 1.226 1.226 0 0 1-2.002-1.334L8.58 5.963v4.353a1.226 1.226 0 1 1-1.008-.036V5.887a1.226 1.226 0 0 1-.666-1.608L5.093 2.465l-4.79 4.79a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.031 1.031 0 0 0-.001-1.458z"/>`, s),
  };
})();

// ── Language color/icon map ─────────────────────────────────────────────────
// Returns an SVG icon HTML string for a given language
function getLangIconSvg(lang) {
  // Color-coded language badge icons
  const colors = {
    python:     '#3776ab',
    javascript: '#f7df1e',
    typescript: '#3178c6',
    c:          '#a8b9cc',
    cpp:        '#659ad2',
    java:       '#ed8b00',
    go:         '#00add8',
    rust:       '#ce422b',
    bash:       '#4eaa25',
    ruby:       '#cc342d',
    php:        '#8892be',
    lua:        '#000080',
    perl:       '#0073a1',
    html:       '#e34f26',
    css:        '#1572b6',
    markdown:   '#083fa1',
  };
  const labels = {
    python:'py', javascript:'js', typescript:'ts', c:'c', cpp:'c++',
    java:'java', go:'go', rust:'rs', bash:'sh', ruby:'rb', php:'php',
    lua:'lua', perl:'pl', html:'html', css:'css', markdown:'md',
  };
  const color = colors[lang] || '#6e7681';
  const label = labels[lang] || lang.slice(0, 3);
  const fs = label.length > 2 ? 4 : label.length > 1 ? 5 : 6;
  const tx = label.length > 2 ? 1.5 : label.length > 1 ? 2.5 : 4.5;
  return `<svg width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="14" height="14" rx="2" fill="${color}" opacity="0.2"/>
    <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="${color}" stroke-width="1.2"/>
    <text x="${tx}" y="${11}" font-size="${fs}" font-family="JetBrains Mono,monospace" font-weight="700" fill="${color}">${label}</text>
  </svg>`;
}

// Generic file icon for unknown extensions
function getFileIconSvg(name, size) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const lang = EXT_LANG_MAP[ext];
  if (lang) return getLangIconSvg(lang);
  // Special cases
  const specialColor = {
    json: '#cbcb41', yaml: '#cbcb41', yml: '#cbcb41',
    xml: '#e37933', sql: '#336791', zip: '#8b949e',
    png: '#89b4fa', jpg: '#89b4fa', jpeg: '#89b4fa',
    svg: '#ffb86c', gif: '#89b4fa',
  }[ext];
  const specialLabel = {
    json: '{}', yaml: 'yml', yml: 'yml', xml: 'xml',
    sql: 'sql', zip: 'zip', png: 'img', jpg: 'img',
    jpeg: 'img', svg: 'svg', gif: 'gif',
  }[ext];
  if (specialColor) {
    const fs = (specialLabel || '').length > 2 ? 4 : 5;
    const tx = (specialLabel || '').length > 2 ? 1.5 : 2.5;
    return `<svg width="${size||14}" height="${size||14}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill="${specialColor}" opacity="0.2"/>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="${specialColor}" stroke-width="1.2"/>
      <text x="${tx}" y="11" font-size="${fs}" font-family="monospace" font-weight="700" fill="${specialColor}">${specialLabel}</text>
    </svg>`;
  }
  return Icons.file(size);
}

// Extension → language map (used by getFileIconSvg)
const EXT_LANG_MAP = {
  py:'python', js:'javascript', mjs:'javascript', ts:'typescript',
  c:'c', cpp:'cpp', cc:'cpp', java:'java', go:'go', rs:'rust',
  sh:'bash', bash:'bash', rb:'ruby', php:'php', lua:'lua',
  pl:'perl', html:'html', htm:'html', css:'css', md:'markdown',
};
