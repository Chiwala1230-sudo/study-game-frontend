// Sound Service for Perez's Study Game
class SoundService {
  constructor() {
    this.sounds = {};
    this.enabled = true;
  }

  // Load all sounds
  loadSound(name, url) {
    const audio = new Audio(url);
    this.sounds[name] = audio;
  }

  // Play a sound
  play(name) {
    if (!this.enabled) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Sound play error:', e));
    }
  }

  // Toggle sounds on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

const soundService = new SoundService();

// Load sound files - put your sound files in public/sounds/ folder
soundService.loadSound('correct', '/sounds/correct.mp3');
soundService.loadSound('wrong', '/sounds/wrong.mp3');
soundService.loadSound('levelup', '/sounds/levelup.mp3');
soundService.loadSound('click', '/sounds/click.mp3');

export default soundService;