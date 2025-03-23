import * as THREE from "three";

// Cat variables
let cat;
let catSpritesheetTexture;
let currentFrame = 0;
let frameTime = 0;
let animationSpeed = 0.1;
let catAnimationState = "run";

// Cat animation data
const catSpritesheet = {
  frames: [
    { x: 0, y: 0, width: 120, height: 70 },
    { x: 120, y: 0, width: 120, height: 70 },
    { x: 240, y: 0, width: 120, height: 70 },
    { x: 360, y: 0, width: 120, height: 70 },
    { x: 0, y: 70, width: 120, height: 70 },
    { x: 120, y: 70, width: 120, height: 70 },
    { x: 240, y: 70, width: 120, height: 70 },
    { x: 360, y: 70, width: 120, height: 70 },
    { x: 0, y: 140, width: 120, height: 70 },
    { x: 120, y: 140, width: 120, height: 70 },
    { x: 240, y: 140, width: 120, height: 70 },
    { x: 360, y: 140, width: 120, height: 70 },
    { x: 0, y: 210, width: 120, height: 70 },
  ],
  animations: {
    run: [0, 1, 2, 3, 4, 5, 6, 7],
    jump: [8, 9, 10, 11, 12],
  },
};

// Create cat character
export function createCat(scene, onLoaded) {
  // Load cat spritesheet
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    // Use the path relative to public directory
    "/images/oie_WgXXG0sGnbpa-2.png",
    (texture) => {
      catSpritesheetTexture = texture;

      // Create the cat and start animation
      createCatMesh(scene);

      // Call onLoaded callback if provided
      if (onLoaded && typeof onLoaded === "function") {
        onLoaded();
      }
    }
  );
}

// Create the actual cat mesh
function createCatMesh(scene) {
  // Remove any existing cat to prevent duplicates
  if (cat) {
    scene.remove(cat);
  }

  // Create a simple plane for the cat (2D)
  const catGeometry = new THREE.PlaneGeometry(3, 2);

  // Create cat material with spritesheet
  const catMaterial = new THREE.MeshBasicMaterial({
    map: catSpritesheetTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // Create cat mesh
  cat = new THREE.Mesh(catGeometry, catMaterial);
  // Position the cat to stand on top of the sand
  cat.position.set(-3, -7, 0); // Changed from (x:2, y:2) to stand on sand at y=-7
  cat.isInvincible = false; // Add invincibility property

  scene.add(cat);

  // Apply initial frame from spritesheet
  updateCatTextureFrame(0);

  return cat;
}

// Update cat texture coordinates based on current frame
function updateCatTextureFrame(frameIndex) {
  if (!catSpritesheet || !catSpritesheetTexture) return;

  const frame = catSpritesheet.frames[frameIndex];
  if (!frame) return;

  // Calculate UV coordinates
  const textureWidth = 470; // Total width of spritesheet
  const textureHeight = 350; // Total height of spritesheet

  // User's preferred mapping approach
  const u1 = frame.x / textureWidth;
  const v2 = 1 - (frame.y / textureHeight + frame.height / textureHeight); // Invert and adjust
  const u2 = (frame.x + frame.width) / textureWidth;
  const v1 = 1 - frame.y / textureHeight; // Invert y coordinate

  // Apply to geometry UV
  if (cat && cat.geometry) {
    const uvs = cat.geometry.attributes.uv;

    // Apply to all faces of the geometry
    // Bottom left
    uvs.array[0] = u1;
    uvs.array[1] = v1;
    // Bottom right
    uvs.array[2] = u2;
    uvs.array[3] = v1;
    // Top left
    uvs.array[4] = u1;
    uvs.array[5] = v2;
    // Top right
    uvs.array[6] = u2;
    uvs.array[7] = v2;

    uvs.needsUpdate = true;
  }
}

// Update cat animation
export function updateCatAnimation(delta) {
  frameTime += delta;

  if (frameTime >= animationSpeed) {
    frameTime = 0;

    // Get current animation frames
    const frames = catSpritesheet.animations[catAnimationState];

    // Find current frame index in the animation
    let frameIndex = frames.indexOf(currentFrame);

    // Move to next frame or loop back
    frameIndex = (frameIndex + 1) % frames.length;
    currentFrame = frames[frameIndex];

    // Apply the frame
    updateCatTextureFrame(currentFrame);
  }
}

// Update cat position based on mouse controls
export function updateCatPosition(
  mouseControls,
  isGameStarted,
  isGameOver,
  lastMousePosition
) {
  // Map mouse coordinates to game coordinates
  const targetX = mouseControls.getMouseX() * 8;
  const targetY = mouseControls.getMouseY() * 5;

  // Store current mouse position for use when unpausing
  lastMousePosition.x = targetX;
  lastMousePosition.y = targetY;

  if (!isGameStarted) {
    // Before game starts, directly follow mouse position
    cat.position.x = targetX;
    cat.position.y = targetY;
    cat.position.x = THREE.MathUtils.clamp(cat.position.x, -10, 10);
    cat.position.y = THREE.MathUtils.clamp(cat.position.y, -7, 8); // Updated min to -7 so cat stays on sand
  } else if (!isGameOver) {
    // During game, follow mouse with smooth movement
    cat.position.x += (targetX - cat.position.x) * 0.2;
    cat.position.y += (targetY - cat.position.y) * 0.2;

    // Apply boundaries to keep cat on screen and above the sand
    cat.position.x = THREE.MathUtils.clamp(cat.position.x, -10, 10);
    cat.position.y = THREE.MathUtils.clamp(cat.position.y, -7, 8); // Updated min to -7 so cat stays on sand
  }
  // Note: When game is over, we don't update cat position
}

// Make cat temporarily invincible
export function makeInvincible(duration = 1500) {
  if (!cat) return;

  cat.material.opacity = 0.5;
  cat.isInvincible = true;

  setTimeout(() => {
    cat.material.opacity = 1.0;
    cat.isInvincible = false;
  }, duration);
}

// Reset cat position
export function resetCatPosition() {
  if (!cat) return;

  cat.position.set(-3, 2, 0);
  cat.isInvincible = false;
  if (cat.material) {
    cat.material.opacity = 1.0;
  }

  window.catVelocity = 0;
  window.catXVelocity = 0;
}

// Get cat for collision detection
export function getCat() {
  return cat;
}
