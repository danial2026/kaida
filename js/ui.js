import { togglePause, resetGame } from "./game.js";

// Setup event listeners for control
export function setupEventListeners(renderer, camera, scene) {
  // Mouse position tracking
  let mouseX = 0;
  let mouseY = 0;

  // Track mouse movement
  window.addEventListener("mousemove", (e) => {
    // Convert mouse position to normalized coordinates (-1 to 1)
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((e.clientY / window.innerHeight) * 2 - 1); // Invert Y-axis
  });

  // Touch support for mobile devices
  window.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        // Convert touch position to normalized coordinates (-1 to 1)
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = -((touch.clientY / window.innerHeight) * 2 - 1); // Invert Y-axis

        // Start game on touch if not started
        if (!window.isGameStarted && !window.isGameOver) {
          const startScreen = document.getElementById("start-screen");
          if (startScreen && startScreen.style.display !== "none") {
            startScreen.style.display = "none";
            window.isGameStarted = true;
            window.score = 0;
            document.getElementById(
              "score"
            ).textContent = `Score: ${window.score}`;
          }
        }
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        // Convert touch position to normalized coordinates (-1 to 1)
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = -((touch.clientY / window.innerHeight) * 2 - 1); // Invert Y-axis
      }
    },
    { passive: true }
  );

  // Key controls - for starting/restarting/pausing
  window.addEventListener("keydown", (e) => {
    // Handle ESC for pause
    if (e.code === "Escape" && window.isGameStarted && !window.isGameOver) {
      togglePause();
      e.preventDefault(); // Prevent default browser action for ESC key
      return;
    }

    if (window.isPaused) {
      // Only listen for ESC to unpause while paused
      if (e.code === "Escape") {
        togglePause();
        e.preventDefault();
      }
      return;
    }
  });

  // Set up buttons
  setupStartButton();
  setupPauseButton();
  setupRestartButton();

  // Handle window resize
  window.addEventListener("resize", () => {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 20;

    // Update orthographic camera on resize
    camera.left = (frustumSize * aspect) / -2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Make sure pause screen stays visible if game is paused
    if (window.isPaused) {
      const pauseScreen = document.getElementById("pause-screen");
      if (pauseScreen) {
        pauseScreen.style.display = "flex";
      }
    }
  });

  // Return mouse position for use in animation loop
  return { getMouseX: () => mouseX, getMouseY: () => mouseY };
}

// Set up start button
export function setupStartButton() {
  console.log("Setting up start button");
  const startBtn = document.getElementById("start-btn");
  if (!startBtn) {
    console.error("Start button not found");
    return;
  }

  // Remove existing event listeners to prevent duplicates
  const newStartBtn = startBtn.cloneNode(true);
  startBtn.parentNode.replaceChild(newStartBtn, startBtn);

  // Add event listener to the button for both click and touch
  const startGame = () => {
    console.log("Start button activated");
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

    document.getElementById("score").textContent = `Score: ${window.score}`;

    // Start animation if not already running
    if (!window.animationId) {
      if (typeof window.animate === "function") {
        window.animate();
      }
    }
  };

  newStartBtn.addEventListener("click", startGame);
  newStartBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    startGame();
  });

  console.log("Start button event listeners added");
}

// Set up resume button
export function setupPauseButton() {
  const resumeBtn = document.getElementById("resume-btn");
  if (!resumeBtn) {
    console.error("Resume button not found");
    return;
  }

  // Remove any existing listeners by cloning and replacing the button
  const newResumeBtn = resumeBtn.cloneNode(true);
  resumeBtn.parentNode.replaceChild(newResumeBtn, resumeBtn);

  // Resume game function
  const resumeGame = (e) => {
    console.log("Resume button activated");
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
    }

    // Resume the game
    if (window.isPaused) {
      togglePause();
    }
  };

  // Add event listeners for both click and touch
  newResumeBtn.addEventListener("click", resumeGame);
  newResumeBtn.addEventListener("touchend", resumeGame);

  console.log("Resume button event listeners added");
}

// Set up try again button
export function setupRestartButton() {
  const tryAgainButton = document.getElementById("try-again");
  if (!tryAgainButton) {
    console.error("Try Again button not found");
    return;
  }

  // Remove existing event listeners
  const newTryAgainButton = tryAgainButton.cloneNode(true);
  tryAgainButton.parentNode.replaceChild(newTryAgainButton, tryAgainButton);

  // Restart game function
  const restartGame = () => {
    const gameOverScreen = document.getElementById("game-over");
    if (gameOverScreen) {
      gameOverScreen.style.display = "none";
    }

    // Reset game state
    window.isGameOver = false;
    window.isGameStarted = true;
    window.score = 0;
    document.getElementById("score").textContent = `Score: ${window.score}`;

    // Remove grayscale effect
    document.body.classList.remove("grayscale");
    document.body.classList.remove("game-over");

    // Reset game
    resetGame();
  };

  // Add event listeners for both click and touch
  newTryAgainButton.addEventListener("click", restartGame);
  newTryAgainButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    restartGame();
  });
}
