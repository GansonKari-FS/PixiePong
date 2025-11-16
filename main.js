// create the app
const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x0000ff, // blue background
});

// append canvas
document.getElementById("game-container").appendChild(app.view);

// the circle
const circle = new PIXI.Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 20);
circle.endFill();
circle.x = app.view.width / 2;
circle.y = app.view.height / 2;
app.stage.addChild(circle);

//  velocity
let vx = 4;
let vy = 3;

// Create border rectangles (STARTING COLORS)
const borders = {
  top: createBorder(0, 0, app.view.width, 10, 0xff0000), // red
  bottom: createBorder(0, app.view.height - 10, app.view.width, 10, 0xffff00), // yellow
  left: createBorder(0, 0, 10, app.view.height, 0x00ff00), // green
  right: createBorder(app.view.width - 10, 0, 10, app.view.height, 0xff00ff), // magenta
};

// show the neon colors when hit by the circle/ball
const neonHitColors = {
  top: 0xffff33, // neon yellow
  bottom: 0x00ffff, // neon cyan
  left: 0x39ff14, // neon lime green
  right: 0xff10f0, // neon hot pink
};

// Track hits
const hitBorders = {
  top: false,
  bottom: false,
  left: false,
  right: false,
};

// Add the borders to the stage
for (let key in borders) {
  app.stage.addChild(borders[key]);
}

// create rectangle border
function createBorder(x, y, w, h, color) {
  const b = new PIXI.Graphics();
  b.beginFill(color);
  b.drawRect(0, 0, w, h);
  b.endFill();
  b.x = x;
  b.y = y;
  return b;
}

function glowBorder(borderGraphic, neonColor) {
  borderGraphic.clear();
  borderGraphic.beginFill(neonColor);
  borderGraphic.drawRect(0, 0, borderGraphic.width, borderGraphic.height);
  borderGraphic.endFill();
}

// when all borders are hit the promise is resolved
function waitForAllBordersHit() {
  return new Promise((resolve) => {
    app.ticker.add(() => {
      circle.x += vx;
      circle.y += vy;

      // Top
      if (circle.y - 20 <= borders.top.y + 10) {
        vy *= -1;
        if (!hitBorders.top) {
          hitBorders.top = true;
          glowBorder(borders.top, neonHitColors.top);
        }
      }

      // Bottom
      if (circle.y + 20 >= borders.bottom.y) {
        vy *= -1;
        if (!hitBorders.bottom) {
          hitBorders.bottom = true;
          glowBorder(borders.bottom, neonHitColors.bottom);
        }
      }

      // Left
      if (circle.x - 20 <= borders.left.x + 10) {
        vx *= -1;
        if (!hitBorders.left) {
          hitBorders.left = true;
          glowBorder(borders.left, neonHitColors.left);
        }
      }

      // Right
      if (circle.x + 20 >= borders.right.x) {
        vx *= -1;
        if (!hitBorders.right) {
          hitBorders.right = true;
          glowBorder(borders.right, neonHitColors.right);
        }
      }
      // Stop the game when all 4 have been hit
      if (Object.values(hitBorders).every((hit) => hit === true)) {
        resolve();
      }
    });
  });
}

waitForAllBordersHit().then(() => {
  app.ticker.stop();
  alert("🏆 Victory! You hit all four borders!");
});
