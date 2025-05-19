const wordPools = {
  beginner: [
    "cat", "sun", "dog", "cup", "pen", "fish", "top", "cake", "bell", "frog",
    "star", "box", "hat", "bed", "fan", "log", "duck", "book", "bug", "hop",
    "ball", "run", "bat", "red", "fun"
  ],
  easy: [
    "light", "tree", "rain", "play", "snow", "moon", "jump", "milk", "hand",
    "car", "shoe", "boat", "house", "dress", "game", "road", "cloud", "chair",
    "clock", "brush", "river", "sand", "smile", "leaf", "truck"
  ],
  intermediate: [
    "pencil", "window", "basket", "bottle", "planet", "candle", "mirror",
    "shadow", "rocket", "flower", "garden", "button", "forest", "pillow",
    "camera", "singer", "butter", "jacket", "monkey", "carpet", "engine",
    "puzzle", "spider", "closet", "tunnel"
  ],
  advanced: [
    "control", "object", "science", "library", "pattern", "plastic", "fiction",
    "holiday", "grammar", "journal", "lecture", "blanket", "freedom", "system",
    "calendar", "cabinet", "reaction", "dolphin", "station", "motion", "meaning",
    "tension", "fantasy", "theater", "problem"
  ],
  expert: [
    "education", "exploration", "perception", "distance", "friction", "reaction",
    "persuasion", "conclusion", "dimension", "attention", "validation",
    "confession", "transition", "invention", "foundation", "narration", "precision",
    "reception", "addiction", "negotiation", "solution", "ambition", "connection",
    "infection", "vacation"
  ],
  master: [
    "metaphor", "algorithm", "epiphany", "phenomenon", "hierarchy",
    "symphony", "paradigm", "quarantine", "catastrophe", "philosophy",
    "hypothesis", "infrastructure", "jurisdiction", "barricade", "archetype",
    "synthesis", "dichotomy", "anomaly", "conundrum", "paradox",
    "empathy", "resilience", "eloquence", "nuance", "serendipity"
  ]
};

const levelDescriptions = {
  beginner: "Simple 1-syllable words, easy to rhyme.",
  easy: "Common everyday words with familiar rhymes.",
  intermediate: "Longer or less common words.",
  advanced: "Complex or multi-syllable words.",
  expert: "Challenging words with fewer rhyme options.",
  master: "Vocabulary-rich and creative wordplay required!"
};



// game state variables
let score = 0;
let time = 60;
let timerInterval;
let currentWord = "";
let selectedLevel = "beginner"; // Default level
let currentWordPool = []; 
let streak = 0; // Track the number of correct rhymes in a row
let skipsLeft = 3; // Number of skips available

function updateLevelInfo() {
  const selected = document.getElementById("difficulty").value;
  document.getElementById("level-badge").textContent =
    selected.charAt(0).toUpperCase() + selected.slice(1);
  document.getElementById("level-description").textContent =
    levelDescriptions[selected];
}
document.getElementById("difficulty").addEventListener("change", updateLevelInfo);


// Start the game 
function startGame() {
  selectedLevel = document.getElementById("difficulty").value;

  // Update level info panel
  document.getElementById("level-badge").textContent =
    selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1);
  document.getElementById("level-description").textContent =
    levelDescriptions[selectedLevel];

  // Transition screens
  document.getElementById("welcome-screen").classList.add("d-none");
  const gameScreen = document.getElementById("game-screen");
  gameScreen.classList.remove("d-none");
  gameScreen.classList.add("fade-in");

  score = 0;
  streak = 0;
  skipsLeft = 3;
  document.getElementById("skips-count").textContent = skipsLeft;
  document.getElementById("skip-btn").disabled = false;
  time = 60;
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
  document.getElementById("rhyme-history").innerHTML = "";
  currentWordPool = [...wordPools[selectedLevel]];
  nextWord();
  startTimer();
}




function nextWord() {
  if (currentWordPool.length === 0) {
    document.getElementById("feedback").textContent = "🎉 You've rhymed all words in this level!";
    clearInterval(timerInterval);
    endGame();
    return;
  }

  // Pick a random word from what's left
  const randomIndex = Math.floor(Math.random() * currentWordPool.length);
  currentWord = currentWordPool[randomIndex];

  // Remove it so it doesn’t repeat
  currentWordPool.splice(randomIndex, 1);

  // Update UI
  document.getElementById("base-word").textContent = currentWord;
  document.getElementById("user-input").value = "";
  document.getElementById("feedback").textContent = "";
}



function checkRhyme() {
  const userInput = document.getElementById("user-input").value.toLowerCase();

  if (!userInput || userInput === currentWord) {
    document.getElementById("feedback").textContent = "Enter a different word!";
    return;
  }

  // Helpful tips for inccorrect rhymes
  const wrongMessages = [
  "❌ Not quite. Try a word that sounds like it rhymes!",
  "🧐 Double check the pronunciation — not just spelling.",
  "🔊 Rhyming is about sound! Try a closer match.",
  "🤓 Not all similar-looking words are rhymes."
  ];

  // Check if the user's input rhymes with the current word
  fetch(`https://api.datamuse.com/words?rel_rhy=${currentWord}`)
    .then(response => response.json())
    .then(data => {
      const rhymes = data.map(item => item.word.toLowerCase());

      if (rhymes.includes(userInput)) {
        streak++;
        score += streak;
        document.getElementById("score").textContent = score;
        document.getElementById("streak").textContent = streak;
        document.getElementById("feedback").textContent = `✅ Correct! (+${streak})`;

        // Add to rhyme history
        const list = document.getElementById("rhyme-history");
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.textContent = `${currentWord} → ${userInput}`;
        list.prepend(item);

        nextWord();
      } else {
          streak = 0; // Reset streak on wrong answer
          document.getElementById("streak").textContent = streak;
          document.getElementById("feedback").textContent =
          wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
        }
    })
    .catch(() => {
      document.getElementById("feedback").textContent = "Error checking rhyme. Try again.";
    });  
}

function skipWord() {
  if (skipsLeft > 0) {
    skipsLeft--;
    document.getElementById("skips-count").textContent = skipsLeft;
    nextWord();
    if (skipsLeft === 0) {
      document.getElementById("skip-btn").disabled = true;
    }
  }
}



function startTimer() {
  document.getElementById("timer").textContent = time;

  timerInterval = setInterval(() => {
    time--;
    document.getElementById("timer").textContent = time;

    // 🔁 Update progress bar width
    const percentage = (time / 60) * 100;
    document.getElementById("progress-bar").style.width = percentage + "%";

    if (time <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}


function endGame() {
  document.getElementById("game-screen").classList.add("d-none");
  document.getElementById("end-screen").classList.remove("d-none");
  document.getElementById("final-score").textContent = score;
}

function resetGame() {
  document.getElementById("end-screen").classList.add("d-none");
  document.getElementById("welcome-screen").classList.remove("d-none");

  // Reset game state properly
  score = 0;
  time = 60;
  currentWord = "";
  selectedLevel = "beginner";
  currentWordPool = [];
}

document.getElementById("theme-toggle").addEventListener("change", function () {
  document.body.classList.toggle("dark-mode");
});
