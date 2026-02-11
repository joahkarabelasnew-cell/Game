const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settings');

// Tabs
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('[data-tabpanel]');

function switchTab(name){
  tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
  panels.forEach(p=>p.classList.toggle('hidden', p.id!==( 'tab-'+name)));
}
tabs.forEach(t=>t.addEventListener('click', ()=>switchTab(t.dataset.tab)));

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

// ---- Connect Four (C4) ----
const c4Cols = 7, c4Rows = 6;
let c4Board = Array.from({length:c4Cols}, ()=>Array(c4Rows).fill(''));
let c4Current = 'R';
let c4Active = true;
const c4BoardEl = document.getElementById('c4-board');
const c4StatusEl = document.getElementById('c4-status');
const c4RestartBtn = document.getElementById('c4RestartBtn');

function renderC4(){
  c4BoardEl.innerHTML = '';
  for(let col=0; col<c4Cols; col++){
    const colEl = document.createElement('div');
    colEl.className = 'c4-col';
    colEl.dataset.col = col;
    for(let row=0; row<c4Rows; row++){
      const slot = document.createElement('div');
      slot.className = 'c4-slot';
      slot.dataset.col = col; slot.dataset.row = row;
      colEl.appendChild(slot);
    }
    // clickable overlay
    const btn = document.createElement('button');
    btn.className = 'c4-col-button';
    btn.addEventListener('click', ()=>c4Drop(col));
    colEl.appendChild(btn);
    c4BoardEl.appendChild(colEl);
  }
  // render discs
  for(let c=0;c<c4Cols;c++){
    for(let r=0;r<c4Rows;r++){
      const val = c4Board[c][r];
      if(val){
        const slot = c4BoardEl.querySelector(`.c4-slot[data-col="${c}"][data-row="${r}"]`);
        const disc = document.createElement('div');
        disc.className = 'disc '+(val==='R'?'red':'yellow');
        // position inside slot
        disc.style.transform = 'translate(-50%,0)';
        slot.appendChild(disc);
      }
    }
  }
}

function c4Drop(col){
  if(!c4Active) return;
  const column = c4Board[col];
  const row = column.indexOf('');
  if(row===-1) return; // full

  // create falling disc animation
  const topSlot = c4BoardEl.querySelector(`.c4-slot[data-col="${col}"][data-row="${c4Rows-1}"]`);
  const disc = document.createElement('div');
  disc.className = 'disc '+(c4Current==='R'?'red':'yellow');
  disc.style.top = '-40%';
  disc.style.transform = `translate(-50%,-200%)`;
  c4BoardEl.appendChild(disc);

  // compute target slot element and its offset
  const targetSlot = c4BoardEl.querySelector(`.c4-slot[data-col="${col}"][data-row="${row}"]`);
  const boardRect = c4BoardEl.getBoundingClientRect();
  const targetRect = targetSlot.getBoundingClientRect();
  const startY = -40; // percent relative
  const delta = targetRect.top - boardRect.top;

  // animate using CSS transform to the correct Y
  const slotCenterY = delta + (targetRect.height - targetRect.height/2);
  disc.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
  requestAnimationFrame(()=>{
    const translateY = slotCenterY;
    disc.style.transform = `translate(-50%, ${translateY}px)`;
  });

  // after animation, commit to board
  setTimeout(()=>{
    c4Board[col][row] = c4Current;
    disc.remove();
    renderC4();
    const winner = c4CheckWinner(col,row);
    if(winner){
      c4StatusEl.textContent = `Spieler ${winner==='R'?'Rot':'Gelb'} gewinnt!`;
      c4Active = false;
      return;
    }
    // check draw
    const full = c4Board.every(c=>c.every(Boolean));
    if(full){ c4StatusEl.textContent = 'Unentschieden'; c4Active=false; return; }
    c4Current = c4Current==='R' ? 'Y' : 'R';
    c4StatusEl.textContent = `Spieler ${c4Current==='R'?'Rot':'Gelb'} ist dran`;
  }, 440);
}

function c4CheckWinner(col,row){
  const player = c4Board[col][row];
  if(!player) return null;
  // directions: horizontal, vertical, diag1, diag2
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let count = 1;
    for(let dir=1;dir<=1;dir++){
      let x=col+dx*dir, y=row+dy*dir;
      while(x>=0 && x<c4Cols && y>=0 && y<c4Rows && c4Board[x][y]===player){ count++; x+=dx; y+=dy; }
    }
    for(let dir=1;dir<=1;dir++){
      let x=col-dx*dir, y=row-dy*dir;
      while(x>=0 && x<c4Cols && y>=0 && y<c4Rows && c4Board[x][y]===player){ count++; x-=dx; y-=dy; }
    }
    if(count>=4) return player;
  }
  return null;
}

function c4Restart(){
  c4Board = Array.from({length:c4Cols}, ()=>Array(c4Rows).fill(''));
  c4Current = 'R'; c4Active = true;
  c4StatusEl.textContent = `Spieler Rot ist dran`;
  renderC4();
}

c4RestartBtn.addEventListener('click', c4Restart);

// init c4
c4Restart();

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
