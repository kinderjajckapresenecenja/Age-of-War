const ages = [
  {
    id: 0, name: 'Kamena doba', goldRate: 1, units: [
      { name: 'Jamski', cost: 10, hp: 40, atk: 8, spd: 0.6, xp: 5,
        appearance: { color:'#60a5fa', headRadius:6, bodyWidth:12, bodyHeight:25, weaponLen:18, shadowRX:15, shadowRY:5, weaponOffset:5 } },
      { name: 'Sulica', cost: 20, hp: 60, atk: 14, spd: 0.5, xp: 8,
        appearance: { color:'#f97316', headRadius:7, bodyWidth:14, bodyHeight:28, weaponLen:28, shadowRX:16, shadowRY:6, weaponOffset:6 } },
      // Dino jezdec: use a 'dino' type and appearance tuned for a dinosaur look
      { name: 'Dino jezdec', cost: 40, hp: 120, atk: 20, spd: 0.9, xp: 20,
        appearance: { type: 'dino', color:'#7caa3f', headRadius:8, bodyWidth:36, bodyHeight:14, tailLen:18, shadowRX:22, shadowRY:6, weaponOffset:0, weaponLen:0 } }
    ], specialCosts: { meteor: 200 }
  },
  {
    id: 1, name: 'Srednji vek', goldRate: 1.5, units: [
      { name: 'Vitez', cost: 30, hp: 120, atk: 18, spd: 0.5, xp: 14,
        appearance: { color:'#94a3b8', headRadius:8, bodyWidth:16, bodyHeight:34, weaponLen:24, shadowRX:18, shadowRY:6, weaponOffset:6 } },
      { name: 'Lokostrelec', cost: 25, hp: 60, atk: 12, spd: 0.7, xp: 10,
        appearance: { color:'#f59e0b', headRadius:6, bodyWidth:12, bodyHeight:26, weaponLen:22, shadowRX:14, shadowRY:5, weaponOffset:5 } },
      { name: 'Konjenica', cost: 50, hp: 160, atk: 26, spd: 1.0, xp: 28,
        appearance: { color:'#7c3aed', headRadius:9, bodyWidth:20, bodyHeight:40, weaponLen:28, shadowRX:22, shadowRY:8, weaponOffset:8 } }
    ], specialCosts: { dragon: 300 }
  },
  {
    id: 2, name: 'Renesansa', goldRate: 2, units: [
      { name: 'Mušketir', cost: 40, hp: 80, atk: 22, spd: 0.6, xp: 18,
        appearance: { color:'#06b6d4', headRadius:7, bodyWidth:14, bodyHeight:30, weaponLen:26, shadowRX:16, shadowRY:6, weaponOffset:6 } },
      { name: 'Top', cost: 70, hp: 220, atk: 36, spd: 0.35, xp: 40,
        appearance: { color:'#ef4444', headRadius:10, bodyWidth:26, bodyHeight:38, weaponLen:0, shadowRX:26, shadowRY:9, weaponOffset:0 } }
    ], specialCosts: { tornado: 400 }
  },
  {
    id: 3, name: 'Sodobna doba', goldRate: 3, units: [
      { name: 'Vojak', cost: 30, hp: 90, atk: 24, spd: 0.75, xp: 16,
        appearance: { color:'#38bdf8', headRadius:7, bodyWidth:14, bodyHeight:30, weaponLen:22, shadowRX:16, shadowRY:6, weaponOffset:6 } },
      { name: 'Tank', cost: 120, hp: 420, atk: 60, spd: 0.3, xp: 80,
        appearance: { color:'#111827', headRadius:12, bodyWidth:36, bodyHeight:26, weaponLen:36, shadowRX:30, shadowRY:10, weaponOffset:12 } }
    ], specialCosts: { airstrike: 600 }
  },
  {
    id: 4, name: 'Futuristična doba', goldRate: 4, units: [
      { name: 'Robot', cost: 80, hp: 200, atk: 48, spd: 0.7, xp: 40,
        appearance: { color:'#60f2b6', headRadius:9, bodyWidth:20, bodyHeight:34, weaponLen:24, shadowRX:20, shadowRY:7, weaponOffset:6 } },
      { name: 'Laser', cost: 150, hp: 300, atk: 90, spd: 0.9, xp: 120,
        appearance: { color:'#f472b6', headRadius:10, bodyWidth:22, bodyHeight:36, weaponLen:0, shadowRX:22, shadowRY:8, weaponOffset:0 } }
    ], specialCosts: { alien: 1000 }
  }
];

let state = {
  gold: 50, goldFrac: 0, xp: 0, xpToNext: 100, age: 0,
  // boost passive gold za 20%
  goldRate: ages[0].goldRate * 1.2,
  towerLevel: 1, towerHeight: 1, towerHP: 100, enemyBaseHP: 1000,
  units: [], enemyUnits: [], projectiles: [], popups: [],
  time: 0, lastGoldTick: 0, gameOver: false
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const goldEl = document.getElementById('gold');
const xpEl = document.getElementById('xp');
const xpBar = document.getElementById('xpBar');
const ageLabel = document.getElementById('ageLabel');
const goldRateEl = document.getElementById('goldRate');
const unitButtons = document.getElementById('unitButtons');
const upgradeAgeBtn = document.getElementById('upgradeAge');
const towerLevelEl = document.getElementById('towerLevel');
const towerHPEl = document.getElementById('towerHP');
const upgradeTowerBtn = document.getElementById('upgradeTower');
const enemyBaseHPEl = document.getElementById('enemyBaseHP');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const overlayBtn = document.getElementById('overlayBtn');
const toast = document.getElementById('toast');

function setupUI() {
  renderUnitButtons();
  updateUI();
}

const sounds = {
  music: new Howl({
    src: ['01. Age of War - Theme Song.mp3'],
    loop: true,
    volume: 0.4,
    html5: true
  }),
  hit: new Howl({
    src: ['02. 234.mp3'],
    volume: 0.5
  }),
  hit2: new Howl({
    src: ['14. 382.mp3'],
    volume: 0.5
  })
};

let musicStarted = false;
function startMusicOnce() {
  if (!musicStarted) {
    sounds.music.play();
    musicStarted = true;
  }
}

function renderUnitButtons() {
  unitButtons.innerHTML = '';
  const a = ages[state.age];
  a.units.forEach((u, idx) => {
    const btn = document.createElement('button');
    btn.textContent = `${u.name} — ${u.cost}g`;
    btn.className = 'small';
    btn.onclick = () => {
      startMusicOnce();
      spawnUnit('player', u);
    }
    unitButtons.appendChild(btn);

  });
}

function canAfford(cost) { return state.gold >= cost; }

function showToast(text) {
  toast.textContent = text;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 1400);
}

function showMessage(text, ended) {
  if (ended) { overlayText.textContent = text; overlay.style.display = 'flex'; state.gameOver = true; }
  else showToast(text);
}

upgradeAgeBtn.addEventListener('click', () => {
  if (state.age < ages.length - 1 && state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.age++;
    // preserve 20% passive boost when aging
    state.goldRate = ages[state.age].goldRate * 1.2;
    state.xpToNext = Math.max(1, Math.round(state.xpToNext * 1.6));
    renderUnitButtons();
    updateUI();
  }
});

upgradeTowerBtn.addEventListener('click', () => {
  const cost = 100 * state.towerLevel;
  if (canAfford(cost)) {
    state.gold -= cost;
    state.towerLevel++;
    state.towerHP += 120;
    // towerHeight grows until max 4; visual height affects rate/range
    if (state.towerHeight < 4) state.towerHeight++;
    updateUI();
  } else showToast('Ni dovolj zlata.');
});

document.getElementById('sp1').addEventListener('click', () => { if (canAfford(200)) { state.gold -= 200; meteorAttack(); updateUI(); } else showToast('Ni dovolj zlata.'); });
document.getElementById('sp2').addEventListener('click', () => { if (canAfford(300)) { state.gold -= 300; dragonAttack(); updateUI(); } else showToast('Ni dovolj zlata.'); });
document.getElementById('sp3').addEventListener('click', () => { if (canAfford(400)) { state.gold -= 400; tornadoAttack(); updateUI(); } else showToast('Ni dovolj zlata.'); });
document.getElementById('sp4').addEventListener('click', () => { if (canAfford(600)) { state.gold -= 600; airStrike(); updateUI(); } else showToast('Ni dovolj zlata.'); });
document.getElementById('sp5').addEventListener('click', () => { if (canAfford(1000)) { state.gold -= 1000; alienAttack(); updateUI(); } else showToast('Ni dovolj zlata.'); });

function spawnUnit(side, template) {
  if (side === 'player' && !canAfford(template.cost)) { showToast('Ni dovolj zlata.'); return; }
  if (side === 'player') state.gold -= template.cost;

  const defaultAppearance = { color: '#38bdf8', headRadius:8, bodyWidth:14, bodyHeight:30, weaponLen:20, shadowRX:16, shadowRY:6, weaponOffset:6 };

  const unit = {
    id: Math.random().toString(36).slice(2, 9), side, name: template.name, hp: template.hp, maxHp: template.hp,
    atk: template.atk, spd: template.spd, x: side === 'player' ? 100 : canvas.width - 100, y: 440,
    atkCooldown: 0, xpValue: template.xp,
    appearance: template.appearance ? { ...defaultAppearance, ...template.appearance } : defaultAppearance
  };
  if (side === 'player') state.units.push(unit); else state.enemyUnits.push(unit);
  updateUI();
}

let enemySpawnTimer = 0;
function enemyAI(dt) {
  enemySpawnTimer += dt;
  const cap = 14;
  // nekoliko znižan spawn rate -> daljši interval (prej 2.0)
  if (enemySpawnTimer > 3.0) {
    enemySpawnTimer = 0;
    if (state.enemyUnits.length < cap) {
      const enemyAge = Math.min(state.age, ages.length - 1);
      const pool = ages[enemyAge].units;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      spawnUnit('enemy', pick);
    }
  }
}

function meteorAttack() { state.enemyUnits.forEach(u => { if (u.x < canvas.width - 200) u.hp -= 80; }); clampEnemyBaseHP(); }
function dragonAttack() { state.enemyUnits.forEach(u => u.hp -= 60); clampEnemyBaseHP(); }
function tornadoAttack() { state.enemyUnits.forEach(u => u.x += 80); }
function airStrike() { state.enemyUnits.forEach(u => u.hp -= 120); state.enemyBaseHP -= 100; clampEnemyBaseHP(); }
function alienAttack() { state.enemyUnits.forEach(u => u.hp -= 200); state.enemyBaseHP -= 300; clampEnemyBaseHP(); }

function clampEnemyBaseHP() { state.enemyBaseHP = Math.max(0, state.enemyBaseHP); }
function clampTowerHP() { state.towerHP = Math.max(0, state.towerHP); }

function updateUnits(dt) {
  state.units.sort((a, b) => a.x - b.x);
  state.enemyUnits.sort((a, b) => a.x - b.x);

  for (let i = state.units.length - 1; i >= 0; i--) {
    const u = state.units[i];
    if (u.hp <= 0) { state.units.splice(i, 1); continue; } // odstranjeno nagrajevanje XP ob smrti lastnih enot
    let nearest = null; let nd = Infinity;
    for (const e of state.enemyUnits) {
      const d = Math.abs(e.x - u.x);
      if (d < nd) { nd = d; nearest = e; }
    }
    if (u.x > canvas.width - 100) { state.enemyBaseHP -= u.atk * dt * 5; state.units.splice(i, 1); state.xp += u.xpValue; clampEnemyBaseHP(); continue; }
    if (nearest && Math.abs(nearest.x - u.x) < 40) {
      if (u.atkCooldown <= 0) { nearest.hp -= u.atk; u.atkCooldown = 1.2; sounds.hit.play(); }
    } else { u.x += u.spd * 40 * dt; }
    if (u.atkCooldown > 0) u.atkCooldown -= dt;
  }

  for (let i = state.enemyUnits.length - 1; i >= 0; i--) {
    const u = state.enemyUnits[i];
    if (u.hp <= 0) {
      state.gold += 5;
      // nagrada XP samo ob smrti sovražnikove enote + vizualni popup nad enoto
      state.xp += u.xpValue;
      state.popups.push({ x: u.x, y: u.y - (u.appearance?.bodyHeight || 30) - 10, text: `+${u.xpValue}`, life: 1.4, vy: -30 });
      state.enemyUnits.splice(i, 1);
      continue;
    }
    let nearest = null; let nd = Infinity;
    for (const e of state.units) {
      const d = Math.abs(e.x - u.x);
      if (d < nd) { nd = d; nearest = e; }
    }
    if (u.x < 100) { state.towerHP -= u.atk * 1; state.enemyUnits.splice(i, 1); clampTowerHP(); continue; }
    if (nearest && Math.abs(nearest.x - u.x) < 40) { if (u.atkCooldown <= 0) { nearest.hp -= u.atk; u.atkCooldown = 1.2; } }
    else { u.x -= u.spd * 40 * dt; }
    if (u.atkCooldown > 0) u.atkCooldown -= dt;
  }
}

let towerFireTimer = 0;
function towerAI(dt) {
  towerFireTimer += dt;
  // fire rate in range scale with towerHeight (1..4)
  const interval = Math.max(0.5, 2.2 - state.towerHeight * 0.4); // višji stolp -> krajši interval (hitreje strelja)
  const rangeFactor = Math.min(1.0, 0.6 + (state.towerHeight - 1) * 0.1); // višji stolp -> večji range (0.6,0.7,0.8,0.9)
  if (towerFireTimer > interval && state.enemyUnits.length > 0) {
    towerFireTimer = 0;
    let target = state.enemyUnits[0];
    if (target && target.x < canvas.width * rangeFactor) {
      const p = {
        id: Math.random(),
        owner: 'player',
        x: 60, y: 340,
        targetX: target.x, targetY: target.y - 30,
        damage: 40 + state.towerLevel * 10,
        speed: 600,
      };
      state.projectiles.push(p);
    }
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20) {
      const targetList = p.owner === 'player' ? state.enemyUnits : state.units;
      let hit = false;
      for (const u of targetList) {
        sounds.hit2.play();
        if (Math.abs(u.x - p.targetX) < 25) {
          u.hp -= p.damage;
          hit = true;
          break;
        }
      }
      state.projectiles.splice(i, 1);
      continue;
    }

    p.x += (dx / dist) * p.speed * dt;
    p.y += (dy / dist) * p.speed * dt;

    if (p.x < 0 || p.x > canvas.width) {
      state.projectiles.splice(i, 1);
    }
  }
}

function cleanupAndLeveling() { if (state.xp < 0) state.xp = 0; clampTowerHP(); clampEnemyBaseHP(); }

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const groundGradient = ctx.createLinearGradient(0, 400, 0, canvas.height);
  groundGradient.addColorStop(0, '#44403c');
  groundGradient.addColorStop(1, '#292524');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, 400, canvas.width, canvas.height - 400);

  drawTower('player');
  drawTower('enemy');

  state.units.forEach(u => drawUnit(u));
  state.enemyUnits.forEach(u => drawUnit(u));

  drawProjectiles();

  // draw popups (XP +...)
  if (state.popups && state.popups.length) {
    ctx.save();
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    state.popups.forEach(p => {
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.restore();
  }
}

function drawTower(side) {
  const isPlayer = side === 'player';
  const x = isPlayer ? 20 : canvas.width - 80;
  const color1 = isPlayer ? '#38bdf8' : '#f43f5e';
  const color2 = isPlayer ? '#0ea5e9' : '#e11d48';

  // vizualna višina stolpa (premik zgornjih delov gor za vsak nivo višine)
  const heightOffset = (isPlayer ? (state.towerHeight || 1) : 1) - 1;
  const offsetPx = heightOffset * 20; // koliko se zgornji del premakne gor
  // spodnji del (osnova) ostane na tleh, zgornji elementi se dvignejo za offset
  ctx.fillStyle = color2;
  ctx.fillRect(x, 350, 60, 100 + offsetPx); // nekoliko večja osnova pri višjih stolpih

  ctx.fillStyle = color1;
  ctx.fillRect(x + 5, 320 - offsetPx, 50, 30 + offsetPx); // zgornji del premaknjen gor in podaljšan

  ctx.fillStyle = color2;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 5 + i * 12, 310 - offsetPx, 8, 10 + Math.round(offsetPx / 2));
  }

  const hp = isPlayer ? state.towerHP : state.enemyBaseHP;
  const maxHp = isPlayer ? 100 + (state.towerLevel - 1) * 120 : 1000;
  const barX = isPlayer ? x - 10 : x - 70;
  const barWidth = 140;
  const barY = 290 - offsetPx; // premakni hp bar navzgor sorazmerno s stolpom

  ctx.fillStyle = '#1f2937';
  ctx.fillRect(barX, barY, barWidth, 12);
  ctx.fillStyle = isPlayer ? '#4ade80' : '#f43f5e';
  ctx.fillRect(barX, barY, Math.max(0, (hp / maxHp)) * barWidth, 12);
}

function drawUnit(u) {
  const isPlayer = u.side === 'player';
  const yPos = u.y;
  const ap = u.appearance || { color: '#38bdf8', headRadius:8, bodyWidth:14, bodyHeight:30, weaponLen:20, shadowRX:16, shadowRY:6, weaponOffset:6 };

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(u.x, yPos + 10, ap.shadowRX || 16, ap.shadowRY || 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // special drawing for dinos
  if (ap.type === 'dino') {
    // body (horizontal ellipse)
    ctx.fillStyle = ap.color;
    ctx.beginPath();
    ctx.ellipse(u.x, yPos - 6, ap.bodyWidth / 2, ap.bodyHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // head offset forward based on side
    const headDir = isPlayer ? 1 : -1;
    const headX = u.x + headDir * (ap.bodyWidth/2 + (ap.headRadius || 8));
    const headY = yPos - 6 - (ap.headRadius || 8) / 2;
    ctx.beginPath();
    ctx.arc(headX, headY, ap.headRadius || 8, 0, Math.PI * 2);
    ctx.fill();

    // tail - a triangular tail behind body
    ctx.fillStyle = ap.color;
    ctx.beginPath();
    const tailDir = isPlayer ? -1 : 1;
    ctx.moveTo(u.x + tailDir * (ap.bodyWidth/2), yPos - 6);
    ctx.lineTo(u.x + tailDir * (ap.bodyWidth/2 + (ap.tailLen || 12)), yPos - 2);
    ctx.lineTo(u.x + tailDir * (ap.bodyWidth/2 + (ap.tailLen || 12)), yPos - 10);
    ctx.closePath();
    ctx.fill();

    // small legs
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(u.x - 8, yPos - 4, 4, 6);
    ctx.fillRect(u.x + 4, yPos - 4, 4, 6);

    // hp bar above body
    ctx.fillStyle = '#111';
    ctx.fillRect(u.x - 22, yPos - ap.bodyHeight - 26, 44, 6);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(u.x - 22, yPos - ap.bodyHeight - 26, 44 * Math.max(0, u.hp / u.maxHp), 6);

    return;
  }

  // body
  ctx.fillStyle = ap.color;
  ctx.fillRect(u.x - (ap.bodyWidth/2), yPos - ap.bodyHeight, ap.bodyWidth, ap.bodyHeight);

  // head
  ctx.beginPath();
  ctx.arc(u.x, yPos - ap.bodyHeight - ap.headRadius, ap.headRadius, 0, Math.PI * 2);
  ctx.fill();

  // weapon / mount or lance
  const weaponX = isPlayer ? u.x + ap.weaponOffset : u.x - ap.weaponOffset;
  const weaponDir = isPlayer ? 1 : -1;
  if (ap.weaponLen && ap.weaponLen > 0) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(weaponX, yPos - (ap.bodyHeight/2));
    ctx.lineTo(weaponX + ap.weaponLen * weaponDir, yPos - (ap.bodyHeight/1.5));
    ctx.stroke();
  } else {
    // if no weapon, draw a tail/crest for variety
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(u.x - 2, yPos - ap.bodyHeight + 6);
    ctx.lineTo(u.x - 12 * weaponDir, yPos - ap.bodyHeight + 12);
    ctx.stroke();
  }

  // hp bar
  ctx.fillStyle = '#111';
  ctx.fillRect(u.x - 18, yPos - ap.bodyHeight - 30, 36, 6);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(u.x - 18, yPos - ap.bodyHeight - 30, 36 * Math.max(0, u.hp / u.maxHp), 6);
}

function drawProjectiles() {
  state.projectiles.forEach(p => {
    ctx.save();
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

let last = performance.now() / 1000;
function loop() {
  if (state.gameOver) return;
  const now = performance.now() / 1000;
  let dt = now - last;
  if (dt <= 0) dt = 0.016;
  dt = Math.min(0.1, dt);
  last = now;

  state.lastGoldTick += dt;
  if (state.lastGoldTick >= 0.2) {
    state.goldFrac += state.goldRate * state.lastGoldTick;
    const add = Math.floor(state.goldFrac);
    if (add > 0) { state.gold += add; state.goldFrac -= add; }
    state.lastGoldTick = 0;
  }

  enemyAI(dt);
  updateUnits(dt);
  towerAI(dt);
  updateProjectiles(dt);

  // update popups (float up and expire)
  for (let i = state.popups.length - 1; i >= 0; i--) {
    const p = state.popups[i];
    p.life -= dt;
    p.y += p.vy * dt;
    if (p.life <= 0) state.popups.splice(i, 1);
  }

  cleanupAndLeveling();

  updateUI();
  draw();

  if (state.enemyBaseHP <= 0) { showMessage('Zmagal si! Sovražnikova baza je uničena.', true); return; }
  if (state.towerHP <= 0) { showMessage('Izgubil si! Tvoja baza je bila uničena.', true); return; }

  requestAnimationFrame(loop);
}

function updateUI() {
  goldEl.textContent = Math.round(state.gold);
  xpEl.textContent = `${Math.round(state.xp)} / ${state.xpToNext}`;
  xpBar.style.width = `${state.xpToNext > 0 ? Math.min(100, (state.xp / state.xpToNext) * 100) : 0}%`;
  ageLabel.textContent = ages[state.age].name;
  // pokaži dejanski (boostan) goldRate
  goldRateEl.textContent = state.goldRate;
  towerLevelEl.textContent = state.towerLevel;
  towerHPEl.textContent = Math.round(state.towerHP);
  enemyBaseHPEl.textContent = Math.max(0, Math.round(state.enemyBaseHP));

  const canAdvance = state.age < ages.length - 1 && state.xp >= state.xpToNext;
  upgradeAgeBtn.disabled = !canAdvance;
  upgradeAgeBtn.title = canAdvance ? 'Napreduj v naslednje obdobje!' : 'Potrebuješ več XP.';

  const cost = 100 * state.towerLevel;
  upgradeTowerBtn.textContent = `Nadgradi stolp (${cost}g)`;
}

function resetGame() {
  state = { gold: 50, goldFrac: 0, xp: 0, xpToNext: 100, age: 0, goldRate: 1, towerLevel: 1, towerHeight: 1, towerHP: 100, enemyBaseHP: 1000, units: [], enemyUnits: [], projectiles: [], popups: [], time: 0, lastGoldTick: 0, gameOver: false };
  renderUnitButtons();
  updateUI();
  overlay.style.display = 'none';
  toast.style.display = 'none';
  last = performance.now() / 1000;
  requestAnimationFrame(loop);
}

overlayBtn.addEventListener('click', () => { resetGame(); });

for (let i = 0; i < 3; i++) { spawnUnit('enemy', ages[0].units[0]); }

setupUI();
requestAnimationFrame(loop);