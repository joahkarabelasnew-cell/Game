// ===== 4 GEWINNT DELUXE =====

const c4Cols = 7, c4Rows = 6;

let c4Board = Array.from({length:c4Cols}, ()=>Array(c4Rows).fill(''));
let c4Current = 'R';
let c4Active = true;

let score = { R:0, Y:0 };

const c4BoardEl = document.getElementById('c4-board');
const c4StatusEl = document.getElementById('c4-status');
const c4RestartBtn = document.getElementById('c4RestartBtn');
const c4ScoreEl = document.getElementById('c4-score');

function updateScore(){
  c4ScoreEl.textContent = `Rot: ${score.R} | Gelb: ${score.Y}`;
}

function renderC4(){
  c4BoardEl.innerHTML = '';

  for(let col=0; col<c4Cols; col++){
    const colEl = document.createElement('div');
    colEl.className = 'c4-col';
    colEl.dataset.col = col;

    colEl.addEventListener('click', () => c4Drop(col));
    colEl.addEventListener('mouseenter', () => previewDisc(col));
    colEl.addEventListener('mouseleave', removePreview);

    for(let row=0; row<c4Rows; row++){
      const slot = document.createElement('div');
      slot.className = 'c4-slot';
      slot.dataset.col = col;
      slot.dataset.row = row;
      colEl.appendChild(slot);
    }

    c4BoardEl.appendChild(colEl);
  }

  // Steine anzeigen
  for(let c=0;c<c4Cols;c++){
    for(let r=0;r<c4Rows;r++){
      const val = c4Board[c][r];
      if(val){
        const slot = c4BoardEl.querySelector(`.c4-slot[data-col="${c}"][data-row="${r}"]`);
        const disc = document.createElement('div');
        disc.className = 'disc '+(val==='R'?'red':'yellow');
        slot.appendChild(disc);
      }
    }
  }
}

//
// ⭐ Vorschau
//
function previewDisc(col){
  if(!c4Active) return;

  removePreview();

  const row = c4Board[col].indexOf('');
  if(row === -1) return;

  const slot = c4BoardEl.querySelector(`.c4-slot[data-col="${col}"][data-row="${row}"]`);

  const disc = document.createElement('div');
  disc.className = 'disc preview ' + (c4Current==='R'?'red':'yellow');
  disc.id = 'preview-disc';

  slot.appendChild(disc);
}

function removePreview(){
  const prev = document.getElementById('preview-disc');
  if(prev) prev.remove();
}

//
// ⭐ Stein fallen lassen mit Animation
//
function c4Drop(col){
  if(!c4Active) return;

  const row = c4Board[col].indexOf('');
  if(row === -1) return;

  removePreview();

  const targetSlot = c4BoardEl.querySelector(`.c4-slot[data-col="${col}"][data-row="${row}"]`);

  const disc = document.createElement('div');
  disc.className = 'disc falling ' + (c4Current==='R'?'red':'yellow');

  targetSlot.appendChild(disc);

  setTimeout(()=>{

    c4Board[col][row] = c4Current;
    renderC4();

    const winner = c4CheckWinner(col,row);

    if(winner){
      score[winner]++;
      updateScore();

      c4StatusEl.textContent = `Spieler ${winner==='R'?'Rot':'Gelb'} gewinnt!`;
      c4Active = false;
      return;
    }

    if(c4Board.every(c=>c.every(Boolean))){
      c4StatusEl.textContent = 'Unentschieden';
      c4Active = false;
      return;
    }

    c4Current = c4Current==='R' ? 'Y' : 'R';
    c4StatusEl.textContent = `Spieler ${c4Current==='R'?'Rot':'Gelb'} ist dran`;

    // ⭐ Computer Gegner spielt Gelb
    if(c4Current === 'Y'){
      setTimeout(computerMove, 500);
    }

  }, 250);
}

//
// ⭐ Computer Gegner (einfache KI)
//
function computerMove(){
  if(!c4Active) return;

  let possible = [];

  for(let c=0;c<c4Cols;c++){
    if(c4Board[c].includes('')) possible.push(c);
  }

  const move = possible[Math.floor(Math.random()*possible.length)];
  c4Drop(move);
}

//
// ⭐ Gewinner prüfen
//
function c4CheckWinner(col,row){
  const player = c4Board[col][row];
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];

  for(const [dx,dy] of dirs){
    let count = 1;

    let x = col+dx, y = row+dy;
    while(x>=0 && x<c4Cols && y>=0 && y<c4Rows && c4Board[x][y]===player){
      count++; x+=dx; y+=dy;
    }

    x = col-dx; y = row-dy;
    while(x>=0 && x<c4Cols && y>=0 && y<c4Rows && c4Board[x][y]===player){
      count++; x-=dx; y-=dy;
    }

    if(count >= 4) return player;
  }

  return null;
}

//
// ⭐ Neustart
//
function c4Restart(){
  c4Board = Array.from({length:c4Cols}, ()=>Array(c4Rows).fill(''));
  c4Current = 'R';
  c4Active = true;

  c4StatusEl.textContent = 'Spieler Rot ist dran';
  renderC4();
}

c4RestartBtn.addEventListener('click', c4Restart);

updateScore();
c4Restart();
