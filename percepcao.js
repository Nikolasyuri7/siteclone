const chords = [
  { name: 'Maior', intervals: [0, 4, 7] },
  { name: 'Menor', intervals: [0, 3, 7] },
  { name: 'Diminuto', intervals: [0, 3, 6] }
];

const totalQuestions = 5;
let currentQuestion = 0;
let score = 0;
let currentChord = chords[0];

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const context = new AudioCtx();

function playChord(intervals, root = 261.63) {
  if (context.state === 'suspended') {
    context.resume();
  }
  const now = context.currentTime;
  intervals.forEach(i => {
    const osc = context.createOscillator();
    osc.frequency.value = root * Math.pow(2, i / 12);
    osc.connect(context.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  });
}

function nextQuestion() {
  if (currentQuestion >= totalQuestions) {
    document.getElementById('question').textContent = `Fim de jogo! Você acertou ${score} de ${totalQuestions}.`;
    document.getElementById('options').style.display = 'none';
    document.getElementById('play-sound').style.display = 'none';
    return;
  }
  document.getElementById('feedback').textContent = '';
  currentChord = chords[Math.floor(Math.random() * chords.length)];
  document.getElementById('question').textContent = `Questão ${currentQuestion + 1} de ${totalQuestions}`;
}

document.getElementById('play-sound').addEventListener('click', () => {
  playChord(currentChord.intervals);
});

document.querySelectorAll('#options button').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.type === currentChord.name) {
      score++;
      document.getElementById('feedback').textContent = 'Correto!';
    } else {
      document.getElementById('feedback').textContent = `Errado! Era ${currentChord.name}.`;
    }
    currentQuestion++;
    setTimeout(nextQuestion, 1000);
  });
});

window.addEventListener('load', nextQuestion);
