
const questionBank = [
  {
    category: "PERSONALIDADE",
    question: "Como você prefere passar seu tempo livre?",
    options: [
      { text: "Jogando ou explorando tecnologia", emoji: "🎮", next: "tech" },
      { text: "Explorando lugares novos", emoji: "🧭", next: "adventure" },
      { text: "Descansando com amigos", emoji: "☕", next: "social" }
    ]
  },
  {
    category: "TECNOLOGIA",
    question: "Se pudesse criar algo hoje, o que seria?",
    options: [
      { text: "Um aplicativo revolucionário", emoji: "📱", next: "creative" },
      { text: "Um robô inteligente", emoji: "🤖", next: "science" },
      { text: "Um jogo incrível", emoji: "🕹️", next: "creative" }
    ]
  },
  {
    category: "AVENTURA",
    question: "Qual destino você escolheria agora?",
    options: [
      { text: "Uma praia paradisíaca", emoji: "🏝️", next: "nature" },
      { text: "Uma cidade futurista", emoji: "🌆", next: "tech" },
      { text: "Uma montanha misteriosa", emoji: "🏔️", next: "nature" }
    ]
  },
  {
    category: "SOCIAL",
    question: "Qual programa combina com seu grupo?",
    options: [
      { text: "Uma noite de jogos", emoji: "🎲", next: "creative" },
      { text: "Uma viagem em grupo", emoji: "🚐", next: "adventure" },
      { text: "Um jantar especial", emoji: "🍕", next: "social" }
    ]
  },
  {
    category: "CRIATIVIDADE",
    question: "Qual superpoder você escolheria?",
    options: [
      { text: "Criar qualquer coisa do zero", emoji: "✨", next: "creative" },
      { text: "Aprender tudo instantaneamente", emoji: "🧠", next: "science" },
      { text: "Viajar para qualquer lugar", emoji: "🚀", next: "adventure" }
    ]
  },
  {
    category: "CIÊNCIA",
    question: "Qual mistério você gostaria de desvendar?",
    options: [
      { text: "Os segredos do universo", emoji: "🌌", next: "science" },
      { text: "Como a mente humana funciona", emoji: "🧠", next: "social" },
      { text: "A tecnologia do futuro", emoji: "⚡", next: "tech" }
    ]
  },
  {
    category: "NATUREZA",
    question: "Qual experiência você viveria?",
    options: [
      { text: "Mergulhar em águas cristalinas", emoji: "🐠", next: "adventure" },
      { text: "Acampar sob as estrelas", emoji: "🏕️", next: "nature" },
      { text: "Fotografar animais selvagens", emoji: "📸", next: "creative" }
    ]
  },
  {
    category: "DESAFIO",
    question: "Como você resolveria um grande problema?",
    options: [
      { text: "Criaria um plano detalhado", emoji: "📝", next: "science" },
      { text: "Testaria ideias diferentes", emoji: "💡", next: "creative" },
      { text: "Chamaria pessoas para colaborar", emoji: "🤝", next: "social" }
    ]
  }
];

const destinations = {
  tech: {
    title: "Explorador de tecnologia",
    detail: "Seu caminho aponta para inovação, ferramentas digitais e novas ideias.",
    emoji: "💻"
  },
  adventure: {
    title: "Espírito aventureiro",
    detail: "Seu caminho valoriza descobertas, experiências e desafios.",
    emoji: "🧭"
  },
  social: {
    title: "Conector de pessoas",
    detail: "Seu caminho destaca conexões, colaboração e experiências compartilhadas.",
    emoji: "🤝"
  },
  creative: {
    title: "Mente criativa",
    detail: "Seu caminho combina imaginação, experimentação e criação.",
    emoji: "🎨"
  },
  science: {
    title: "Investigador de ideias",
    detail: "Seu caminho busca conhecimento, lógica e novas descobertas.",
    emoji: "🔬"
  },
  nature: {
    title: "Explorador da natureza",
    detail: "Seu caminho valoriza o mundo natural e novas experiências ao ar livre.",
    emoji: "🌿"
  }
};

const $ = (selector) => document.querySelector(selector);

const questionArea = $("#questionArea");
const answersElement = $("#answers");
const flowCanvas = $("#flowCanvas");
const progressBar = $("#progressBar");
const resultPanel = $("#resultPanel");

let questions = [];
let currentIndex = 0;
let history = [];
let currentQuestion = null;
let locked = false;

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function startApp() {
  questions = shuffle(questionBank).slice(0, 5);
  currentIndex = 0;
  history = [];
  currentQuestion = null;
  locked = false;

  resultPanel.hidden = true;
  questionArea.hidden = false;

  renderFlow();
  renderQuestion();
  updateStats();
}

function renderQuestion() {
  locked = false;

  if (currentIndex >= questions.length) {
    finishJourney();
    return;
  }

  currentQuestion = questions[currentIndex];

  $("#stepLabel").textContent =
    `PERGUNTA ${String(currentIndex + 1).padStart(2, "0")}`;

  const progress = Math.round(
    (currentIndex / questions.length) * 100
  );

  $("#progressLabel").textContent = `${progress}% concluído`;
  progressBar.style.width = `${progress}%`;

  questionArea.querySelector(".category-tag").textContent =
    currentQuestion.category;

  questionArea.querySelector("h3").textContent =
    currentQuestion.question;

  answersElement.replaceChildren();

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";

    button.innerHTML = `
      <span class="answer-emoji">${escapeHTML(option.emoji)}</span>
      <span class="answer-text">${escapeHTML(option.text)}</span>
      <span class="answer-arrow">↗</span>
    `;

    button.setAttribute("aria-label", option.text);

    button.addEventListener("click", () => {
      chooseAnswer(option, index);
    });

    answersElement.appendChild(button);
  });
}

function chooseAnswer(option, optionIndex) {
  if (locked || !currentQuestion) return;

  locked = true;

  answersElement.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });

  history.push({
    question: currentQuestion.question,
    category: currentQuestion.category,
    answer: option.text,
    emoji: option.emoji,
    optionIndex,
    destination: option.next
  });

  currentIndex++;

  renderFlow();
  updateStats();

  window.setTimeout(() => {
    renderQuestion();
  }, 250);
}

function renderFlow() {
  flowCanvas.replaceChildren();

  const start = document.createElement("div");
  start.className = "flow-node start";
  start.innerHTML = `
    <span class="node-type">✦ INÍCIO</span>
    <span class="node-title">Minha jornada começa aqui</span>
  `;

  flowCanvas.appendChild(start);

  history.forEach((item, index) => {
    const connector = document.createElement("div");
    connector.className = "flow-connector";

    const label = document.createElement("span");
    label.className = "connector-label";
    label.textContent = `${item.emoji} ${item.answer}`;

    connector.appendChild(label);
    flowCanvas.appendChild(connector);

    const node = document.createElement("div");
    node.className = "flow-node decision";

    if (index === history.length - 1) {
      node.classList.add("selected");
    }

    node.innerHTML = `
      <span class="node-type">DECISÃO ${String(index + 1).padStart(2, "0")}</span>
      <span class="node-title">${escapeHTML(item.question)}</span>
      <span class="choice">↳ ${escapeHTML(item.answer)}</span>
    `;

    flowCanvas.appendChild(node);
  });

  if (currentIndex >= questions.length) {
    const last = history[history.length - 1];

    if (last) {
      const connector = document.createElement("div");
      connector.className = "flow-connector";

      const label = document.createElement("span");
      label.className = "connector-label";
      label.textContent = "✦ Destino revelado";

      connector.appendChild(label);
      flowCanvas.appendChild(connector);

      const destination = destinations[last.destination];

      const result = document.createElement("div");
      result.className = "flow-node result";
      result.innerHTML = `
        <span class="node-type">✓ RESULTADO FINAL</span>
        <span class="node-title">${escapeHTML(destination.emoji)} ${escapeHTML(destination.title)}</span>
      `;

      flowCanvas.appendChild(result);
    }
  }

  $("#nodeCount").textContent =
    `${1 + history.length + (currentIndex >= questions.length ? 1 : 0)} NÓS`;

  flowCanvas.scrollTop = flowCanvas.scrollHeight;
}

function updateStats() {
  $("#statNodes").textContent =
    1 + history.length + (currentIndex >= questions.length ? 1 : 0);

  $("#statAnswers").textContent = history.length;

  const progress = Math.round(
    (currentIndex / questions.length) * 100
  );

  $("#statProgress").textContent = `${progress}%`;
  $("#progressLabel").textContent = `${progress}% concluído`;
  progressBar.style.width = `${progress}%`;
}

function finishJourney() {
  questionArea.hidden = true;
  resultPanel.hidden = false;

  const last = history[history.length - 1];
  const destination = last
    ? destinations[last.destination]
    : null;

  $("#resultText").textContent = destination
    ? `${destination.emoji} ${destination.detail} Você respondeu ${history.length} perguntas e construiu seu próprio caminho.`
    : "Sua jornada foi concluída.";

  $("#stepLabel").textContent = "JORNADA CONCLUÍDA";
  $("#progressLabel").textContent = "100% concluído";
  progressBar.style.width = "100%";

  updateStats();
  renderFlow();

  resultPanel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

$("#resetBtn").addEventListener("click", startApp);
$("#againBtn").addEventListener("click", () => {
  startApp();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

startApp();
