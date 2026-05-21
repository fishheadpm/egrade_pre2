let data = [];
let currentRound = null;
let queue = [];
let index = 0;
let history = {};

fetch('data.json?v=' + Date.now())
  .then(res => res.json())
  .then(json => {
    data = json;
    init();
  })
  .catch(error => {
    alert('data.jsonの読み込みに失敗しました');
    console.error(error);
  });

function init() {
  const area = document.getElementById('seriesButtons');
  area.innerHTML = '';
  data.forEach(round => {
    const btn = document.createElement('button');
    btn.textContent = round.name;
    btn.onclick = () => selectRound(round);
    area.appendChild(btn);
  });
}

function selectRound(round) {
  currentRound = round;
  document.getElementById('roundTitle').textContent = round.name;
  show('menuScreen');
}

function start() {
  queue = shuffle(currentRound.questions.map(q => q.id));
  index = 0;
  history = JSON.parse(localStorage.getItem(histKey())) || {};
  save();
  next();
}

function continueGame() {
  load();
  if (!queue || queue.length === 0) {
    start();
    return;
  }
  next();
}

function next() {
  if (index >= queue.length) {
    alert('終了');
    show('menuScreen');
    return;
  }
  const q = getQ();
  if (!q) {
    alert('問題データが見つかりません。履歴をリセットして最初から開始してください。');
    show('menuScreen');
    return;
  }
  document.getElementById('progress').textContent = `${index + 1} / ${queue.length}`;
  document.getElementById('question').textContent = formatQuestion(q);
  document.getElementById('answer').textContent = '';
  document.getElementById('answerArea').classList.add('hidden');
  show('quizScreen');
}

function showAnswer() {
  const q = getQ();
  document.getElementById('answer').textContent = q.answer;
  document.getElementById('answerArea').classList.remove('hidden');
}

function correct() {
  index++;
  save();
  next();
}

function wrong() {
  const id = getQ().id;
  history[id] = (history[id] || 0) + 1;
  queue.push(id);
  index++;
  save();
  next();
}

function getQ() {
  return currentRound.questions.find(q => q.id === queue[index]);
}

function save() {
  localStorage.setItem(progressKey(), JSON.stringify({ queue, index }));
  localStorage.setItem(histKey(), JSON.stringify(history));
}

function load() {
  const p = JSON.parse(localStorage.getItem(progressKey()));
  history = JSON.parse(localStorage.getItem(histKey())) || {};
  if (p) {
    queue = p.queue;
    index = p.index;
  } else {
    queue = [];
    index = 0;
  }
}

function reset() {
  localStorage.removeItem(progressKey());
  localStorage.removeItem(histKey());
  alert('リセットしました');
}

function showHistory() {
  history = JSON.parse(localStorage.getItem(histKey())) || {};
  let text = '';
  for (let id in history) {
    const q = currentRound.questions.find(q => q.id === id);
    if (q) {
      text += `${q.answer} : ${history[id]}回\n${formatQuestion(q)}\n\n`;
    }
  }
  alert(text || '履歴なし');
}

function formatQuestion(q) {
  if (q.japanese) {
    return `${q.question}\n\n${q.japanese}`;
  }
  return q.question;
}

function progressKey() {
  return `eiken_pre2_progress_${currentRound.id}_self`;
}

function histKey() {
  return `eiken_pre2_history_${currentRound.id}`;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function show(id) {
  ['seriesScreen', 'menuScreen', 'quizScreen'].forEach(screenId => {
    document.getElementById(screenId).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function back() { show('seriesScreen'); }
function backToMenu() { show('menuScreen'); }
