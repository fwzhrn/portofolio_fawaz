// Menampung input seret/keyboard dari DOM untuk dibaca scene 3D di tiap frame.
export class DragController {
  down = false;
  private dx = 0;
  private dy = 0;
  private nx = 0;
  private ny = 0;

  press() {
    this.down = true;
  }

  release() {
    this.down = false;
  }

  drag(dx: number, dy: number) {
    this.dx += dx;
    this.dy += dy;
  }

  nudge(x: number, y: number) {
    this.nx += x;
    this.ny += y;
  }

  // Mengambil input yang terkumpul sejak frame lalu, lalu mengosongkannya.
  consume() {
    const out = {
      down: this.down,
      dx: this.dx,
      dy: this.dy,
      nx: this.nx,
      ny: this.ny,
    };
    this.dx = 0;
    this.dy = 0;
    this.nx = 0;
    this.ny = 0;
    return out;
  }
}
