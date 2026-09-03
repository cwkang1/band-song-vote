const PLAYLIST_ID = 'PLV3ZKiyBvcMM';
const SONGS = [
  { title: 'Lean', artist: 'Tuesday Beach Club' },
  { title: 'Replay', artist: '음성녹음' },
  { title: 'Nostalgia', artist: '청난' },
  { title: '애증', artist: '체즈베리' },
  { title: 'Antifreeze', artist: '검정치마' },
  { title: '이제안녕', artist: '조유리' },
  { title: '조금만 더', artist: '밴드기린' },
  { title: '목화', artist: '보수동쿨러' },
  { title: '불꽃놀이', artist: '공원' },
  { title: '비틀비틀', artist: '김수영' },
].map((song, id) => ({ ...song, id, playlistIndex: id }));

const $ = (id) => document.getElementById(id);
const introView = $('introView');
const gameView = $('gameView');
const resultView = $('resultView');
const matchArea = $('matchArea');
const stageLabel = $('stageLabel');
const stageTitle = $('stageTitle');
const progressText = $('progressText');
const progressBar = $('progressBar');
const hintText = $('hintText');

let state = {};
let activePlayerSongId = null;
let playerWrap = null;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resetState() {
  state = {
    stage: 'first',
    queue: shuffle(SONGS),
    matchIndex: 0,
    winners: [],
    losers: [],
    revivalPick: null,
    finalSix: [],
    eliminatePick: null,
  };
  stopPlayer();
}

function start() {
  resetState();
  introView.classList.add('hidden');
  resultView.classList.add('hidden');
  gameView.classList.remove('hidden');
  renderFirstRound();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function playButton(song) {
  return `<button class="play-btn" type="button" data-play-song-id="${song.id}" aria-label="${song.artist} ${song.title} 재생">▶ 재생</button>`;
}

function songCard(song, side) {
  return `<div class="song-card-wrap">
    <button class="song-card" type="button" data-song-id="${song.id}" data-side="${side}">
      <span class="song-number">PICK ${String(state.matchIndex + 1).padStart(2, '0')}</span>
      <span class="song-title">${song.title}</span>
      <span class="song-artist">${song.artist}</span>
    </button>
    ${playButton(song)}
  </div>`;
}

function listCard(song, extra = '') {
  return `<div class="revival-card-wrap">
    <button class="revival-card" type="button" data-song-id="${song.id}">
      <strong>${song.title}</strong><span>${song.artist}${extra}</span>
    </button>
    ${playButton(song)}
  </div>`;
}

function attachPlayHandlers() {
  matchArea.querySelectorAll('[data-play-song-id]').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const song = SONGS.find(s => s.id === Number(btn.dataset.playSongId));
      if (song) toggleSong(song, btn);
    });
  });
}

function toggleSong(song, btn) {
  if (activePlayerSongId === song.id) {
    stopPlayer();
    refreshPlayButtons();
    return;
  }

  activePlayerSongId = song.id;
  if (!playerWrap) {
    playerWrap = document.createElement('div');
    playerWrap.className = 'mini-player';
    document.body.appendChild(playerWrap);
  }

  playerWrap.innerHTML = `
    <div class="mini-player-head">
      <div><strong>${song.title}</strong><span>${song.artist}</span></div>
      <button type="button" class="mini-player-close" aria-label="재생 닫기">×</button>
    </div>
    <div class="mini-player-frame">
      <iframe
        src="https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&index=${song.playlistIndex}&autoplay=1&playsinline=1"
        title="${song.artist} - ${song.title}"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>
    </div>`;

  playerWrap.classList.add('show');
  playerWrap.querySelector('.mini-player-close').addEventListener('click', () => {
    stopPlayer();
    refreshPlayButtons();
  });
  refreshPlayButtons();
}

function stopPlayer() {
  activePlayerSongId = null;
  if (playerWrap) {
    playerWrap.classList.remove('show');
    playerWrap.innerHTML = '';
  }
}

function refreshPlayButtons() {
  document.querySelectorAll('[data-play-song-id]').forEach(btn => {
    const playing = Number(btn.dataset.playSongId) === activePlayerSongId;
    btn.textContent = playing ? '■ 정지' : '▶ 재생';
    btn.classList.toggle('playing', playing);
  });
}

function renderFirstRound() {
  state.stage = 'first';
  stopPlayer();
  const a = state.queue[state.matchIndex * 2];
  const b = state.queue[state.matchIndex * 2 + 1];
  stageLabel.textContent = 'ROUND 01 · 생존전';
  stageTitle.textContent = '더 공연하고 싶은 곡은?';
  progressText.textContent = `${state.matchIndex + 1} / 5`;
  progressBar.style.width = `${((state.matchIndex + 1) / 5) * 100}%`;
  hintText.textContent = '▶ 재생으로 들어보고, 큰 카드를 눌러 선택하세요.';
  matchArea.className = 'match-area head-to-head';
  matchArea.innerHTML = `${songCard(a, 'a')}<div class="versus">VS</div>${songCard(b, 'b')}`;
  matchArea.querySelectorAll('.song-card').forEach(btn => btn.addEventListener('click', () => chooseFirst(Number(btn.dataset.songId))));
  attachPlayHandlers();
}

function chooseFirst(id) {
  stopPlayer();
  const pair = state.queue.slice(state.matchIndex * 2, state.matchIndex * 2 + 2);
  const winner = pair.find(s => s.id === id);
  const loser = pair.find(s => s.id !== id);
  state.winners.push(winner);
  state.losers.push(loser);
  state.matchIndex += 1;
  if (state.matchIndex < 5) renderFirstRound();
  else renderRevival();
}

function renderRevival() {
  state.stage = 'revival';
  stopPlayer();
  stageLabel.textContent = 'ROUND 02 · 패자부활전';
  stageTitle.textContent = '한 곡만 다시 살린다면?';
  progressText.textContent = '1곡 선택';
  progressBar.style.width = '70%';
  hintText.textContent = '재생해서 비교한 뒤, 탈락한 5곡 중 딱 한 곡을 부활시키세요.';
  matchArea.className = 'match-area';
  matchArea.innerHTML = `<div class="revival-grid">${state.losers.map(song => listCard(song)).join('')}</div>`;
  matchArea.querySelectorAll('.revival-card').forEach(btn => btn.addEventListener('click', () => chooseRevival(Number(btn.dataset.songId))));
  attachPlayHandlers();
}

function chooseRevival(id) {
  stopPlayer();
  state.revivalPick = state.losers.find(s => s.id === id);
  state.finalSix = shuffle([...state.winners, state.revivalPick]);
  renderElimination();
}

function renderElimination() {
  state.stage = 'elimination';
  stopPlayer();
  stageLabel.textContent = 'FINAL · 마지막 탈락전';
  stageTitle.textContent = '6곡 중 한 곡을 뺀다면?';
  progressText.textContent = '최종 5곡';
  progressBar.style.width = '92%';
  hintText.textContent = '재생해서 다시 확인한 뒤, 공연에서 뺄 한 곡을 선택하세요.';
  matchArea.className = 'match-area';
  matchArea.innerHTML = `<div class="revival-grid">${state.finalSix.map(song => listCard(song, song.id === state.revivalPick.id ? ' · 패자부활' : '')).join('')}</div>`;
  matchArea.querySelectorAll('.revival-card').forEach(btn => btn.addEventListener('click', () => confirmElimination(Number(btn.dataset.songId))));
  attachPlayHandlers();
}

function confirmElimination(id) {
  const song = state.finalSix.find(s => s.id === id);
  if (!window.confirm(`“${song.title}”을 최종 탈락시키고 나머지 5곡을 확정할까요?`)) return;
  stopPlayer();
  state.eliminatePick = song;
  showResults();
}

function showResults() {
  const finalFive = state.finalSix.filter(s => s.id !== state.eliminatePick.id);
  state.finalFive = finalFive;
  gameView.classList.add('hidden');
  resultView.classList.remove('hidden');
  $('resultList').innerHTML = finalFive.map((song, i) => `<li class="result-item"><span class="rank">${i + 1}</span><div><strong>${song.title}</strong><span>${song.artist}${song.id === state.revivalPick.id ? ' · 패자부활 생존' : ''}</span></div></li>`).join('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function shareResults() {
  const text = `🎸 공연곡 최종 5곡\n\n${state.finalFive.map((s, i) => `${i + 1}. ${s.artist} - ${s.title}`).join('\n')}`;
  try {
    await navigator.clipboard.writeText(text);
    toast('결과를 클립보드에 복사했어요.');
  } catch {
    window.prompt('결과를 복사하세요.', text);
  }
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

$('startBtn').addEventListener('click', start);
$('restartBtn').addEventListener('click', start);
$('shareBtn').addEventListener('click', shareResults);
$('resetBtn').addEventListener('click', () => {
  if (introView.classList.contains('hidden') && !window.confirm('현재 투표를 지우고 처음으로 돌아갈까요?')) return;
  resetState();
  gameView.classList.add('hidden');
  resultView.classList.add('hidden');
  introView.classList.remove('hidden');
});

resetState();
