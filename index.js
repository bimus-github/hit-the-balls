const canvas = document.querySelector("canvas");
const scoreEl = document.getElementById("score");
const totalScoreEl = document.getElementById("totalScore");
const startBtn = document.getElementById("start");
const overlay = document.getElementById("overlay");
const speedEl = document.getElementById("speed");
const totalSpeedEl = document.getElementById("totalSpeed");

const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// create projectiles array for player
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let animationId;
let intervalId;
let intervalTime = 1000;
let speedOfEnemies = 1;

function resetProps() {
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  speedOfEnemies = 1;
}

// player
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

// projectile
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// enimies
class Enemies {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// particles
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 0.5;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

// create player in center of canvas with white color
const player = new Player(canvas.width / 2, canvas.height / 2, 20, "white");
player.draw();

function intervalFunction() {
  //  create an enimies in random position on canvas with white color and random velocity in x and y direction with random radius between 10 and 30 in every second
  intervalId = setInterval(() => {
    let x = 0;
    let y = 0;
    const radius = Math.random() * (30 - 10) + 10;
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const angle = Math.atan2(innerHeight / 2 - y, innerWidth / 2 - x);
    const velocity = {
      x: Math.cos(angle) * speedOfEnemies,
      y: Math.sin(angle) * speedOfEnemies,
    };
    enemies.push(new Enemies(x, y, radius, color, velocity));
  }, intervalTime);
}

// animation
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.2)";
  //   clear canvas and redraw
  c.fillRect(0, 0, canvas.width, canvas.height);
  // draw player
  player.draw();

  // draw and update projectiles
  projectiles.forEach((projectile, indexOfProjectile) => {
    projectile.draw();
    projectile.update();

    // remove projectile if it goes off screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(indexOfProjectile, 1);
      }, 0);
    }
  });

  // draw and update enemies
  enemies.forEach((enemy, indexOfEnemy) => {
    enemy.draw();
    enemy.update();

    // check for collision between projectile and enemy
    projectiles.forEach((projectile, indexOfProjectile) => {
      if (
        Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) <
        enemy.radius + projectile.radius
      ) {
        // remove projectile
        projectiles.splice(indexOfProjectile, 1);

        // play sound effect form utils/collapse.m4a
        const shootingSound = new Audio("utils/collapse.m4a");
        shootingSound.play();

        for (let i = 0; i < 10; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        if (enemy.radius - 10 > 10) {
          // create particle
          // increase the enemy radius
          enemy.radius -= 10;
          score += 100;
          if (speedOfEnemies < 2.5) {
            speedOfEnemies += 0.01;
          } else {
            speedOfEnemies += 0.001;
          }
        } else {
          // remove enemy
          enemies.splice(indexOfEnemy, 1);
          score += 250;
          if (speedOfEnemies < 2.5) {
            speedOfEnemies += 0.05;
          } else {
            speedOfEnemies += 0.005;
          }
        }
      }
    });

    // check for collision between player and enemy
    if (
      Math.hypot(player.x - enemy.x, player.y - enemy.y) <
      player.radius + enemy.radius
    ) {
      // end game
      clearInterval(intervalId);
      overlay.style.display = "flex";
      cancelAnimationFrame(animationId);
      totalScoreEl.innerHTML = score;
      totalSpeedEl.innerHTML = speedOfEnemies.toFixed(2);
      resetProps();
    }
  });

  //   draw and update particles
  particles.forEach((particle, indexOfParticle) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(indexOfParticle, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  scoreEl.innerHTML = score;
  speedEl.innerHTML = speedOfEnemies.toFixed(2);
}

canvas.addEventListener("click", (event) => {
  // play audio form utils/shooting.mp3
  const audio = new Audio();
  audio.src = "./utils/shooting.m4a";
  audio.play();

  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

startBtn.addEventListener("click", () => {
  animate();
  intervalFunction();
  overlay.style.display = "none";
});
