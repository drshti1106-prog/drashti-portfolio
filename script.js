/* =========================================
   MOBILE NAVIGATION
========================================= */

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "×" : "☰";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "☰";
    });
  });
}

/* =========================================
   SCROLL REVEAL ANIMATION
========================================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

/* =========================================
   AUTOMATIC FOOTER YEAR
========================================= */

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================
   DYNAMIC PURPLE-BLUE PARTICLE CURSOR
========================================= */

(() => {
  const canvas = document.querySelector("#cursor-trail");

  if (!canvas) return;

  const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (!supportsFinePointer.matches || prefersReducedMotion.matches) {
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let animationId = null;
  let isVisible = !document.hidden;
  let previousX = null;
  let previousY = null;

  const particles = [];
  const maxParticles = 65;

  const mouse = {
    x: -100,
    y: -100,
    active: false
  };

  // Colors match the portfolio's CSS theme.
  const colors = [
    [167, 139, 250], // #a78bfa
    [113, 199, 255], // #71c7ff
    [197, 163, 255]  // Light purple
  ];

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;

      this.vx = (Math.random() - 0.5) * 1.4;
      this.vy = (Math.random() - 0.5) * 1.4;

      this.life = 1;
      this.decay = 0.012 + Math.random() * 0.018;
      this.radius = 1 + Math.random() * 2;

      this.color =
        colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      this.vx *= 0.97;
      this.vy *= 0.97;

      this.life -= this.decay;

      return this.life > 0;
    }

    draw() {
      const [r, g, b] = this.color;

      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        this.radius * this.life,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(${r}, ${g}, ${b}, ${this.life})`;

      ctx.shadowBlur = 10 * this.life;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;

      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  function createParticles(x, y) {
    // Keep the particle count under control.
    for (let i = 0; i < 2; i++) {
      if (particles.length >= maxParticles) break;

      particles.push(new Particle(x, y));
    }
  }

  function drawCursorGlow() {
    if (!mouse.active) return;

    const gradient = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      30
    );

    gradient.addColorStop(
      0,
      "rgba(167, 139, 250, 0.14)"
    );

    gradient.addColorStop(
      0.5,
      "rgba(113, 199, 255, 0.05)"
    );

    gradient.addColorStop(
      1,
      "rgba(113, 199, 255, 0)"
    );

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 90) {
          const opacity =
            (1 - distance / 90) *
            Math.min(a.life, b.life) *
            0.45;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);

          ctx.strokeStyle =
            `rgba(167, 139, 250, ${opacity})`;

          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    drawCursorGlow();

    // Update particles and remove expired ones.
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update()) {
        particles.splice(i, 1);
      }
    }

    drawConnections();

    particles.forEach((particle) => particle.draw());

    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (isVisible && animationId === null) {
      animationId = requestAnimationFrame(animate);
    }
  }

  function stopAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;

      if (event.pointerType !== "mouse") return;

      // Avoid drawing a long line when the pointer first appears.
      if (previousX === null || previousY === null) {
        previousX = mouse.x;
        previousY = mouse.y;
        return;
      }

      const distance = Math.hypot(
        mouse.x - previousX,
        mouse.y - previousY
      );

      // Add particles along the movement for a smoother trail.
      const steps = Math.min(
        Math.ceil(distance / 8),
        8
      );

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;

        createParticles(
          previousX + (mouse.x - previousX) * t,
          previousY + (mouse.y - previousY) * t
        );
      }

      previousX = mouse.x;
      previousY = mouse.y;

      startAnimation();
    },
    { passive: true }
  );

  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      mouse.active = false;
      previousX = null;
      previousY = null;
    }
  });

  window.addEventListener("blur", () => {
    mouse.active = false;
    previousX = null;
    previousY = null;
  });

  window.addEventListener("focus", () => {
    startAnimation();
  });

  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;

    if (isVisible) {
      startAnimation();
    } else {
      stopAnimation();
    }
  });

  resizeCanvas();
  startAnimation();
})();
