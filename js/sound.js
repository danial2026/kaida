// Export sounds as global variables for easy access
export function loadSounds() {
  // Death sound (cat meow) that plays when the cat collides with obstacles
  window.deathSound = new Audio(
    "assets/sounds/530341__wesleyextreme_gamer__cat-meow.wav"
  );
  window.deathSound.load();

  // Heart loss sound - using the same cat meow sound
  window.heartLossSound = new Audio(
    "assets/sounds/362953__jofae__cat-call-meow.mp3"
  );
  window.heartLossSound.load();
}

// Play death sound
export function playDeathSound() {
  if (window.deathSound) {
    window.deathSound.currentTime = 0;
    window.deathSound.play();
  }
}

// Play heart loss sound
export function playHeartLossSound() {
  if (window.heartLossSound) {
    window.heartLossSound.currentTime = 0;
    window.heartLossSound.play();
  }
}
