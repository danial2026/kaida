import * as THREE from "three";
import {
  createCat,
  updateCatAnimation,
  updateCatPosition,
  getCat,
} from "./cat.js";
import {
  createGround,
  createInitialObstacles,
  updateObstacles,
  checkCollisions,
  createSun,
  resetObstacles as resetObstaclesFunc,
} from "./obstacles.js";
import { loadSounds } from "./sound.js";
import { setupEventListeners } from "./ui.js";

// Game variables
let scene, camera, renderer;
let sun;
let frameCount = 0;
let mouseControls;
let catCreated = false;
let lastMousePosition = { x: 0, y: 0 };

// Game settings
const obstacleSpawnRate = 90;
export const MAX_HEARTS = 5;
export const MAX_OBSTACLES = 12;

// Theme colors - cat inspired
export const COLORS = {
  background: 0x1a1a2e, // Dark blue-black
  ground: 0xd4a373, // Sandy color
  pipe: 0xdfb460, // Yellowish for cat scratcher
  pipeCap: 0xbe8c3c, // Darker yellow for top/bottom of scratcher
  score: "#ff9e00", // Orange
  hearts: "#ff5e78", // Pink
  sun: {
    // Colors for the sun gradient
    center: 0xffdb99, // Warm light orange
    middle: 0xffb347, // Medium orange
    edge: 0xff8c42, // Darker orange
  },
};

// Game state
let hearts = MAX_HEARTS;

// Initialize the scene
export function init() {
  // Clear any existing scene
  if (scene) {
    // Remove all objects
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Cancel animation if running
    if (window.animationId) {
      cancelAnimationFrame(window.animationId);
      window.animationId = null;
    }
  }

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.background);

  // Create orthographic camera for 2D rendering
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 20;
  camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  );
  camera.position.z = 10;
  camera.position.y = 0;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.touchAction = "none"; // Enable touch control
  document.body.appendChild(renderer.domElement);

  // Add viewport meta tag for mobile scaling
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName("head")[0].appendChild(meta);
  }

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Full brightness for 2D
  scene.add(ambientLight);

  // Create ground
  createGround(scene);

  // Create the sun in the top right
  sun = createSun(scene);

  // Setup mouse controls first
  mouseControls = setupEventListeners(renderer, camera, scene);

  // Reset hearts display
  resetHeartsDisplay();

  // Load cat spritesheet and create cat
  createCat(scene, () => {
    catCreated = true;

    // Load sounds
    loadSounds();

    // Start animation loop without starting the game
    animate();
  });
}

// Animation loop - export to global scope
export function animate() {
  window.animationId = requestAnimationFrame(animate);

  // Delta time for animation
  const delta = 1 / 60;

  // Check pause screen visibility in case it was changed externally
  if (window.isPaused) {
    const pauseScreen = document.getElementById("pause-screen");
    if (pauseScreen && pauseScreen.style.display !== "flex") {
      pauseScreen.style.display = "flex";
    }
  }

  // Don't update positions if game is paused or game over
  if (!window.isPaused && !window.isGameOver) {
    if (catCreated && mouseControls) {
      updateCatPosition(
        mouseControls,
        window.isGameStarted,
        window.isGameOver,
        lastMousePosition
      );
    }

    if (window.isGameStarted && !window.isGameOver) {
      // Spawn obstacles
      frameCount++;
      if (frameCount % obstacleSpawnRate === 0) {
        createInitialObstacles(scene);
      }

      // Update obstacles
      updateObstacles(scene);

      // Check for collisions
      checkCollisions(loseHeart);
    }

    // Update cat animation only if not game over and not paused
    if (!window.isGameOver) {
      updateCatAnimation(delta);
    }

    // Gently rotate the sun for a chill effect
    if (sun) {
      sun.rotation.z += 0.001;
    }
  }

  // Render scene regardless of pause state to ensure visuals remain updated
  renderer.render(scene, camera);
}

// Update high score if needed
export function updateHighScore() {
  if (window.score > window.highScore) {
    window.highScore = window.score;
    localStorage.setItem("highScore", window.highScore);
    const highScoreElement = document.getElementById("high-score");
    if (highScoreElement) {
      highScoreElement.textContent = `High Score: ${window.highScore}`;
    }
  }
}

// Update hearts display based on current health
function updateHeartsDisplay() {
  for (let i = 1; i <= MAX_HEARTS; i++) {
    const heart = document.getElementById(`heart-${i}`);
    if (heart) {
      if (i <= hearts) {
        heart.classList.remove("lost");
      } else {
        heart.classList.add("lost");
      }
    }
  }
}

// Reset hearts display to show all hearts
export function resetHeartsDisplay() {
  hearts = MAX_HEARTS;
  for (let i = 1; i <= MAX_HEARTS; i++) {
    const heart = document.getElementById(`heart-${i}`);
    if (heart) {
      heart.classList.remove("lost");
    }
  }
}

// Lose a heart and update the display
export function loseHeart() {
  if (hearts > 0) {
    hearts--;

    // Play heart loss sound if available
    if (window.heartLossSound && hearts > 0) {
      window.heartLossSound.currentTime = 0;
      window.heartLossSound.play();
    }

    updateHeartsDisplay();

    // Apply quick flash effect to show damage
    document.body.classList.add("damage-flash");
    setTimeout(() => {
      document.body.classList.remove("damage-flash");
    }, 200);

    // Apply a "bounce" effect
    window.catVelocity = -0.2;
    window.catXVelocity = -window.catXVelocity; // Reverse X direction

    // Check if game over
    if (hearts <= 0) {
      endGame();
    } else {
      // Get cat instance
      const cat = getCat();
      if (!cat) return;

      // Provide brief invincibility after hit
      // TODO: increase to 1.5 seconds when we want to add invincibility
      cat.material.opacity = 0.5;
      cat.isInvincible = true;
      setTimeout(() => {
        cat.material.opacity = 1.0;
        cat.isInvincible = false;
      }, 500);
    }
  }
}

// End game
export function endGame() {
  if (window.isGameOver) return;

  window.isGameOver = true;
  window.isGameStarted = false;

  // Play death sound (cat meow) when the cat collides with obstacles
  if (window.deathSound) {
    window.deathSound.play();
  }

  // Update high score
  updateHighScore();

  // Show game over screen
  document.getElementById("final-score").textContent = `Score: ${Math.floor(
    window.score
  )}`;
  document.getElementById("high-score").textContent = `High Score: ${Math.floor(
    window.highScore
  )}`;
  document.getElementById("game-over").style.display = "flex";
}

// Reset game
export function resetGame() {
  // Reset variables
  window.isGameOver = false;
  window.isPaused = false;
  window.score = 0;
  frameCount = 0;
  resetHeartsDisplay();

  // Reset UI
  document.getElementById("score").textContent = `Score: ${window.score}`;
  document.getElementById("game-over").style.display = "none";

  // Remove all visual effects
  document.body.classList.remove("grayscale");
  document.body.classList.remove("game-over");
  document.body.classList.remove("paused");

  // Get reference to scene and reset obstacles
  if (scene) {
    // Reset obstacles
    resetObstacles(scene);
  }

  // Restart animation if it was canceled
  if (!window.animationId) {
    animate();
  }
}

// Toggle pause state
export function togglePause() {
  window.isPaused = !window.isPaused;

  // Show/hide pause UI
  const pauseScreen = document.getElementById("pause-screen");
  if (pauseScreen) {
    pauseScreen.style.display = window.isPaused ? "flex" : "none";
    pauseScreen.style.zIndex = "1000";
  }

  // If resuming, ensure focus returns to the game canvas
  if (!window.isPaused) {
    if (renderer && renderer.domElement) {
      renderer.domElement.focus();
    }
  }
}

// Reset obstacles - helper function
function resetObstacles(scene) {
  resetObstaclesFunc(scene);
}

// Export scene for other modules to use
export function getScene() {
  return scene;
}
