const niveis = [
  {
    nome: "🎹 Fácil",
    classe: "facil",
    titulo: "Ideal para começar!",
    descricao: "Você vai ouvir acordes Maiores (C) e Menores (Cm) — os dois pilares da harmonia.\nComece a treinar seu ouvido com diferenças simples, mas fundamentais."
  },
  {
    nome: "🎶 Médio",
    classe: "medio",
    titulo: "Leve o treino para o próximo passo",
    descricao: "Com os acordes Menores e Maiores com Sétima, trazendo novos sons cheios de cor à sua percepção."
  },
  {
    nome: "🧠 Difícil",
    classe: "dificil",
    titulo: "Explore novos horizontes sonoros",
    descricao: "Com os acordes Menores com Sexta, jogando novas cores à sua jornada musical."
  },
  {
    nome: "🚀 Avançado",
    classe: "avancado",
    titulo: "Domine acordes maiores, menores e diminutos em várias inversões,",
    descricao: "Aperfeiçoando vastamente sua capacidade auditiva."
  }
];

let index = 0;

function trocarNivel(direcao) {
  index = (index + direcao + niveis.length) % niveis.length;
  const nivel = niveis[index];
  document.getElementById('nivel-badge').textContent = nivel.nome;
  document.getElementById('nivel-titulo').textContent = nivel.titulo;
  document.getElementById('nivel-descricao').textContent = nivel.descricao;

  const badge = document.getElementById('nivel-badge');
  const btn = document.getElementById('btn-iniciar');
  badge.className = 'tag-nivel ' + nivel.classe;
  btn.className = 'btn-iniciar ' + nivel.classe;
}
