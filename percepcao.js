const chords = [
  { name: 'Maior', intervals: [0, 4, 7] },
  { name: 'Menor', intervals: [0, 3, 7] }
];

const levels = {
  facil: [261.63],
  medio: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88],
  dificil: Array.from({ length: 12 }, (_, i) => 261.63 * Math.pow(2, i / 12))
};

let currentLevel = 'facil';

const totalQuestions = 10;
let currentQuestion = 0;
let score = 0;
let currentChord = chords[0];
let startTime;
let timerInterval;

let context;
function getContext() {
  if (!context) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    context = new AudioCtx();
  }
  if (context.state === 'suspended') {
    context.resume();
  }
  return context;
}

const progressEl = document.getElementById('timer-progress');

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const progress = (seconds / 60) * 100;

    progressEl.style.width = progress + '%';

    if (minutes > 0) {
      const minLabel = minutes > 1 ? 'minutos' : 'minuto';
      document.getElementById('timer').textContent =
        `Tempo: ${minutes}:${seconds.toString().padStart(2, '0')} ${minLabel}`;
    } else {
      document.getElementById('timer').textContent = `Tempo: ${seconds}s`;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  return Math.floor((Date.now() - startTime) / 1000);
}

function playChord(intervals, root = 261.63) {
  const ctx = getContext();
  const now = ctx.currentTime;
  intervals.forEach(i => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = root * Math.pow(2, i / 12);
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  });
}

function nextQuestion() {
  if (currentQuestion >= totalQuestions) {
    finishGame();
    return;
  }
  document.getElementById('feedback').textContent = '';
  currentChord = chords[Math.floor(Math.random() * chords.length)];
  document.getElementById('question').textContent = `Questão ${currentQuestion + 1} de ${totalQuestions}`;
  const roots = levels[currentLevel] || levels.facil;
  const root = roots[Math.floor(Math.random() * roots.length)];
  playChord(currentChord.intervals, root);
}

function finishGame() {
  const totalTime = stopTimer();
  const percentage = Math.round((score / totalQuestions) * 100);
  document.getElementById('question').textContent = 'Fim de jogo!';
  const resultEl = document.getElementById('result');
  resultEl.textContent = `Você acertou ${score} de ${totalQuestions} (${percentage}%) em ${totalTime}s.`;
  resultEl.style.color = percentage >= 60 ? 'green' : 'red';
  const advice = document.createElement('p');
  if (percentage < 80) {
    advice.textContent = 'Recomendo treinar mais nesse nível antes de avançar.';
  } else {
    advice.textContent = 'Parabéns! Que tal subir de nível e tentar outro desafio?';
  }
  resultEl.insertAdjacentElement('afterend', advice);
  document.getElementById('options').style.display = 'none';
  document.getElementById('play-sound').style.display = 'none';
  document.getElementById('end-buttons').style.display = 'block';
}

function startGame() {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('game-area').style.display = 'block';
  document.getElementById('end-buttons').style.display = 'none';
  const resultEl = document.getElementById('result');
  if (resultEl.nextElementSibling) {
    resultEl.nextElementSibling.remove();
  }
  resultEl.textContent = '';
  document.getElementById('options').style.display = 'block';
  document.getElementById('play-sound').style.display = 'block';
  currentQuestion = 0;
  score = 0;
  startTimer();
  nextQuestion();
}

document.getElementById('play-sound').addEventListener('click', () => {
  playChord(currentChord.intervals);
});

document.querySelectorAll('#options button').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.type === currentChord.name) {
      score++;
      document.getElementById('feedback').textContent = `Correto! O acorde era ${currentChord.name}.`;
    } else {
      document.getElementById('feedback').textContent = `Errado! O acorde era ${currentChord.name}.`;
    }
    currentQuestion++;
    nextQuestion();
  });
});

document.getElementById('select-difficulty').addEventListener('click', () => {
  document.getElementById('level-select').style.display = 'block';
  document.getElementById('select-difficulty').style.display = 'none';
});

document.getElementById('start-game').addEventListener('click', () => {
  getContext(); // unlock audio on mobile devices
  startGame();
});

document.querySelectorAll('#level-select .level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLevel = btn.dataset.level;
    document.querySelectorAll('#level-select .level-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('start-game').style.display = 'block';
  });
});

document.getElementById('retry-game').addEventListener('click', () => {
  startGame();
});

document.getElementById('change-level').addEventListener('click', () => {
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('intro').style.display = 'block';
  document.getElementById('end-buttons').style.display = 'none';
  document.getElementById('select-difficulty').style.display = 'block';
  document.getElementById('level-select').style.display = 'none';
  document.getElementById('start-game').style.display = 'none';
  document.querySelectorAll('#level-select .level-btn').forEach(b => b.classList.remove('selected'));
});
