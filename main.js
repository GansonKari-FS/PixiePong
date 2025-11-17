// Create Pixi App (v8 syntax)
const app = new PIXI.Application({
  width: 800,
  height: 600,
  background: "blue",
});

// Attach Pixi canvas to container
document.getElementById("game-container").appendChild(app.canvas);

// Create the circle
const circle = new PIXI.Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 20);
circle.endFill();
circle.x = app.screen.width / 2;
circle.y = app.screen.height / 2;
app.stage.addChild(circle);

// velocity
let vx = 4;
let vy = 3;

// Create border
const borders = {
  top: createBorder(0, 0, app.screen.width, 10, 0xff0000),
  bottom: createBorder(
    0,
    app.screen.height - 10,
    app.screen.width,
    10,
    0xffff00
  ),
  left: createBorder(0, 0, 10, app.screen.height, 0x00ff00),
  right: createBorder(
    app.screen.width - 10,
    0,
    10,
    app.screen.height,
    0xff00ff
  ),
};

// Neon colors 
const neonHitColors = {
  top: 0xffff33,
  bottom: 0x00ffff,
  left: 0x39ff14,
  right: 0xff10f0,
};

// Track hits
const hitBorders = {
  top: false,
  bottom: false,
  left: false,
  right: false,
};

// Add borders to stage
for (let key in borders) {
  app.stage.addChild(borders[key]);
}

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

function waitForAllBordersHit() {
  return new Promise((resolve) => {
    app.ticker.add(() => {
      circle.x += vx;
      circle.y += vy;

      if (circle.y - 20 <= borders.top.y + 10) {
        vy *= -1;
        if (!hitBorders.top) {
          hitBorders.top = true;
          glowBorder(borders.top, neonHitColors.top);
        }
      }

      if (circle.y + 20 >= borders.bottom.y) {
        vy *= -1;
        if (!hitBorders.bottom) {
          hitBorders.bottom = true;
          glowBorder(borders.bottom, neonHitColors.bottom);
        }
      }

      if (circle.x - 20 <= borders.left.x + 10) {
        vx *= -1;
        if (!hitBorders.left) {
          hitBorders.left = true;
          glowBorder(borders.left, neonHitColors.left);
        }
      }

      if (circle.x + 20 >= borders.right.x) {
        vx *= -1;
        if (!hitBorders.right) {
          hitBorders.right = true;
          glowBorder(borders.right, neonHitColors.right);
        }
      }

      if (Object.values(hitBorders).every((hit) => hit === true)) {
        resolve();
      }
    });
  });
}

waitForAllBordersHit().then(() => {
  app.ticker.stop();
  alert("Victory! You hit all four borders!");
});
