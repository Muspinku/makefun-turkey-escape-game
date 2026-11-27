// Gobble Run — keyboard, mouse and touch input.
// One clear job: turn raw events into the few intents the game understands
// (jump, duck, start, restart, pause, mute) and remember where the pointer
// is, so buttons can be clicked.

export class Input {
  constructor(canvas) {
    this.jumpPressed = false; // edge: true for one frame after a press
    this.jumpHeld = false;
    this.duckHeld = false;
    this.pointerX = 0;
    this.pointerY = 0;
    this.clicked = false; // edge: true for one frame after a click/tap
    this.keys = new Set();

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.keys.add(event.code);
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        this.jumpPressed = true;
        this.jumpHeld = true;
        event.preventDefault();
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        this.duckHeld = true;
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        this.jumpHeld = false;
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        this.duckHeld = false;
      }
    });

    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      this.pointerX = ((event.clientX - rect.left) / rect.width) * canvas.width;
      this.pointerY = ((event.clientY - rect.top) / rect.height) * canvas.height;
    };
    canvas.addEventListener('pointerdown', (event) => {
      point(event);
      this.clicked = true;
      this.jumpPressed = true;
      this.jumpHeld = true;
      event.preventDefault();
    });
    canvas.addEventListener('pointerup', () => {
      this.jumpHeld = false;
    });
    canvas.addEventListener('pointermove', point);
    // Never scroll the page while playing.
    canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
  }

  pressed(code) {
    return this.keys.has(code);
  }

  // The game calls this once per frame; edges live for exactly one frame.
  endFrame() {
    this.jumpPressed = false;
    this.clicked = false;
  }
}
