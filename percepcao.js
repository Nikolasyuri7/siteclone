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

const niveis = [
  {
    key: 'facil',
    nome: '🎹 Fácil',
    classe: 'facil',
    titulo: 'Ideal para começar!',
    descricao: 'Você vai ouvir acordes Maiores (C) e Menores (Cm) — os dois pilares da harmonia.\nComece a treinar seu ouvido com diferenças simples, mas fundamentais.'
  },
  {
    key: 'medio',
    nome: '🎶 Médio',
    classe: 'medio',
    titulo: 'Leve o treino para o próximo passo',
    descricao: 'Com os acordes Menores e Maiores com Sétima, trazendo novos sons cheios de cor à sua percepção.'
  },
  {
    key: 'dificil',
    nome: '🧠 Difícil',
    classe: 'dificil',
    titulo: 'Explore novos horizontes sonoros',
    descricao: 'Com os acordes Menores com Sexta, jogando novas cores à sua jornada musical.'
  },
  {
    key: 'avancado',
    nome: '🚀 Avançado',
    classe: 'avancado',
    titulo: 'Domine acordes maiores, menores e diminutos em várias inversões,',
    descricao: 'Aperfeiçoando vastamente sua capacidade auditiva.'
  }
];

let currentLevelIndex = 0;
let currentLevel = niveis[currentLevelIndex].key;

const totalQuestions = 10;
let currentQuestion = 0;
let score = 0;
let currentChord = chords[0];
let startTime;
let timerInterval;
let context;
let progressEl;
let nivelContainerEl;
let nivelHeadingEl;

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
  const nivel = niveis[currentLevelIndex];
  document.getElementById('nivel-badge').textContent = nivel.nome;
  document.getElementById('nivel-titulo').textContent = nivel.titulo;
  document.getElementById('nivel-descricao').textContent = nivel.descricao;
  const badge = document.getElementById('nivel-badge');
  const btn = document.getElementById('btn-iniciar');
  badge.className = 'tag-nivel ' + nivel.classe;
  btn.className = 'btn-iniciar ' + nivel.classe;
  currentLevel = nivel.key;
}

function trocarNivel(direcao) {
  currentLevelIndex = (currentLevelIndex + direcao + niveis.length) % niveis.length;
  renderLevel();
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const progress = (seconds / 60) * 100;
    progressEl.style.width = progress + '%';
    const timerText = document.getElementById('timer-text');
    if (minutes > 0) {
      timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timerText.textContent = `0:${seconds.toString().padStart(2, '0')}`;
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
  document.getElementById('question').textContent = `${currentQuestion + 1} / ${totalQuestions}`;
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
  nivelContainerEl = document.querySelector('.nivel-container');
  nivelHeadingEl = document.querySelector('h2');
  const mostrarNiveisBtn = document.getElementById('mostrar-niveis');
  renderLevel();

  // Exibe apenas as instruções inicialmente
  if (nivelContainerEl && nivelHeadingEl && mostrarNiveisBtn) {
    nivelContainerEl.style.display = 'none';
    nivelHeadingEl.style.display = 'none';
    mostrarNiveisBtn.addEventListener('click', () => {
      nivelContainerEl.style.display = 'flex';
      nivelHeadingEl.style.display = 'block';
      mostrarNiveisBtn.style.display = 'none';
    });
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

  document.getElementById('btn-iniciar').addEventListener('click', () => {
    getContext();
    startGame();
  });

  document.getElementById('prev-level').addEventListener('click', () => {
    trocarNivel(-1);
  });

  document.getElementById('next-level').addEventListener('click', () => {
    trocarNivel(1);
  });

  document.getElementById('retry-game').addEventListener('click', () => {
    startGame();
  });

  document.getElementById('change-level').addEventListener('click', () => {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('intro').style.display = 'block';
    document.getElementById('end-buttons').style.display = 'none';
    if (nivelContainerEl && nivelHeadingEl) {
      nivelContainerEl.style.display = 'flex';
      nivelHeadingEl.style.display = 'block';
      const btnMostrar = document.getElementById('mostrar-niveis');
      if (btnMostrar) btnMostrar.style.display = 'none';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      trocarNivel(1);
    } else if (e.key === 'ArrowLeft') {
      trocarNivel(-1);
    }
  });
});
