// === Supabase Setup ===
const SUPABASE_URL     = "https://jrsitrdcknsnhpljcgyy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyc2l0cmRja25zbmhwbGpjZ3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDE5MDMsImV4cCI6MjA2NjI3NzkwM30.6VnDioQ_AHAfx80jv18OkHz_4yxrDxTVNT5wdzY1KUI";
const supabase          = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load persisted state
let players = JSON.parse(localStorage.getItem('players') || '{}');
let distanceKm = parseFloat(localStorage.getItem('distanceKm') || '0');
let rounds = JSON.parse(localStorage.getItem('rounds') || '[]');
let selectedPlayer = null;

// Persist state
function persist() {
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('distanceKm', distanceKm);
  localStorage.setItem('rounds', JSON.stringify(rounds));
}

function handleKey(e, isExtra) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addPlayer(isExtra);
  }
}

function addPlayer(isExtra = false) {
  const inputId = isExtra ? 'extraPlayerName' : 'playerName';
  const name = document.getElementById(inputId).value.trim();
  if (name && !players[name]) {
    players[name] = 0;
    document.getElementById(inputId).value = '';
    persist();
    if (!isExtra) updateInitialList();
    updateScoreboard();
  }
}

function updateInitialList() {
  const list = document.getElementById('playerList');
  list.innerHTML = '';
  for (let name in players) {
    const p = document.createElement('p');
    p.textContent = name;
    list.appendChild(p);
  }
}

function startGame() {
  const input = document.getElementById('distanceKm').value;
  distanceKm = parseFloat(input);
  if (isNaN(distanceKm) || distanceKm <= 0) {
    return alert('Voer eerst een geldige afstand in, bijvoorbeeld 12.5');
  }
  persist();
  document.getElementById('initialInput').classList.add('hidden');
  document.getElementById('newPlayerInput').classList.remove('hidden');
  document.getElementById('scoreboard').classList.remove('hidden');
  document.getElementById('resetButton').classList.remove('hidden');
  document.getElementById('restartButton').classList.remove('hidden');
  document.getElementById('saveRoundBtn').classList.remove('hidden');
document.getElementById('roundsHistory').classList.remove('hidden');
  updateScoreboard();
  document.querySelector('header').innerHTML = `<img src="trekkerspel_banner.png" class="banner" alt="Banner"/>
    <h1>Trekkerspel App — ${distanceKm} km</h1>`;
}

function updateScoreboard() {
  const board = document.getElementById('scoreboard');
  board.innerHTML = '';
  const sorted = Object.entries(players).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, score], idx) => {
    const rank = idx + 1;
    const div = document.createElement('div');
    div.className = 'player';
    const perKm = distanceKm ? (score / distanceKm).toFixed(2) : '0.00';
    let rankClass = '';
    if (rank === 1) rankClass = 'gold';
    else if (rank === 2) rankClass = 'silver';
    else if (rank === 3) rankClass = 'bronze';
    div.innerHTML = `<div class="rank ${rankClass}">${rank}</div>
      <h2>${name}</h2>
      <p>
  <input
    type="number"
    value="${score}"
    onchange="updateScore('${name}', this.value)"
    style="width:60px; text-align:center;"
  > punten — ${perKm} p/km
</p>
      <button onclick="openTrekkerModal('${name}')"><i class='fas fa-binoculars'></i> Trekker!</button>
      <button onclick="losePoints('${name}')"><i class='fas fa-skull-crossbones'></i> Fout!</button>`;
    board.appendChild(div);
  });
}

function openTrekkerModal(name) {
  selectedPlayer = name;
  document.getElementById('modalPlayer').textContent = name + ' ziet een trekker:';
  document.getElementById('groupCheck').checked = false;
  updateTrekkerLabels();
  document.getElementById('trekkerModal').classList.add('show');
}

function updateTrekkerLabels() {
  const isGroup = document.getElementById('groupCheck').checked;
  const buttons = document.querySelectorAll('.trekker-buttons button');
  buttons.forEach(button => {
    const base = parseInt(button.getAttribute('data-base'));
    const label = button.querySelector('span');
    if (isGroup) {
      switch (base) {
        case 1: label.textContent = 'Groep trekkers (5)'; break;
        case 3: label.textContent = 'Groep rijdende trekkers (15)'; break;
        case 6: label.textContent = 'Groep vermomde trekkers (30)'; break;
        case 15: label.textContent = 'Groep gereden trekkers (75)'; break;
        case 50: label.textContent = 'Groep gevaren trekkers (250)'; break;
        case 999: label.textContent = 'Groep gevlogen trekkers (4995)'; break;
      }
    } else {
      switch (base) {
        case 1: label.textContent = 'Trekker (1)'; break;
        case 3: label.textContent = 'Rijdende trekker (3)'; break;
        case 6: label.textContent = 'Vermomde trekker (6)'; break;
        case 15: label.textContent = 'Gereden trekker (15)'; break;
        case 50: label.textContent = 'Gevaren trekker (50)'; break;
        case 999: label.textContent = 'Gevlogen trekker (999)'; break;
      }
    }
  });
}

function selectTrekker(basePoints) {
  let points = basePoints;
  if (document.getElementById('groupCheck').checked) {
    points *= 5;
  }
  if (points === 999) {
    alert(selectedPlayer + ' heeft een gevlogen trekker gespot en wint het spel!');
  }
  players[selectedPlayer] += points;
  persist();
  closeModal();
  updateScoreboard();
}

function cancelTrekker() {
  closeModal();
}

function closeModal() {
  document.getElementById('trekkerModal').classList.remove('show');
}

function losePoints(name) {
  players[name] = 0;
  persist();
  updateScoreboard();
}

function resetGame() {
  for (let name in players) {
    players[name] = 0;
  }
  persist();
  updateScoreboard();
}
function updateScore(name, value) {
  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    players[name] = num;
    persist();           // localStorage up-to-date houden
    updateScoreboard();  // UI verversen
  }
}

function restartGame() {
  // Clear stored state and reload
  localStorage.removeItem('players');
  localStorage.removeItem('distanceKm');
  location.reload();
}

/**
 * Slaat de huidige scores op als een ronde en maakt scores weer 0
 */
async function saveRound() {
  // Maak een snapshot van de huidige ronde
const snapshot = {
  timestamp: new Date().toLocaleString(),  // datum/tijd
  distance:  distanceKm,                   // afstand in km
  players:   { ...players }                // kopie van alle scores
};

  rounds.push(snapshot);

  // reset scores…
  for (let name in players) players[name] = 0;

  // ─────────── Hier toevoegen ───────────
  try {
    const inserts = Object.entries(snapshot.players).map(([player,score]) => ({
      timestamp:     snapshot.timestamp,
      distance_km:   snapshot.distance,
      player,
      score,
      points_per_km: score / snapshot.distance
    }));
    const { error } = await supabase
      .from('global_rounds')
      .insert(inserts);
    if (error) console.error("Supabase insert error:", error);
  } catch (err) {
    console.error("Insert naar Supabase mislukt:", err);
  }
  // ────────────────────────────────────

  persist();
  updateScoreboard();
  renderRounds();
  alert('Ronde opgeslagen!');
}

/**
 * Toont de geschiedenis van bewaarde rondes
 */
function renderRounds() {
  const list = document.getElementById('roundList');
  list.innerHTML = '';
  rounds.forEach((r, i) => {
    // Bepaal winnaar en punten per km
    const sorted = Object.entries(r.players).sort((a,b)=>b[1]-a[1]);
    const [winName, winScore] = sorted[0] || ['-', 0];
    const winPpk = r.distance > 0 ? (winScore/r.distance).toFixed(2) : '0.00';
    const li = document.createElement('li');
    li.textContent =
      `${i+1}. ${r.timestamp} — ${r.distance} km — ` +
      `Winnaar: ${winName} (${winScore} p, ${winPpk} p/km)`;
    list.appendChild(li);
  });
}

// On load
window.addEventListener('DOMContentLoaded', () => {
  renderRounds();
  updateInitialList();
  if (distanceKm > 0) {
    document.getElementById('distanceKm').value = distanceKm;
    document.querySelector('header').innerHTML = `<img src="trekkerspel_banner.png" class="banner" alt="Banner"/>
      <h1>Trekkerspel App — ${distanceKm} km</h1>`;
    document.getElementById('initialInput').classList.add('hidden');
    document.getElementById('newPlayerInput').classList.remove('hidden');
    document.getElementById('scoreboard').classList.remove('hidden');
    document.getElementById('resetButton').classList.remove('hidden');
    document.getElementById('restartButton').classList.remove('hidden');
    updateScoreboard();
  }
});
