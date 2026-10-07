<template>
  <canvas ref="canvas" class="nebula-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

type Particle = { x: number; y: number; radius: number; depth: number; phase: number; tint: number };

const canvas = ref<HTMLCanvasElement | null>(null);
let context: CanvasRenderingContext2D | null = null;
let observer: ResizeObserver | null = null;
let motion: MediaQueryList | null = null;
let frame = 0;
let width = 0;
let height = 0;
let particles: Particle[] = [];
let pointerX = 0;
let pointerY = 0;
let driftX = 0;
let driftY = 0;
let reduced = false;
let visible = true;

function random(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function resize() {
  if (!canvas.value || !context) return;
  const bounds = canvas.value.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.value.width = Math.round(width * dpr);
  canvas.value.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(480, Math.max(170, Math.round(width * height / 1900)));
  particles = Array.from({ length: count }, (_, index) => {
    const angle = random(index, 1) * Math.PI * 2;
    const spread = Math.sqrt(random(index, 2));
    return {
      x: Math.cos(angle) * spread,
      y: Math.sin(angle) * spread,
      radius: 0.55 + random(index, 3) * 1.65,
      depth: 0.3 + random(index, 4) * 0.7,
      phase: random(index, 5) * Math.PI * 2,
      tint: random(index, 6),
    };
  });
  draw(0);
}

function draw(time: number) {
  if (!context || !width || !height) return;
  context.clearRect(0, 0, width, height);
  const centerX = width * (width < 700 ? 0.5 : 0.68) + driftX * 32;
  const centerY = height * 0.5 + driftY * 22;
  const radiusX = Math.min(width * 0.39, 440);
  const radiusY = Math.min(height * 0.46, 320);
  const rotation = reduced ? 0 : time * 0.000025;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(-0.23);
  for (let band = 0; band < 4; band += 1) {
    context.beginPath();
    context.ellipse(0, 0, radiusX * (0.53 + band * 0.16), radiusY * (0.48 + band * 0.17), 0, 0, Math.PI * 2);
    context.strokeStyle = `rgba(${band % 2 ? "77, 163, 255" : "38, 217, 199"}, ${0.08 - band * 0.012})`;
    context.lineWidth = 1;
    context.stroke();
  }
  context.restore();

  context.fillStyle = "rgba(38, 121, 139, 0.075)";
  context.beginPath();
  context.ellipse(centerX, centerY, radiusX * 1.1, radiusY, -0.23, 0, Math.PI * 2);
  context.fill();

  for (const particle of particles) {
    const angle = rotation * particle.depth + particle.phase * 0.025;
    const x = particle.x * Math.cos(angle) - particle.y * Math.sin(angle);
    const y = particle.x * Math.sin(angle) + particle.y * Math.cos(angle);
    const px = centerX + x * radiusX + driftX * particle.depth * 20;
    const py = centerY + y * radiusY * 0.78 + driftY * particle.depth * 18;
    const alpha = (0.22 + particle.depth * 0.54) * (reduced ? 1 : 0.88 + Math.sin(time * 0.0012 + particle.phase) * 0.12);
    context.fillStyle = particle.tint < 0.13
      ? `rgba(255, 209, 102, ${alpha})`
      : particle.tint < 0.52
        ? `rgba(77, 163, 255, ${alpha})`
        : `rgba(157, 247, 233, ${alpha})`;
    context.beginPath();
    context.arc(px, py, particle.radius * (0.65 + particle.depth * 0.45), 0, Math.PI * 2);
    context.fill();
  }
}

function animate(time: number) {
  driftX += (pointerX - driftX) * 0.035;
  driftY += (pointerY - driftY) * 0.035;
  draw(time);
  frame = window.requestAnimationFrame(animate);
}

function syncAnimation() {
  window.cancelAnimationFrame(frame);
  frame = 0;
  reduced = motion?.matches ?? false;
  if (reduced || !visible) {
    driftX = 0;
    driftY = 0;
    draw(0);
  } else {
    frame = window.requestAnimationFrame(animate);
  }
}

function onPointerMove(event: PointerEvent) {
  if (reduced || !canvas.value || event.pointerType === "touch") return;
  const bounds = canvas.value.getBoundingClientRect();
  pointerX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
  pointerY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
}

function onVisibilityChange() {
  visible = !document.hidden;
  syncAnimation();
}

onMounted(() => {
  context = canvas.value?.getContext("2d") ?? null;
  if (!canvas.value || !context) return;
  motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  observer = new ResizeObserver(resize);
  observer.observe(canvas.value);
  canvas.value.parentElement?.addEventListener("pointermove", onPointerMove);
  motion.addEventListener("change", syncAnimation);
  document.addEventListener("visibilitychange", onVisibilityChange);
  resize();
  syncAnimation();
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frame);
  observer?.disconnect();
  canvas.value?.parentElement?.removeEventListener("pointermove", onPointerMove);
  motion?.removeEventListener("change", syncAnimation);
  document.removeEventListener("visibilitychange", onVisibilityChange);
});
</script>
