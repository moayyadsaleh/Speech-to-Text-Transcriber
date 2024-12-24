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
const languageSelector = document.getElementById("languageSelector");

// Initialize the Speech Recognition API
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.interimResults = true; // Show interim results
recognition.continuous = true; // Enable continuous listening for improved accuracy

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

// Set language based on user selection
function setLanguage() {
  const selectedLang = languageSelector.value;
  recognition.lang = selectedLang;
  showNotification(`Language set to ${selectedLang}.`, "info");
}

// Stop current transcription if in progress
function stopTranscription() {
  if (isTranscribing) {
    recognition.stop();
    clearInterval(timerInterval);
    isTranscribing = false;
    isPaused = false;
    showNotification("Transcription stopped.", "warning");
  }
}

// Start transcription
transcribeBtn.addEventListener("click", () => {
  if (!isTranscribing && !isPaused) {
    setLanguage(); // Set language before starting
    recognition.start();
    startTimer();
    isTranscribing = true;
    isPaused = false;
    showNotification("Transcription started.", "success");
  }
});

// Pause transcription
pauseBtn.addEventListener("click", () => {
  if (isTranscribing && !isPaused) {
    recognition.stop();
    clearInterval(timerInterval);
    isPaused = true;
    showNotification("Transcription paused.", "info");
  }
});

// Resume transcription
resumeBtn.addEventListener("click", () => {
  if (isTranscribing && isPaused) {
    setLanguage(); // Set language before resuming
    recognition.start();
    startTimer();
    isPaused = false;
    showNotification("Transcription resumed.", "success");
  }
});

// Restart transcription
restartBtn.addEventListener("click", () => {
  stopTranscription();
  transcriptionContent = "";
  transcriptionElement.textContent = "";
  resetTimer();
  showNotification("Transcription restarted.", "info");
});

// Capture transcription results
recognition.onresult = (event) => {
  let interimTranscription = "";
  let finalTranscription = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscription += transcript + " ";
    } else {
      interimTranscription += transcript;
    }
  }

  // Update content correctly: append final and show interim
  transcriptionContent += finalTranscription;

  // Highlight interim transcription and append final transcription normally
  transcriptionElement.innerHTML =
    transcriptionContent +
    `<span class="highlight">${interimTranscription}</span>`;
};

// Stop transcription on end
recognition.onend = () => {
  if (isTranscribing && !isPaused) {
    recognition.start();
    showNotification("Transcription resumed automatically.", "info");
  }
};

// Reset language when it changes
languageSelector.addEventListener("change", () => {
  stopTranscription(); // Stop current transcription
  setLanguage(); // Set the new language
  if (isTranscribing) {
    // Start transcription again if needed
    recognition.start();
    startTimer();
    isTranscribing = true;
    isPaused = false;
    showNotification("Language changed and transcription restarted.", "info");
  }
});

// Download transcription with manual edits
document.getElementById("downloadBtn").addEventListener("click", () => {
  const transcriptionText = transcriptionElement.textContent;
  const blob = new Blob([transcriptionText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transcription.txt";
  a.click();
  URL.revokeObjectURL(url);
  showNotification("Transcription downloaded.", "success");
});

const startRecordingBtn = document.getElementById("startRecordingBtn");
const pauseRecordingBtn = document.getElementById("pauseRecordingBtn");
const resumeRecordingBtn = document.getElementById("resumeRecordingBtn");
const stopRecordingBtn = document.getElementById("stopRecordingBtn");
const restartRecordingBtn = document.getElementById("restartRecordingBtn");
const downloadAudioBtn = document.getElementById("downloadAudioBtn");

let mediaRecorder;
let audioChunks = [];
let audioBlob;

startRecordingBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100, // High-quality audio
      },
    });

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioChunks = [];
      downloadAudioBtn.disabled = false;
      showNotification("Recording stopped. Ready for download.", "success");
    };

    mediaRecorder.start();
    toggleButtons("recording");
    showNotification("Recording started...", "success");
  } catch (error) {
    console.error("Error accessing microphone:", error);
    showNotification("Error accessing microphone.", "error");
  }
});

pauseRecordingBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    toggleButtons("paused");
    showNotification("Recording paused.", "info");
  }
});

resumeRecordingBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    toggleButtons("recording");
    showNotification("Recording resumed.", "success");
  }
});

stopRecordingBtn.addEventListener("click", () => {
  if (
    mediaRecorder &&
    (mediaRecorder.state === "recording" || mediaRecorder.state === "paused")
  ) {
    mediaRecorder.stop();
    toggleButtons("stopped");
    showNotification("Recording stopped.", "warning");
  }
});

restartRecordingBtn.addEventListener("click", () => {
  audioChunks = [];
  toggleButtons("initial");
  showNotification("Recording restarted.", "info");
});

downloadAudioBtn.addEventListener("click", () => {
  if (audioBlob) {
    const audioURL = URL.createObjectURL(audioBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = audioURL;
    downloadLink.download = "recording.wav";
    downloadLink.click();
    showNotification("Audio downloaded.", "success");
  }
});

// Utility to show notifications
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Automatically remove after 3 seconds
}

function toggleButtons(state) {
  switch (state) {
    case "recording":
      startRecordingBtn.disabled = true;
      pauseRecordingBtn.disabled = false;
      resumeRecordingBtn.disabled = true;
      stopRecordingBtn.disabled = false;
      restartRecordingBtn.disabled = false;
      downloadAudioBtn.disabled = true;
      break;
    case "paused":
      startRecordingBtn.disabled = true;
      pauseRecordingBtn.disabled = true;
      resumeRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = false;
      restartRecordingBtn.disabled = false;
      downloadAudioBtn.disabled = true;
      break;
    case "stopped":
      startRecordingBtn.disabled = false;
      pauseRecordingBtn.disabled = true;
      resumeRecordingBtn.disabled = true;
      stopRecordingBtn.disabled = true;
      restartRecordingBtn.disabled = false;
      downloadAudioBtn.disabled = false;
      break;
    case "initial":
      startRecordingBtn.disabled = false;
      pauseRecordingBtn.disabled = true;
      resumeRecordingBtn.disabled = true;
      stopRecordingBtn.disabled = true;
      restartRecordingBtn.disabled = true;
      downloadAudioBtn.disabled = true;
      break;
  }
}

// Initialize buttons to the initial state
toggleButtons("initial");

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  Object.assign(notification.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor:
      type === "success"
        ? "green"
        : type === "error"
        ? "red"
        : type === "warning"
        ? "orange"
        : "blue",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "14px",
    zIndex: 1000,
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
  });

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Automatically remove after 3 seconds
}
