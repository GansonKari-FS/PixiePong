// --- Pixi Application ---
const app = new PIXI.Application({
  width: 800,
  height: 600,
  background: 0x001d3d,
});

// Attach Pixi canvas to container
document.getElementById("game-container").appendChild(app.canvas);

// --- Game State ---
let vx = 4;
let vy = 3;
let score = 0;
const totalBorders = 4;
const gameDuration = 60; // seconds
let startTime = null;
let gameStarted = false;
let gameOver = false;

// --- Background Music (provide your own music file at assets/music.mp3) ---
const bgMusic = new Audio("assets/music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.6;

// Ensure assets folder exists note in comments; actual file must be added by user.

// --- Helpers ---
function randomColor() {
  // random bright-ish color
  const r = 128 + Math.floor(Math.random() * 128);
  const g = 128 + Math.floor(Math.random() * 128);
  const b = 128 + Math.floor(Math.random() * 128);
  return (r << 16) | (g << 8) | b;
}

// --- Create Ball ---
const circle = new PIXI.Graphics();
circle.beginFill(0xffffff);
circle.drawCircle(0, 0, 20);
circle.endFill();
circle.x = app.screen.width / 2;
circle.y = app.screen.height / 2;
app.stage.addChild(circle);

// --- Borders with random base + neon colors ---
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

const borders = {};
const neonHitColors = {};
["top", "bottom", "left", "right"].forEach((side) => {
  neonHitColors[side] = randomColor();
});

borders.top = createBorder(0, 0, app.screen.width, 10, randomColor());
borders.bottom = createBorder(
  0,
  app.screen.height - 10,
  app.screen.width,
  10,
  randomColor()
);
borders.left = createBorder(0, 0, 10, app.screen.height, randomColor());
borders.right = createBorder(
  app.screen.width - 10,
  0,
  10,
  app.screen.height,
  randomColor()
);

// Track if each border has been hit at least once
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

// --- UI Text: Score + Timer ---
const scoreText = new PIXI.Text(`Score: 0/${totalBorders}`, {
  fill: 0xffffff,
  fontSize: 24,
  fontFamily: "Trebuchet MS",
});
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

const timerText = new PIXI.Text(`Time: ${gameDuration}`, {
  fill: 0xffffff,
  fontSize: 24,
  fontFamily: "Trebuchet MS",
});
timerText.x = app.screen.width - 180;
timerText.y = 20;
app.stage.addChild(timerText);

// --- Main Game Loop wrapped in a Promise ---
function waitForGameEnd() {
  return new Promise((resolve) => {
    function gameLoop() {
      if (gameOver) return;

      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, gameDuration - elapsed);

      timerText.text = `Time: ${remaining.toFixed(0)}`;

      if (remaining <= 0) {
        gameOver = true;
        app.ticker.remove(gameLoop);
        resolve("timeout");
        return;
      }

      // Move ball
      circle.x += vx;
      circle.y += vy;

      // Collision with borders
      // Top border
      if (circle.y - 20 <= borders.top.y + 10) {
        vy *= -1;
        if (!hitBorders.top) {
          hitBorders.top = true;
          score++;
          scoreText.text = `Score: ${score}/${totalBorders}`;
          glowBorder(borders.top, neonHitColors.top);
        }
      }

      // Bottom border
      if (circle.y + 20 >= borders.bottom.y) {
        vy *= -1;
        if (!hitBorders.bottom) {
          hitBorders.bottom = true;
          score++;
          scoreText.text = `Score: ${score}/${totalBorders}`;
          glowBorder(borders.bottom, neonHitColors.bottom);
        }
      }

      // Left border
      if (circle.x - 20 <= borders.left.x + 10) {
        vx *= -1;
        if (!hitBorders.left) {
          hitBorders.left = true;
          score++;
          scoreText.text = `Score: ${score}/${totalBorders}`;
          glowBorder(borders.left, neonHitColors.left);
        }
      }

      // Right border
      if (circle.x + 20 >= borders.right.x) {
        vx *= -1;
        if (!hitBorders.right) {
          hitBorders.right = true;
          score++;
          scoreText.text = `Score: ${score}/${totalBorders}`;
          glowBorder(borders.right, neonHitColors.right);
        }
      }

      // Victory condition: all borders hit
      if (Object.values(hitBorders).every((hit) => hit)) {
        gameOver = true;
        app.ticker.remove(gameLoop);
        resolve("victory");
      }
    }

    app.ticker.add(gameLoop);
  });
}

// --- Hook up Start Button ---
const startButton = document.getElementById("start-button");

if (startButton) {
  startButton.addEventListener("click", () => {
    if (gameStarted) return;
    gameStarted = true;
    startButton.style.display = "none";

    // Start music (browser will allow because this is in a click handler)
    bgMusic.play().catch(() => {
      console.warn("Background music could not be played automatically.");
    });

    // Start timer + game loop
    startTime = Date.now();

    waitForGameEnd().then((result) => {
      bgMusic.pause();
      if (result === "victory") {
        alert("Victory! You hit all four borders!");
      } else if (result === "timeout") {
        alert(
          "Time's up! Try again to hit all four borders before the timer runs out!"
        );
      }
    });
  });
} else {
  console.warn("Start button not found in the DOM.");
}
