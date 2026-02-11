const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settings');

let board = Array(9).fill('');
let currentPlayer = 'X';
let active = true;

function createBoard(){
  boardEl.innerHTML = '';
  board.forEach((v,i)=>{
    const btn = document.createElement('button');
    btn.className = 'cell';
    btn.dataset.index = i;
    btn.addEventListener('click', onCellClick);
    btn.setAttribute('aria-label', `Feld ${i+1}`);
    btn.textContent = v;
    if(v==='X') btn.classList.add('x')
    if(v==='O') btn.classList.add('o')
    boardEl.appendChild(btn);
  })
}

function onCellClick(e){
  if(!active) return;
  const i = +e.currentTarget.dataset.index;
  if(board[i]) return;
  board[i] = currentPlayer;
  updateBoardUI();
  const winner = checkWinner();
  if(winner){
    statusEl.textContent = `Spieler ${winner} gewinnt!`;
    highlightWin(winner.positions);
    active = false;
    return;
  }
  if(board.every(Boolean)){
    statusEl.textContent = `Unentschieden`;
    active = false;
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusEl.textContent = `Spieler ${currentPlayer} ist dran`;
}

function updateBoardUI(){
  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach(c=>{
    const i = +c.dataset.index;
    c.textContent = board[i];
    c.classList.remove('x','o');
    if(board[i]==='X') c.classList.add('x');
    if(board[i]==='O') c.classList.add('o');
  })
}

function checkWinner(){
  const patterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const p of patterns){
    const [a,b,c] = p;
    if(board[a] && board[a]===board[b] && board[a]===board[c]){
      return {player: board[a], positions: p};
    }
  }
  return null;
}

function highlightWin(positions){
  positions.forEach(i=>{
    const cell = boardEl.querySelector(`[data-index="${i}"]`);
    if(cell) cell.classList.add('win');
  })
}

function restart(){
  board = Array(9).fill('');
  currentPlayer = 'X';
  active = true;
  statusEl.textContent = `Spieler ${currentPlayer} ist dran`;
  createBoard();
}

restartBtn.addEventListener('click', restart);

// Settings
const bgColor = document.getElementById('bgColor');
const textColor = document.getElementById('textColor');
const xColor = document.getElementById('xColor');
const oColor = document.getElementById('oColor');
const scaleRange = document.getElementById('scaleRange');
const scaleLabel = document.getElementById('scaleLabel');
const saveSettings = document.getElementById('saveSettings');
const resetSettings = document.getElementById('resetSettings');
const closeSettings = document.getElementById('closeSettings');

const SETTINGS_KEY = 't3-settings-v1';

function openSettings(){
  settingsModal.setAttribute('aria-hidden','false');
  loadSettingsToForm();
}
function closeSettingsModal(){
  settingsModal.setAttribute('aria-hidden','true');
}

settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsModal);

function loadSettingsToForm(){
  const s = loadSettings();
  bgColor.value = s.bgColor;
  textColor.value = s.textColor;
  xColor.value = s.xColor;
  oColor.value = s.oColor;
  scaleRange.value = s.scalePercent;
  scaleLabel.textContent = `${s.scalePercent}%`;
}

scaleRange.addEventListener('input', ()=>{
  scaleLabel.textContent = `${scaleRange.value}%`;
  applyScale(scaleRange.value);
});

saveSettings.addEventListener('click', ()=>{
  const s = {
    bgColor: bgColor.value,
    textColor: textColor.value,
    xColor: xColor.value,
    oColor: oColor.value,
    scalePercent: +scaleRange.value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  applySettings(s);
  closeSettingsModal();
});

resetSettings.addEventListener('click', ()=>{
  localStorage.removeItem(SETTINGS_KEY);
  const s = defaultSettings();
  applySettings(s);
  loadSettingsToForm();
});

function defaultSettings(){
  return {
    bgColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#e9eef6',
    textColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#0f1720',
    xColor: getComputedStyle(document.documentElement).getPropertyValue('--x-color').trim() || '#1f6feb',
    oColor: getComputedStyle(document.documentElement).getPropertyValue('--o-color').trim() || '#d6336c',
    scalePercent: 100
  }
}

function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return defaultSettings();
}

function applySettings(s){
  document.documentElement.style.setProperty('--bg-color', s.bgColor);
  document.documentElement.style.setProperty('--text-color', s.textColor);
  document.documentElement.style.setProperty('--x-color', s.xColor);
  document.documentElement.style.setProperty('--o-color', s.oColor);
  applyScale(s.scalePercent);
}

function applyScale(percent){
  const scale = Math.max(0, percent) / 100;
  document.documentElement.style.setProperty('--ui-scale', scale);
  scaleLabel.textContent = `${percent}%`;
}

// init
applySettings(loadSettings());
createBoard();
