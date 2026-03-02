const nameScreen = document.getElementById("nameScreen");
const moodScreen = document.getElementById("moodScreen");
const optionsScreen = document.getElementById("optionsScreen");

const greeting = document.getElementById("greeting");

const moodColors = {
  Low: "#ffd6d6",
  Neutral: "#d6ffd6",
  Good: "#d6e6ff",
  Great: "#ffe6f2"
};

let currentMood = "";

// Load saved name
window.onload = function() {
  const savedName = localStorage.getItem("username");
  if (savedName) startApp(savedName);
};

function saveName() {
  const name = document.getElementById("nameInput").value;
  if (!name) return;
  localStorage.setItem("username", name);
  startApp(name);
}

function startApp(name) {
  nameScreen.classList.add("hidden");
  moodScreen.classList.remove("hidden");
  greeting.innerText = "Hi " + name + ", how are you today?";
}

function chooseMood(mood) {
  currentMood = mood;
  saveMood(mood);

  document.body.style.backgroundColor = moodColors[mood];
  moodScreen.classList.add("hidden");
  optionsScreen.classList.remove("hidden");

  if (mood === "Great") spawnBlossoms();
}

function spawnBlossoms() {
  for (let i = 0; i < 20; i++) {
    const blossom = document.createElement("div");
    blossom.innerText = "🌸";
    blossom.style.position = "fixed";
    blossom.style.left = Math.random() * 100 + "vw";
    blossom.style.top = "-20px";
    blossom.style.fontSize = "24px";
    blossom.style.animation = "fall 4s linear forwards";
    document.body.appendChild(blossom);
    setTimeout(() => blossom.remove(), 4000);
  }
}

function showSection(id) {
  optionsScreen.classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");

  if (id === "quote") showQuote();
  if (id === "game") startGame();
  if (id === "mathGame") startMathGame();
}

function back() {
  document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
  optionsScreen.classList.remove("hidden");
}

// -------- SAVE MOOD --------
function saveMood(mood) {
  const name = localStorage.getItem("username");
  const today = new Date().toISOString().split("T")[0];

  let history = JSON.parse(localStorage.getItem(name + "_history")) || [];
  history.push({ date: today, mood: mood });

  localStorage.setItem(name + "_history", JSON.stringify(history));
}

// -------- ANALYTICS --------
function showAnalytics() {
  optionsScreen.classList.add("hidden");
  document.getElementById("analytics").classList.remove("hidden");

  const name = localStorage.getItem("username");
  let history = JSON.parse(localStorage.getItem(name + "_history")) || [];

  if (history.length === 0) {
    document.getElementById("stats").innerText = "No mood data yet.";
    return;
  }

  let total = history.length;

  let moodCount = {};
  history.forEach(entry => {
    moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
  });

  let mostCommon = Object.keys(moodCount).reduce((a, b) =>
    moodCount[a] > moodCount[b] ? a : b
  );

  document.getElementById("stats").innerHTML =
    "Total Entries: " + total + "<br>" +
    "Most Common Mood: " + mostCommon;
}

// -------- STAR GAME --------
let score = 0;
let gameTimer;
const star = document.getElementById("star");
const scoreEl = document.getElementById("score");

function startGame() {
  score = 0;
  scoreEl.innerText = score;
  moveStar();

  
}

function moveStar() {
  star.style.left = Math.random() * 80 + "%";
  star.style.top = Math.random() * 60 + "%";
}

star.onclick = function() {
  score++;
  scoreEl.innerText = score;
  moveStar();
};

// -------- MATH GAME --------
let mathScore = 0;

function startMathGame() {
  mathScore = 0;
  document.getElementById("mathScore").innerText = mathScore;

  

  generateQuestion();
}

function generateQuestion() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const correct = a * b;

  document.getElementById("question").innerText = `${a} × ${b} = ?`;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  const options = [correct];
  while (options.length < 3) {
    let wrong = correct + Math.floor(Math.random() * 10) - 5;
    if (!options.includes(wrong)) options.push(wrong);
  }

  options.sort(() => Math.random() - 0.5);

  options.forEach(num => {
    const btn = document.createElement("button");
    btn.innerText = num;
    btn.className = "movingBtn";
    btn.style.left = Math.random() * 80 + "%";
    btn.style.top = Math.random() * 80 + "%";

    btn.onclick = function() {
      if (num === correct) {
        mathScore++;
        document.getElementById("mathScore").innerText = mathScore;
      }
      generateQuestion();
    };

    answersDiv.appendChild(btn);
  });
}

// -------- QUOTE --------
function showQuote() {
  const quotes = [
  "Every day may not be good, but there's something good in every day.",
  "You are stronger than you think.",
  "Believe you can and you're halfway there.",
  "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
  "In the middle of every difficulty lies opportunity.",
  "The best way to predict the future is to create it.",
  "You are never too old to set another goal or to dream a new dream.",
  "The only limit to our realization of tomorrow will be our doubts of today."
];

  document.getElementById("quoteText").innerText =
    quotes[Math.floor(Math.random() * quotes.length)];

  document.body.style.backgroundColor = moodColors[currentMood];
}

// -------- BREATHING 5-3-5 --------
function startBreathing() {
  const text = document.getElementById("breathText");
  const circle = document.getElementById("circle");

  let cycles = 0;

  function inhale() {
    if (cycles >= 4) {
      text.innerText = "Session Complete 🌿";
      return;
    }

    text.innerText = "Inhale (5s)";
    circle.style.transform = "scale(1.6)";
    setTimeout(hold, 5000);
  }

  function hold() {
    text.innerText = "Hold (3s)";
    setTimeout(exhale, 3000);
  }

  function exhale() {
    text.innerText = "Exhale (5s)";
    circle.style.transform = "scale(1)";
    cycles++;
    setTimeout(inhale, 5000);
  }

  inhale();
}