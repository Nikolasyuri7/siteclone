const chords = [
  { name: 'Maior', intervals: [0, 4, 7] },
  { name: 'Menor', intervals: [0, 3, 7] }
];

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
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `Tempo: ${seconds}s`;
    const progress = Math.min(seconds, 60) / 60 * 100;
    progressEl.style.width = progress + '%';
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
    osc.frequency.value = root * Math.pow(2, i / 12);
    osc.connect(ctx.destination);
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
}

function finishGame() {
  const totalTime = stopTimer();
  const percentage = Math.round((score / totalQuestions) * 100);
  document.getElementById('question').textContent = 'Fim de jogo!';
  const resultEl = document.getElementById('result');
  resultEl.textContent = `Você acertou ${score} de ${totalQuestions} (${percentage}%) em ${totalTime}s.`;
  resultEl.style.color = percentage >= 60 ? 'green' : 'red';
  document.getElementById('options').style.display = 'none';
  document.getElementById('play-sound').style.display = 'none';
}

function startGame() {
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
    setTimeout(nextQuestion, 1000);
  });
});

window.addEventListener('load', startGame);
