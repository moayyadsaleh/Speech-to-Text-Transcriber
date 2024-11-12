let isTranscribing = false;
let isPaused = false;
let transcriptionContent = "";
let timerInterval;
let secondsElapsed = 0;
const timerElement = document.getElementById("timer");
const transcriptionElement = document.getElementById("transcription");
const transcribeBtn = document.getElementById("transcribeBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

// Initialize the Speech Recognition API
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "ar-SA"; // Set to Arabic
recognition.interimResults = true;

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    timerElement.textContent = `Time: ${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerElement.textContent = "Time: 0:00";
}

// Start transcription
transcribeBtn.addEventListener("click", () => {
  if (!isTranscribing && !isPaused) {
    recognition.start();
    startTimer();
    isTranscribing = true;
    isPaused = false;
  }
});

// Pause transcription
pauseBtn.addEventListener("click", () => {
  if (isTranscribing && !isPaused) {
    recognition.stop();
    clearInterval(timerInterval);
    isPaused = true;
  }
});

// Resume transcription
resumeBtn.addEventListener("click", () => {
  if (isTranscribing && isPaused) {
    recognition.start();
    startTimer();
    isPaused = false;
  }
});

// Restart transcription
restartBtn.addEventListener("click", () => {
  recognition.stop();
  clearInterval(timerInterval);
  transcriptionContent = "";
  transcriptionElement.textContent = "";
  resetTimer();
  isTranscribing = false;
  isPaused = false;
});

// Capture transcription results
recognition.onresult = (event) => {
  let interimTranscription = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      transcriptionContent += transcript + " ";
    } else {
      interimTranscription += transcript;
    }
  }
  transcriptionElement.textContent =
    transcriptionContent + interimTranscription;
};

// Stop transcription on end
recognition.onend = () => {
  if (isTranscribing && !isPaused) {
    recognition.start();
  }
};

// Download transcription
document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([transcriptionContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transcription.txt";
  a.click();
  URL.revokeObjectURL(url);
});
