import { init, resetHeartsDisplay } from "./game.js";

// Export game functions and variables to global scope for direct HTML access
window.isGameOver = false;
window.isGameStarted = false;
window.isPaused = false; // Flag for game paused state
window.score = 0;
window.highScore = parseInt(localStorage.getItem("highScore")) || 0;
window.animationId = null;
window.catVelocity = 0;
window.catXVelocity = 0; // Add X velocity for horizontal movement

// Set up start button handler - available immediately
window.startGameHandler = function () {
  console.log("Start game clicked via global handler");
  const startScreen = document.getElementById("start-screen");
  if (startScreen) {
    startScreen.style.display = "none";
  }

  // Reset game state and start game
  window.isGameOver = false;
  window.isGameStarted = true;
  window.score = 0;
  // Make sure we display the high score from localStorage
  window.highScore = parseInt(localStorage.getItem("highScore")) || 0;

  // Reset cat position and velocity
  window.catVelocity = 0;
  window.catXVelocity = 0;

  if (typeof window.resetHeartsDisplay === "function") {
    window.resetHeartsDisplay();
  }

  document.getElementById("score").textContent = `Score: ${window.score}`;
  const highScoreElement = document.getElementById("high-score");
  if (highScoreElement) {
    highScoreElement.textContent = `High Score: ${window.highScore}`;
  }

  // Reset grayscale effect if present
  document.body.classList.remove("grayscale");

  // Essential: Actually start the game
  if (window.animationId) {
    cancelAnimationFrame(window.animationId);
    window.animationId = null;
  }

  // Start animation if not already running
  if (typeof window.animate === "function" && !window.animationId) {
    window.animate();
  } else {
    console.error("Animation function not available yet");
    // Try to initialize if animate isn't available yet
    if (typeof init === "function") {
      init();
    }
  }
};

// Make necessary functions available to global scope
import { animate } from "./game.js";
window.animate = animate;
window.resetHeartsDisplay = resetHeartsDisplay;

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");

  // Parse high score from localStorage with a default of 0
  window.highScore = parseInt(localStorage.getItem("highScore")) || 0;
  console.log("High score from localStorage:", window.highScore);

  // Initialize the high score display
  const highScoreElement = document.getElementById("high-score");
  if (highScoreElement) {
    highScoreElement.textContent = `High Score: ${window.highScore}`;
  }

  // Initialize the game
  init();
});
