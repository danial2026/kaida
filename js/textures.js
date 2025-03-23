import * as THREE from "three";
import { COLORS } from "./game.js";

// Create sandy texture for ground
export function createSandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  // Base sand color
  ctx.fillStyle = "#d4a373";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add noise/texture to sand
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 1;
    const shade = Math.random() * 30;

    // Vary between lighter and darker specs
    if (Math.random() > 0.5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`; // Light specs
    } else {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`; // Dark specs
    }

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add some horizontal lines to simulate sand layers
  for (let i = 0; i < 5; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = `rgba(180, 140, 100, ${Math.random() * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 1); // Repeat texture horizontally

  return texture;
}

// Create cat scratcher texture
export function createScratcherTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  // Main scratcher color (yellowish sisal)
  ctx.fillStyle = "#dfb460"; // Yellowish sisal color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create horizontal rope wrapping lines
  for (let y = 0; y < canvas.height; y += 10) {
    // Dark lines to simulate rope texture
    ctx.fillStyle = "#be8c3c"; // Darker yellow
    ctx.fillRect(0, y, canvas.width, 2);

    // Highlight lines
    ctx.fillStyle = "#f5d78e"; // Lighter yellow
    ctx.fillRect(0, y + 3, canvas.width, 1);
  }

  // Add some vertical texture variation
  ctx.fillStyle = "#be8c3c50"; // Semi-transparent darker yellow
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const height = Math.random() * 50 + 10;
    const width = Math.random() * 5 + 2;
    ctx.fillRect(x, 0, width, height);
  }

  // Add speckles to mimic sisal texture
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 0.5;

    if (Math.random() > 0.5) {
      ctx.fillStyle = "#f5d78e80"; // Light specks
    } else {
      ctx.fillStyle = "#be8c3c80"; // Dark specks
    }

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add edge shadow
  ctx.fillStyle = "#be8c3c"; // Darker yellow
  ctx.fillRect(0, 0, 10, canvas.height); // Left edge
  ctx.fillStyle = "#be8c3c"; // Darker yellow
  ctx.fillRect(canvas.width - 10, 0, 10, canvas.height); // Right edge

  // Border
  ctx.strokeStyle = "#8e682c"; // Dark border
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10); // Repeat texture vertically for tall scratchers

  return texture;
}

// Create sun texture with gradient
export function createSunTexture() {
  // Create a canvas for the sun texture
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Create radial gradient
  const gradient = ctx.createRadialGradient(
    128,
    128,
    0, // Inner circle center, x, y, radius
    128,
    128,
    128 // Outer circle center, x, y, radius
  );

  // Add color stops using the sun colors from COLORS
  gradient.addColorStop(0, "#ffdb99"); // Warm light center
  gradient.addColorStop(0.5, "#ffb347"); // Middle orange
  gradient.addColorStop(1, "#ff8c4200"); // Transparent edge

  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}
