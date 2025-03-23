import * as THREE from "three";
import { COLORS, MAX_OBSTACLES, updateHighScore } from "./game.js";
import { getCat } from "./cat.js";
import {
  createSandTexture,
  createScratcherTexture,
  createSunTexture,
} from "./textures.js";

// Game variables
let obstacles = [];
const obstacleSpeed = 0.15;

// Create ground with sandy texture
export function createGround(scene) {
  // Create a sandy texture
  const sandTexture = createSandTexture();

  // Make the ground taller to ensure it fills the bottom of the screen and gives the cat enough space
  const groundGeometry = new THREE.PlaneGeometry(100, 6); // Increased height further for cat to stand on
  const groundMaterial = new THREE.MeshBasicMaterial({
    map: sandTexture,
    color: COLORS.ground,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // Position it lower to make it flush with the bottom of the screen
  ground.position.y = -9; // Keep at -9 for bottom of screen
  scene.add(ground);

  // Add to obstacles for collision detection
  obstacles.push({
    mesh: ground,
    passed: true, // Don't count ground for score
  });
}

// Create a nice gradient sun in the top right
export function createSun(scene) {
  // Create texture from canvas
  const sunTexture = createSunTexture();

  // Create a plane geometry
  const sunGeometry = new THREE.PlaneGeometry(5, 5);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const sun = new THREE.Mesh(sunGeometry, sunMaterial);

  // Position in top right corner, slightly behind to not interfere with gameplay
  sun.position.set(8, 7, -1);

  scene.add(sun);
  return sun;
}

// Create new obstacles (cat scratchers)
export function createObstacle(scene, initialX = 20) {
  // Count how many obstacles we already have (excluding ground)
  let obstacleCount = 0;
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].mesh.position.y !== -9) {
      // Updated from -7 to -9
      obstacleCount++;
    }
  }

  // Don't create more obstacles if we're at the maximum
  if (obstacleCount >= MAX_OBSTACLES) {
    return;
  }

  const gapSize = 6; // Gap between scratchers
  const gapY = Math.random() * 8 - 4; // Random position for the gap

  // Create cat scratcher texture
  const scratcherTexture = createScratcherTexture();

  // Helper function to create a scratcher segment
  function createScratcherSegment(height, y, isTop) {
    const scratcherGeometry = new THREE.PlaneGeometry(2, height);
    const scratcherMaterial = new THREE.MeshBasicMaterial({
      map: scratcherTexture,
      side: THREE.DoubleSide,
    });

    const scratcher = new THREE.Mesh(scratcherGeometry, scratcherMaterial);
    scratcher.position.x = initialX; // Use the provided initialX
    scratcher.position.y = y;

    // Create cap for the scratcher
    const capGeometry = new THREE.PlaneGeometry(2.4, 0.6);
    const capMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.pipeCap, // Darker yellow for caps
      side: THREE.DoubleSide,
    });

    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.z = 0.01; // Slightly in front of the scratcher

    // Position the cap at the end of the scratcher facing the gap
    if (isTop) {
      cap.position.y = -height / 2 + 0.3;
    } else {
      cap.position.y = height / 2 - 0.3;
    }

    scratcher.add(cap);
    scene.add(scratcher);

    return scratcher;
  }

  // Create top scratcher
  const topHeight = 15 + gapY; // Extend beyond the top of the screen
  const topScratcher = createScratcherSegment(
    topHeight,
    gapY + gapSize / 2 + topHeight / 2,
    true
  );

  // Create bottom scratcher
  const bottomHeight = 15 - gapY; // Extend beyond the bottom of the screen
  const bottomScratcher = createScratcherSegment(
    bottomHeight,
    gapY - gapSize / 2 - bottomHeight / 2,
    false
  );

  // Add both scratchers to obstacles array for collision detection
  obstacles.push({
    mesh: topScratcher,
    passed: false,
    originalX: topScratcher.position.x,
  });

  obstacles.push({
    mesh: bottomScratcher,
    passed: false,
    originalX: bottomScratcher.position.x,
  });
}

// Create initial obstacles for the game
export function createInitialObstacles(scene) {
  createObstacle(scene);
}

// Update obstacle positions and check for scoring
export function updateObstacles(scene) {
  // Count active obstacles (excluding ground)
  let activeObstacles = 0;
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].mesh.position.y !== -9) {
      // Updated from -7 to -9
      activeObstacles++;
    }
  }

  const cat = getCat();
  if (!cat) return;

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];

    // Skip ground
    if (obstacle.mesh.position.y === -9) continue; // Updated from -7 to -9

    // Move obstacle and its cap if it has one
    obstacle.mesh.position.x -= obstacleSpeed;
    if (obstacle.cap) {
      obstacle.cap.position.x -= obstacleSpeed;
    }

    // Check if obstacle is passed
    if (!obstacle.passed && obstacle.mesh.position.x < cat.position.x) {
      obstacle.passed = true;
      window.score += 0.5; // Add 0.5 points for each pipe passed (1 full point for each pair)
      document.getElementById("score").textContent = `Score: ${window.score}`;

      // Update high score
      updateHighScore();
    }

    // Remove obstacle if offscreen
    if (obstacle.mesh.position.x < -20) {
      scene.remove(obstacle.mesh);
      if (obstacle.cap) {
        scene.remove(obstacle.cap);
      }
      obstacles.splice(i, 1);
      i--;
    }
  }
}

// Check for collisions using 2D rectangle intersection
export function checkCollisions(loseHeartCallback) {
  const cat = getCat();
  if (!cat) return;

  if (cat.isInvincible) return; // Skip collision check during invincibility

  // Get cat bounds
  const catBounds = {
    x: cat.position.x,
    y: cat.position.y,
    width: 3,
    height: 2,
  };

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i].mesh;

    // Get obstacle bounds - use different sizing based on if it's the ground
    let obstacleBounds;
    if (obstacle.position.y === -9) {
      // Updated from -7 to -9 to match new ground position
      // Ground
      obstacleBounds = {
        x: obstacle.position.x,
        y: obstacle.position.y,
        width: 100,
        height: 4, // Updated from 1 to 4 to match new ground height
      };
    } else {
      // Pipe
      const geometry = obstacle.geometry;
      const parameters = geometry.parameters;
      obstacleBounds = {
        x: obstacle.position.x,
        y: obstacle.position.y,
        width: parameters.width,
        height: parameters.height,
      };
    }

    // Check for rectangle intersection
    if (
      catBounds.x + catBounds.width / 2 >
        obstacleBounds.x - obstacleBounds.width / 2 &&
      catBounds.x - catBounds.width / 2 <
        obstacleBounds.x + obstacleBounds.width / 2 &&
      catBounds.y + catBounds.height / 2 >
        obstacleBounds.y - obstacleBounds.height / 2 &&
      catBounds.y - catBounds.height / 2 <
        obstacleBounds.y + obstacleBounds.height / 2
    ) {
      // Lose a heart on collision
      if (loseHeartCallback && typeof loseHeartCallback === "function") {
        loseHeartCallback();
      }

      // Add a little bounce effect when hitting a pipe
      window.catVelocity = -0.2;

      break;
    }
  }

  // Check for ceiling collision
  if (cat.position.y > 8) {
    if (loseHeartCallback && typeof loseHeartCallback === "function") {
      loseHeartCallback();
    }
  }
}

// Reset obstacles for a new game
export function resetObstacles(scene) {
  // Remove all obstacles except ground
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].mesh.position.y !== -9) {
      // Updated from -7 to -9
      scene.remove(obstacles[i].mesh);
      if (obstacles[i].cap) {
        scene.remove(obstacles[i].cap);
      }
      obstacles.splice(i, 1);
    }
  }
}

// Get obstacles array for other modules
export function getObstacles() {
  return obstacles;
}
