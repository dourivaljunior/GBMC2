// Fundo animado com lasers + partículas
const c = document.getElementById("bg-canvas");
const ctx = c.getContext("2d");
let W, H, beams, particles;

function resize() {
  W = c.width = window.innerWidth * devicePixelRatio;
  H = c.height = window.innerHeight * devicePixelRatio;
  c.style.width = window.innerWidth + "px";
  c.style.height = window.innerHeight + "px";
  init();
}
window.addEventListener("resize", resize);

const COLORS = ["#ff2bd6", "#00f0ff", "#8a2bff", "#ffe45e", "#39ff14"];

function init() {
  beams = Array.from({ length: 7 }, () => ({
    x: Math.random() * W,
    y: -50,
    angle: (Math.random() * 60 - 30) * (Math.PI / 180),
    len: H * 1.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: 0.002 + Math.random() * 0.004,
    phase: Math.random() * Math.PI * 2,
  }));
  particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    a: Math.random(),
  }));
}

function drawBeam(b, t) {
  const sway = Math.sin(t * b.speed + b.phase) * 0.5;
  const ang = b.angle + sway;
  const x2 = b.x + Math.sin(ang) * b.len;
  const y2 = b.y + Math.cos(ang) * b.len;
  const grad = ctx.createLinearGradient(b.x, b.y, x2, y2);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.15, b.color + "cc");
  grad.addColorStop(0.5, b.color + "55");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function tick(t) {
  ctx.clearRect(0, 0, W, H);
  // partículas
  ctx.shadowBlur = 0;
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    p.a += 0.02;
    ctx.globalAlpha = 0.3 + Math.sin(p.a) * 0.3;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // lasers
  ctx.globalCompositeOperation = "lighter";
  for (const b of beams) drawBeam(b, t);
  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(tick);
}

resize();
requestAnimationFrame(tick);
