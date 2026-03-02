// Helpers
const $ = (id) => document.getElementById(id);

function show(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("show"));
  $(id).classList.add("show");
}

function nowStamp(){
  const d = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  return { iso: d.toISOString(), time, date };
}

function setGameMode(on){
  document.body.classList.toggle("game-mode", on);
}

// Mood setup
const MOODS = [
  { key:"Low",     emoji:"😞", accent:"#fb7185", bgTop:"#070A13", bgMid:"#120A1A", bgBot:"#1B0B17", label:"Sad" },
  { key:"Neutral", emoji:"😐", accent:"#34d399", bgTop:"#070A13", bgMid:"#081A16", bgBot:"#052016", label:"Okay" },
  { key:"Good",    emoji:"🙂", accent:"#60a5fa", bgTop:"#070A13", bgMid:"#0B1022", bgBot:"#0F1733", label:"Good" },
  { key:"Great",   emoji:"😄", accent:"#f472b6", bgTop:"#070A13", bgMid:"#1A0B1B", bgBot:"#2A0B20", label:"Happy" }
];

let username = localStorage.getItem("mc_name") || "";
let currentMood = null;

// Global background FX
let bgTimer = null;
let bgFxOn = true;

function startGlobalFX(){
  stopGlobalFX();
  if (!bgFxOn) return;

  const layer = $("bgFX");
  const glyphs = ["✨","💖","💜","⭐","🌟","🎈","💙","💛","🫧"];

  bgTimer = setInterval(() => {
    const el = document.createElement("div");
    el.className = "bgFloat";
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

    const left = Math.random() * 100;
    const drift = (Math.random() * 220 - 110).toFixed(0) + "px";
    const spin = (Math.random() * 240 - 120).toFixed(0) + "deg";
    const dur = (5.6 + Math.random() * 6.0).toFixed(2) + "s";
    const size = (14 + Math.random() * 30).toFixed(0) + "px";
    const op = (0.20 + Math.random() * 0.55).toFixed(2);

    el.style.left = left + "vw";
    el.style.setProperty("--drift", drift);
    el.style.setProperty("--spin", spin);
    el.style.animationDuration = dur;
    el.style.fontSize = size;
    el.style.opacity = op;

    layer.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  }, 140);
}

function stopGlobalFX(){
  if (bgTimer) clearInterval(bgTimer);
  bgTimer = null;
  $("bgFX").innerHTML = "";
}

// Records
function loadRecords(){ return JSON.parse(localStorage.getItem("mc_records") || "[]"); }
function saveRecords(records){ localStorage.setItem("mc_records", JSON.stringify(records)); }
function addRecord(moodKey, emoji){
  const r = loadRecords();
  const t = nowStamp();
  r.unshift({ mood: moodKey, emoji, time: t.time, date: t.date, iso: t.iso });
  saveRecords(r);
}

// Theme
function setTheme(mood){
  document.documentElement.style.setProperty("--accent", mood.accent);
  document.documentElement.style.setProperty("--bgTop", mood.bgTop);
  document.documentElement.style.setProperty("--bgMid", mood.bgMid);
  document.documentElement.style.setProperty("--bgBot", mood.bgBot);

  document.body.style.background =
    `radial-gradient(1100px 700px at 20% 10%, ${hexToRgba(mood.accent, 0.18)}, transparent 60%),
     radial-gradient(900px 600px at 80% 90%, ${hexToRgba(mood.accent, 0.12)}, transparent 60%),
     linear-gradient(180deg, ${mood.bgTop}, ${mood.bgMid}, ${mood.bgBot})`;
}

function hexToRgba(hex, a){
  const h = hex.replace("#","");
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

// Build mood grid
function renderMoodGrid(){
  const grid = $("moodGrid");
  grid.innerHTML = "";
  MOODS.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "moodEmojiBtn";
    btn.innerHTML = `<div class="moodEmoji">${m.emoji}</div>`;
    btn.onclick = () => selectMood(m.key);
    grid.appendChild(btn);
  });
}

// Flow
function goWelcome(){
  $("welcomeTitle").textContent = `Welcome, ${username}!`;
  show("screenWelcome");
}
function goMoods(){
  $("greetingBadge").textContent = `Hi ${username} 👋`;
  show("screenMood");
}
function selectMood(key){
  currentMood = MOODS.find(m => m.key === key);
  if (!currentMood) return;

  setTheme(currentMood);
  addRecord(currentMood.key, currentMood.emoji);

  $("takeoverHero").textContent = currentMood.emoji;
  $("takeoverBadge").textContent = `Mood saved at ${nowStamp().time} ✅`;
  $("takeoverTitle").textContent =
    currentMood.key === "Low" ? "I’m here. Let’s make it lighter." :
    currentMood.key === "Neutral" ? "Steady. That’s a valid vibe." :
    currentMood.key === "Good" ? "Nice. Let’s keep that energy." :
    "YES. Main character energy.";

  $("optionsMoodBadge").textContent = `Mood: ${currentMood.emoji} (${currentMood.label})`;

  $("aliveEmoji").textContent =
    currentMood.key === "Low" ? "🫶" :
    currentMood.key === "Neutral" ? "🐾" :
    currentMood.key === "Good" ? "😺" : "🎊";

  $("aliveBubble").textContent =
    currentMood.key === "Low" ? "Pick something gentle 💛" :
    currentMood.key === "Neutral" ? "Pick anything 🙂" :
    currentMood.key === "Good" ? "Let’s play! ⭐" :
    "Let’s celebrate ✨";

  show("screenTakeover");
}
function goOptions(){ show("screenOptions"); }

// Records
function renderRecords(){
  const list = $("recordsList");
  const recs = loadRecords();
  list.innerHTML = "";

  if (recs.length === 0){
    list.innerHTML = `<div class="tiny">No records yet. Pick a mood first.</div>`;
    return;
  }

  recs.slice(0, 80).forEach(r => {
    const row = document.createElement("div");
    row.className = "recordItem";
    row.innerHTML = `
      <div class="recordLeft">
        <div class="recordEmoji">${r.emoji}</div>
        <div>
          <div class="recordMood">${r.mood}</div>
          <div class="recordMeta">${r.date} • ${r.time}</div>
        </div>
      </div>
      <div class="recordMeta">saved</div>
    `;
    list.appendChild(row);
  });
}
function goRecords(backTo){
  renderRecords();
  $("btnBackFromRecords").dataset.back = backTo;
  show("screenRecords");
}

// Options actions
function handleOption(action){
  if (action === "star"){
    setGameMode(true);
    show("screenStar");
    resetStar();
  }
  if (action === "math"){
    setGameMode(true);
    show("screenMath");
    startMathGame();
  }
  if (action === "quote"){
    setGameMode(false);
    show("screenQuote");
    showQuote();
  }
  if (action === "breath"){
    setGameMode(false);
    show("screenBreath");
    stopBreathing();
  }
}

// STAR GAME (easier)
let score = 0;
let starCooldown = false;

function resetStar(){
  score = 0;
  $("score").textContent = score;
  starCooldown = false;
  moveStar();
}
function moveStar(){
  const area = $("starArea").getBoundingClientRect();
  const star = $("star");
  const x = Math.random() * (area.width - 140);
  const y = Math.random() * (area.height - 140);
  star.style.left = x + "px";
  star.style.top = y + "px";
}

$("star").addEventListener("click", () => {
  if (starCooldown) return;
  starCooldown = true;

  score++;
  $("score").textContent = score;

  setTimeout(() => {
    moveStar();
    starCooldown = false;
  }, 450);
});

// QUOTE
function showQuote(){
  const quotes = [
    "Tiny steps are still movement.",
    "Your feelings are data, not destiny.",
    "You don’t have to do everything today.",
    "Be kind to your brain. It’s doing its best.",
    "Progress is not a straight line.",
    "Your future self is quietly cheering for you."
  ];
  $("quoteText").textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// BREATHING
let breathTimeouts = [];
function stopBreathing(){
  breathTimeouts.forEach(t => clearTimeout(t));
  breathTimeouts = [];
  $("breathText").textContent = "Press start and follow the circle.";
  $("circle").style.transform = "scale(1)";
}
function startBreathing(){
  stopBreathing();
  const text = $("breathText");
  const circle = $("circle");

  function inhale(){
    text.textContent = "Inhale (5s)";
    circle.style.transition = "transform 5s ease";
    circle.style.transform = "scale(1.6)";
    breathTimeouts.push(setTimeout(hold, 5000));
  }
  function hold(){
    text.textContent = "Hold (3s)";
    breathTimeouts.push(setTimeout(exhale, 3000));
  }
  function exhale(){
    text.textContent = "Exhale (5s)";
    circle.style.transition = "transform 5s ease";
    circle.style.transform = "scale(1)";
    breathTimeouts.push(setTimeout(inhale, 5000));
  }
  inhale();
}

// QUICK MATH (moves only every 20 seconds)
let mathScore = 0;
let answerAnim = null;
let currentOp = "mix";
let correctAnswer = null;

const MOVE_INTERVAL_MS = 20000; // ✅ 20 seconds

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickOperation(){
  if (currentOp !== "mix") return currentOp;
  const ops = ["+","-","×","÷"];
  return ops[Math.floor(Math.random() * ops.length)];
}

function startMathGame(){
  mathScore = 0;
  $("mathScore").textContent = mathScore;
  generateQuestion();

  if (answerAnim) clearInterval(answerAnim);
  // ✅ move only every 20 seconds
  answerAnim = setInterval(() => {
    document.querySelectorAll("#answers .movingBtn")
      .forEach(btn => moveInsideArea(btn, $("answers")));
  }, MOVE_INTERVAL_MS);
}

function stopMathAnim(){
  if (answerAnim) clearInterval(answerAnim);
  answerAnim = null;
}

function generateQuestion(){
  const op = pickOperation();
  let a,b;

  if (op === "+"){
    a = randInt(1, 20);
    b = randInt(1, 20);
    correctAnswer = a + b;
  } else if (op === "-"){
    a = randInt(5, 30);
    b = randInt(1, a);
    correctAnswer = a - b;
  } else if (op === "×"){
    a = randInt(1, 12);
    b = randInt(1, 12);
    correctAnswer = a * b;
  } else {
    b = randInt(1, 12);
    correctAnswer = randInt(1, 12);
    a = b * correctAnswer;
  }

  $("question").textContent = `${a} ${op} ${b} = ?`;

  const answersDiv = $("answers");
  answersDiv.innerHTML = "";

  const options = [correctAnswer];
  while (options.length < 4){
    let wrong = correctAnswer + randInt(-10, 10);
    if (wrong <= 0) continue;
    if (!options.includes(wrong)) options.push(wrong);
  }
  options.sort(() => Math.random() - 0.5);

  options.forEach(num => {
    const btn = document.createElement("button");
    btn.className = "movingBtn";
    btn.textContent = num;

    btn.onclick = () => {
      if (num === correctAnswer){
        mathScore++;
        $("mathScore").textContent = mathScore;
        $("mathMascot").textContent = "🎉";
        setTimeout(() => $("mathMascot").textContent = "🦉", 450);
      } else {
        $("mathMascot2").textContent = "😵‍💫";
        setTimeout(() => $("mathMascot2").textContent = "🐼", 450);
      }
      generateQuestion();
    };

    answersDiv.appendChild(btn);
    moveInsideArea(btn, answersDiv);
  });
}

function moveInsideArea(el, area){
  const rect = area.getBoundingClientRect();
  const x = Math.random() * (rect.width - 110);
  const y = Math.random() * (rect.height - 55);
  el.style.left = x + "px";
  el.style.top = y + "px";
}

// Wire up buttons
$("btnStart").onclick = () => {
  const val = $("nameInput").value.trim();
  if (!val) return;
  username = val;
  localStorage.setItem("mc_name", username);
  goWelcome();
};

$("btnGoMoods").onclick = () => goMoods();

$("btnLessFx").onclick = () => {
  bgFxOn = !bgFxOn;
  $("btnLessFx").textContent = bgFxOn ? "Less effects" : "More effects";
  if (bgFxOn) startGlobalFX(); else stopGlobalFX();
};

$("btnRecords").onclick = () => goRecords("screenMood");
$("btnOptionsRecords").onclick = () => goRecords("screenOptions");
$("btnOptionsMood").onclick = () => show("screenMood");

$("btnToOptions").onclick = () => goOptions();
$("btnChangeMood").onclick = () => show("screenMood");

$("btnBackFromStar").onclick = () => { setGameMode(false); show("screenOptions"); };
$("btnBackFromQuote").onclick = () => { setGameMode(false); show("screenOptions"); };
$("btnBackFromBreath").onclick = () => { setGameMode(false); show("screenOptions"); };

$("btnBackFromMath").onclick = () => {
  stopMathAnim();
  setGameMode(false);
  show("screenOptions");
};

$("btnBreathStart").onclick = startBreathing;
$("btnBreathStop").onclick = stopBreathing;

$("btnBackFromRecords").onclick = (e) => {
  const back = e.currentTarget.dataset.back || "screenMood";
  show(back);
};

$("btnClearRecords").onclick = () => {
  localStorage.removeItem("mc_records");
  renderRecords();
};

document.querySelectorAll(".bigTile").forEach(btn => {
  btn.addEventListener("click", () => {
    handleOption(btn.dataset.action);
    $("aliveBubble").textContent = "Wheee! 🎉";
    setTimeout(() => $("aliveBubble").textContent = "Pick one!", 900);
  });
});

// Math op buttons
document.querySelectorAll(".mathToolbar .btn").forEach(b => {
  b.addEventListener("click", () => {
    const op = b.dataset.op;
    if (!op) return;
    currentOp = (op === "−") ? "-" : op;
    generateQuestion();
  });
});

$("btnMathStart").onclick = startMathGame;
$("btnMathReset").onclick = () => {
  mathScore = 0;
  $("mathScore").textContent = mathScore;
  generateQuestion();
};

// Init
renderMoodGrid();
startGlobalFX();

if (username){
  $("welcomeTitle").textContent = `Welcome, ${username}!`;
  show("screenWelcome");
} else {
  show("screenName");
}
