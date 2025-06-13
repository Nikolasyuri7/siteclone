const chords = [
  { name: 'Maior', intervals: [0, 4, 7] },
  { name: 'Menor', intervals: [0, 3, 7] }
];

const levels = {
  facil: [261.63],
  medio: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88],
  dificil: Array.from({ length: 12 }, (_, i) => 261.63 * Math.pow(2, i / 12)),
  avancado: Array.from({ length: 12 }, (_, i) => 261.63 * Math.pow(2, i / 12))
};

const levelData = [
  {
    key: 'facil',
    class: 'easy',
    label: 'Fácil',
    description:
      'Ideal para começar!<br>Você vai ouvir acordes Maiores (C) e Menores (Cm) — os dois pilares da harmonia.<br>Comece a treinar seu ouvido com diferenças simples, mas fundamentais.'
  },
  {
    key: 'medio',
    class: 'medium',
    label: 'Médio',
    description:
      'Hora de expandir seu ouvido!<br>Além dos acordes Maiores e Menores, você vai ouvir também os Diminutos (C°) e Aumentados (C+).<br>Eles têm sonoridades bem marcantes e interessantes — um passo além, sem perder a diversão.'
  },
  {
    key: 'dificil',
    class: 'hard',
    label: 'Difícil',
    description:
      'Aqui as coisas ficam mais sofisticadas!<br>Você terá todos os acordes anteriores, e também acordes com sétima maior (C7M) e sétima menor (C7).<br>Desafio ideal pra quem já tem uma boa noção de acordes e quer afiar ainda mais o ouvido.'
  },
  {
    key: 'avancado',
    class: 'advanced',
    label: 'Avançado',
    description:
      'Desbloqueie seu ouvido completo!<br>Neste nível, entram acordes menores com sétima maior (Cm7M) e menores com sétima menor (Cm7), além de todos os anteriores.<br>Um verdadeiro laboratório auditivo — para quem quer dominar as cores e nuances dos acordes!'
  }
];

let currentLevel = 'facil';
let currentLevelIndex = 0;

const totalQuestions = 10;
let currentQuestion = 0;
let score = 0;
let currentChord = chords[0];
let startTime;
let timerInterval;

let context;
let progressEl, levelButton, levelDesc, startButton;
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


function renderLevel() {
  const info = levelData[currentLevelIndex];
  levelButton.dataset.level = info.key;
  levelButton.dataset.color = info.class;
  levelButton.textContent = info.label;
  levelButton.className = `wp-element-button level-btn ${info.class}`;
  levelDesc.innerHTML = info.description;
}


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

document.addEventListener('DOMContentLoaded', () => {
  progressEl = document.getElementById('timer-progress');
  levelButton = document.querySelector('#level-display .level-btn');
  levelDesc = document.querySelector('#level-display .level-description');
  startButton = document.getElementById('start-game');
  renderLevel();

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
    currentLevelIndex = 0;
    levelButton.classList.remove('selected');
    startButton.style.display = 'none';
    startButton.className = 'wp-element-button';
    renderLevel();
  });

  startButton.addEventListener('click', () => {
    getContext(); // unlock audio on mobile devices
    startGame();
  });

  document.getElementById('prev-level').addEventListener('click', () => {
    currentLevelIndex = (currentLevelIndex - 1 + levelData.length) % levelData.length;
    levelButton.classList.remove('selected');
    startButton.style.display = 'none';
    startButton.className = 'wp-element-button';
    renderLevel();
  });

  document.getElementById('next-level').addEventListener('click', () => {
    currentLevelIndex = (currentLevelIndex + 1) % levelData.length;
    levelButton.classList.remove('selected');
    startButton.style.display = 'none';
    startButton.className = 'wp-element-button';
    renderLevel();
  });

  levelButton.addEventListener('click', () => {
    currentLevel = levelButton.dataset.level;
    levelButton.classList.add('selected');
    startButton.className = `wp-element-button ${levelButton.dataset.color}`;
    startButton.style.display = 'block';
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
    startButton.style.display = 'none';
    startButton.className = 'wp-element-button';
    levelButton.classList.remove('selected');
    currentLevelIndex = 0;
    renderLevel();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      document.getElementById('next-level').click();
    } else if (e.key === 'ArrowLeft') {
      document.getElementById('prev-level').click();
    }
  });
});
