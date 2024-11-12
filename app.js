// app.js

// Ensure Web Speech API is available
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (window.SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "ar-SA"; // Set language to Arabic (Saudi Arabia) for better accuracy
  recognition.interimResults = true; // Show results as the user is speaking
  recognition.continuous = true; // Keeps recognition active indefinitely

  const transcribeBtn = document.getElementById("transcribeBtn");
  const transcriptionDisplay = document.getElementById("transcription");
  const timerDisplay = document.getElementById("timer");

  let isListening = false;
  let startTime;
  let timerInterval;

  // Update timer display function
  function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    timerDisplay.textContent = `Time: ${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }

  // Toggle listening on button click
  transcribeBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      transcribeBtn.textContent = "Start Transcription";
      clearInterval(timerInterval); // Stop the timer
    } else {
      recognition.start();
      transcribeBtn.textContent = "Stop Transcription";
      startTime = Date.now(); // Set the start time
      timerInterval = setInterval(updateTimer, 1000); // Start the timer
    }
    isListening = !isListening;
  });

  // Update transcription display with interim and final results
  recognition.addEventListener("result", (event) => {
    const transcriptArray = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");

    transcriptionDisplay.textContent = transcriptArray;
  });

  // Restart recognition if it stops
  recognition.addEventListener("end", () => {
    if (isListening) recognition.start();
  });
} else {
  // If Web Speech API is unavailable
  alert("Sorry, your browser does not support speech recognition.");
}
